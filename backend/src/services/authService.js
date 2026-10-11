const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Administrador, Tendero, Cliente, Tienda, sequelize } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'fiamas_default_secret_jwt_key_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

// Generación de tokens JWT consistentes
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

    let usuario = null;
    let rol = rolRequerido || null;
    let tiendaId = null;

    // A. Si se especificó rol 'admin' o el identificador tiene '@'
    if (rolRequerido === 'admin' || (!rolRequerido && identificador.includes('@'))) {
        const admin = await Administrador.findOne({ where: { email: identificador, activo: true } });
        if (admin && await admin.validarPassword(password)) {
            usuario = admin;
            rol = 'admin';
        }
    }

    // B. Si no se encontró y se pidió tendero o búsqueda en cascada por teléfono
    if (!usuario && (rolRequerido === 'tendero' || !rolRequerido)) {
        const tendero = await Tendero.findOne({ where: { telefono: identificador, activo: true } });
        if (tendero && await tendero.validarPassword(password)) {
            usuario = tendero;
            rol = 'tendero';

            const tienda = await Tienda.findOne({
                where: { tendero_id: tendero.id, activo: true }
            });
            tiendaId = tienda ? tienda.id : null;
        }
    }

    // C. Si no se encontró y se pidió cliente o búsqueda en cascada por teléfono
    if (!usuario && (rolRequerido === 'cliente' || !rolRequerido)) {
        const cliente = await Cliente.findOne({ where: { telefono: identificador, activo: true } });
        if (cliente) {
            if (!cliente.password_hash) {
                const error = new Error('El cliente aún no tiene una contraseña configurada en la aplicación.');
                error.statusCode = 403;
                throw error;
            }

            if (await cliente.validarPassword(password)) {
                usuario = cliente;
                rol = 'cliente';

                // Registrar último acceso
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

    return {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email
    };
};

// 3. REGISTRO DE TENDERO (con Tienda por defecto transaccional)
const registrarTendero = async ({ dni, nombres, apellidos, password, telefono, nombre_tienda }) => {
    if (!dni || !nombres || !apellidos || !telefono || !password) {
        const error = new Error('DNI, nombres, apellidos, teléfono y contraseña son obligatorios.');
        error.statusCode = 400;
        throw error;
    }

    const t = await sequelize.transaction();
    try {
        const existeDni = await Tendero.findOne({ where: { dni } });
        if (existeDni) {
            const error = new Error('Ya existe un tendero con ese DNI.');
            error.statusCode = 400;
            throw error;
        }

        const existeTelefono = await Tendero.findOne({ where: { telefono } });
        if (existeTelefono) {
            const error = new Error('Ya existe un tendero con ese número de teléfono.');
            error.statusCode = 400;
            throw error;
        }

        // Crear tendero
        const nuevoTendero = await Tendero.create({
            dni,
            nombres,
            apellidos,
            password_hash: password,
            telefono
        }, { transaction: t });

        // Crear tienda vinculada con QR token
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

// 4. REGISTRO DE CLIENTE
const registrarCliente = async ({ telefono, nombres, apellidos, password, direccion }) => {
    if (!telefono || !nombres || !apellidos) {
        const error = new Error('Teléfono, nombres y apellidos son obligatorios.');
        error.statusCode = 400;
        throw error;
    }

    const existente = await Cliente.findOne({ where: { telefono } });
    if (existente) {
        const error = new Error('Ya existe un cliente registrado con ese número de teléfono.');
        error.statusCode = 400;
        throw error;
    }

    const cliente = await Cliente.create({
        telefono,
        nombres,
        apellidos,
        password_hash: password || null,
        direccion: direccion || null
    });

    return {
        id: cliente.id,
        telefono: cliente.telefono,
        nombres: cliente.nombres,
        apellidos: cliente.apellidos
    };
};

module.exports = {
    generarToken,
    login,
    registrarAdministrador,
    registrarTendero,
    registrarCliente
};