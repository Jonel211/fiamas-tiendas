const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Administrador, Tendero, Cliente, ClienteTienda, Tienda, sequelize } = require('../models');

// Sin valor por defecto: si falta la variable, el servidor no arranca.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Falta la variable de entorno JWT_SECRET.');
}
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

const generarToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// 1. LOGIN UNIFICADO E INTELIGENTE
const login = async ({ identificador, password, rolRequerido }) => {
    if (!password) {
        const error = new Error('Se requiere la contraseña.');
        error.statusCode = 400;
        throw error;
    }

    if (!identificador) {
        const error = new Error('Se requiere email o teléfono para iniciar sesión.');
        error.statusCode = 400;
        throw error;
    }

    const id = String(identificador).trim();

    let usuario = null;
    let rol = rolRequerido || null;
    let tiendaId = null;

    // A. Administrador
    if (rolRequerido === 'admin' || (!rolRequerido && id.includes('@'))) {
        const admin = await Administrador.findOne({ where: { email: id, activo: true } });
        if (admin && await admin.validarPassword(password)) {
            usuario = admin;
            rol = 'admin';
        }
    }

    // B. Tendero (por teléfono o DNI)
    let tenderoEncontrado = null;
    if (!usuario && (rolRequerido === 'tendero' || !rolRequerido)) {
        tenderoEncontrado = await Tendero.findOne({
            where: {
                [Op.or]: [{ telefono: id }, { dni: id }],
                activo: true
            }
        });
        if (tenderoEncontrado) {
            if (await tenderoEncontrado.validarPassword(password)) {
                usuario = tenderoEncontrado;
                rol = 'tendero';

                // Tienda por defecto: la más antigua (orden estable).
                const tienda = await Tienda.findOne({
                    where: { tendero_id: tenderoEncontrado.id, activo: true },
                    order: [['creado_en', 'ASC']]
                });
                tiendaId = tienda ? tienda.id : null;
            }
        }
    }

    // C. Cliente (por teléfono). Si el teléfono pertenece a un tendero con otra
    //    contraseña, NO se permite entrar como cliente.
    if (!usuario && !tenderoEncontrado && (rolRequerido === 'cliente' || !rolRequerido)) {
        const cliente = await Cliente.findOne({ where: { telefono: id, activo: true } });
        if (cliente) {
            if (!cliente.password_hash) {
                const error = new Error('Aún no activaste tu cuenta. Regístrate con tu número de celular.');
                error.statusCode = 403;
                throw error;
            }

            if (await cliente.validarPassword(password)) {
                usuario = cliente;
                rol = 'cliente';
                await cliente.update({ ultimo_acceso: new Date() });
            }
        }
    }

    if (!usuario) {
        const error = new Error('Credenciales inválidas. Verifica tu email/teléfono y contraseña.');
        error.statusCode = 401;
        throw error;
    }

    const nombreCompleto = usuario.nombre || `${usuario.nombres} ${usuario.apellidos}`.trim();
    const payload = {
        id: usuario.id,
        nombre: nombreCompleto,
        rol,
        tienda_id: tiendaId
    };

    const token = generarToken(payload);

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: nombreCompleto,
            telefono: usuario.telefono,
            email: usuario.email || undefined,
            rol,
            tienda_id: tiendaId
        }
    };
};

// 2. REGISTRO DE ADMINISTRADOR
const registrarAdministrador = async ({ nombre, email, password, telefono }) => {
    if (!nombre || !email || !password) {
        const error = new Error('Nombre, email y contraseña son obligatorios.');
        error.statusCode = 400;
        throw error;
    }

    const existente = await Administrador.findOne({ where: { email } });
    if (existente) {
        const error = new Error('Ya existe un administrador con ese email.');
        error.statusCode = 400;
        throw error;
    }

    const admin = await Administrador.create({
        nombre,
        email,
        password_hash: password,
        telefono: telefono || null
    });

    return { id: admin.id, nombre: admin.nombre, email: admin.email };
};

// 3. REGISTRO DE TENDERO (con tienda por defecto, transaccional)
const registrarTendero = async ({ dni, nombres, apellidos, password, telefono, nombre_tienda }) => {
    if (!dni || !nombres || !apellidos || !telefono || !password) {
        const error = new Error('DNI, nombres, apellidos, teléfono y contraseña son obligatorios.');
        error.statusCode = 400;
        throw error;
    }

    const t = await sequelize.transaction();
    try {
        const existeDni = await Tendero.findOne({ where: { dni }, transaction: t });
        if (existeDni) {
            const error = new Error('Ya existe un tendero con ese DNI.');
            error.statusCode = 400;
            throw error;
        }

        const existeTelefono = await Tendero.findOne({ where: { telefono }, transaction: t });
        if (existeTelefono) {
            const error = new Error('Ya existe un tendero con ese número de teléfono.');
            error.statusCode = 400;
            throw error;
        }

        const nuevoTendero = await Tendero.create({
            dni,
            nombres,
            apellidos,
            password_hash: password,
            telefono
        }, { transaction: t });

        const nuevaTienda = await Tienda.create({
            tendero_id: nuevoTendero.id,
            nombre: nombre_tienda || `Tienda de ${nombres}`,
            telefono: telefono,
            qr_token: crypto.randomUUID(),
            qr_activo: true,
            activo: true
        }, { transaction: t });

        await t.commit();

        return {
            tendero_id: nuevoTendero.id,
            tienda_id: nuevaTienda.id,
            telefono: nuevoTendero.telefono,
            nombre_tienda: nuevaTienda.nombre
        };
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

// 4. PRE-REGISTRO DE CLIENTE (autocompleta nombres por teléfono)
const consultarPreRegistro = async (telefonoRaw) => {
    const telefono = String(telefonoRaw || '').trim();
    if (!/^\d{9}$/.test(telefono)) {
        const error = new Error('El teléfono debe tener 9 dígitos.');
        error.statusCode = 400;
        throw error;
    }

    const cliente = await Cliente.findOne({
        where: { telefono, activo: true },
        attributes: ['id', 'nombres', 'apellidos', 'password_hash']
    });

    if (!cliente) return { encontrado: false };
    if (cliente.password_hash) return { encontrado: false, ya_registrado: true };

    const vinculos = await ClienteTienda.count({
        where: { cliente_id: cliente.id, activo: true }
    });
    if (vinculos === 0) return { encontrado: false };

    return {
        encontrado: true,
        nombres: cliente.nombres,
        apellidos: cliente.apellidos
    };
};

// 5. REGISTRO DE CLIENTE (activa la cuenta creada por el tendero)
const registrarCliente = async ({ telefono: telefonoRaw, password }) => {
    const telefono = String(telefonoRaw || '').trim();

    if (!/^\d{9}$/.test(telefono)) {
        const error = new Error('El teléfono debe tener 9 dígitos.');
        error.statusCode = 400;
        throw error;
    }
    if (!password || password.length < 6) {
        const error = new Error('La contraseña debe tener al menos 6 caracteres.');
        error.statusCode = 400;
        throw error;
    }

    const cliente = await Cliente.findOne({ where: { telefono, activo: true } });

    if (!cliente) {
        const error = new Error('Tu tienda aún no te ha registrado. Pídele que te agregue.');
        error.statusCode = 404;
        throw error;
    }
    if (cliente.password_hash) {
        const error = new Error('Ya tienes una cuenta. Inicia sesión.');
        error.statusCode = 409;
        throw error;
    }

    const vinculos = await ClienteTienda.count({
        where: { cliente_id: cliente.id, activo: true }
    });
    if (vinculos === 0) {
        const error = new Error('No estás vinculado a ninguna tienda.');
        error.statusCode = 403;
        throw error;
    }

    // El hook beforeUpdate del modelo Cliente hashea la contraseña al guardar
    cliente.password_hash = password;
    cliente.actualizado_en = new Date();
    await cliente.save();

    return {
        cliente: {
            id: cliente.id,
            telefono: cliente.telefono,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos
        }
    };
};

const restablecerPassword = async ({ identificador, nuevaPassword }) => {
    const { Tendero, Cliente } = require('../models'); 
    const { Op } = require('sequelize');
    const bcrypt = require('bcrypt'); // O la librería que uses para hashear

    // 1. Buscar si es un Tendero
    let usuario = await Tendero.findOne({
        where: {
            [Op.or]: [
                { telefono: identificador },
                { email: identificador } // Si usas email como identificador
            ]
        }
    });

    // 2. Si no es Tendero, buscar si es Cliente
    if (!usuario) {
        usuario = await Cliente.findOne({
            where: {
                [Op.or]: [
                    { telefono: identificador },
                    { email: identificador }
                ]
            }
        });
    }

    // 3. Si no se encuentra en ninguno, lanzar error
    if (!usuario) {
        const error = new Error('Usuario no encontrado con ese identificador');
        error.statusCode = 404;
        throw error;
    }

    // 4. Hashear la nueva contraseña y guardarla
    const salt = await bcrypt.genSalt(10);
    usuario.password_hash = await bcrypt.hash(nuevaPassword, salt);
    
    await usuario.save();

    return { msg: 'Contraseña actualizada correctamente' };
};

module.exports = {
    generarToken,
    login,
    registrarAdministrador,
    registrarTendero,
    consultarPreRegistro,
    registrarCliente,
    restablecerPassword
};