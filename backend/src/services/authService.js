const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Administrador, Tendero, Cliente } = require('../models');

// ==========================================
// Generación de tokens JWT
// ==========================================
const generarToken = (usuario, rol) => {
    return jwt.sign(
        { id: usuario.id, rol: rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// ==========================================
// LOGIN general (admin / tendero / cliente)
// ==========================================
exports.login = async (identifier, password, rolRequerido) => {
    let usuario = null;
    let rolEncontrado = rolRequerido;

    // ------------------------------------------
    // ADMIN: sigue usando email (web)
    // ------------------------------------------
    if (rolRequerido === 'admin') {
        usuario = await Administrador.findOne({ where: { email: identifier } });
    }

    // ------------------------------------------
    // TENDERO: busca por DNI, teléfono o email (app)
    // ------------------------------------------
    else if (rolRequerido === 'tendero') {
        usuario = await Tendero.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { dni: identifier },
                    { telefono: identifier },
                ],
            },
        });
    }

    // ------------------------------------------
    // CLIENTE: busca por email o teléfono
    // ------------------------------------------
    else if (rolRequerido === 'cliente') {
        usuario = await Cliente.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { telefono: identifier },
                ],
            },
        });
    }

    // ------------------------------------------
    // SIN ROL: búsqueda en cascada (admin → tendero → cliente)
    // ------------------------------------------
    else {
        // Primero busca admin por email
        usuario = await Administrador.findOne({ where: { email: identifier } });
        if (usuario) {
            rolEncontrado = 'admin';
        } else {
            // Luego busca tendero por email, DNI o teléfono
            usuario = await Tendero.findOne({
                where: {
                    [Op.or]: [
                        { email: identifier },
                        { dni: identifier },
                        { telefono: identifier },
                    ],
                },
            });
            if (usuario) {
                rolEncontrado = 'tendero';
            } else {
                // Finalmente busca cliente por email o teléfono
                usuario = await Cliente.findOne({
                    where: {
                        [Op.or]: [
                            { email: identifier },
                            { telefono: identifier },
                        ],
                    },
                });
                if (usuario) rolEncontrado = 'cliente';
            }
        }
    }

    // ------------------------------------------
    // Validaciones
    // ------------------------------------------
    if (!usuario) {
        throw new Error('Credenciales inválidas');
    }

    if (usuario.activo === false) {
        throw new Error('Usuario inactivo');
    }

    if (rolEncontrado === 'cliente' && usuario.bloqueado) {
        throw new Error('Usuario bloqueado');
    }

    const isMatch = await usuario.validarPassword(password);
    if (!isMatch) {
        throw new Error('Credenciales inválidas');
    }

    // Actualizar último acceso
    if (usuario.ultimo_acceso !== undefined) {
        usuario.ultimo_acceso = new Date();
        await usuario.save({ hooks: false });
    }

    const token = generarToken(usuario, rolEncontrado);

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre || usuario.nombres,
            email: usuario.email,
            rol: rolEncontrado,
        },
    };
};

// ==========================================
// REGISTRO: Administrador
// ==========================================
exports.registrarAdministrador = async (datos) => {
    const existe = await Administrador.findOne({ where: { email: datos.email } });
    if (existe) throw new Error('El email ya está registrado');

    const admin = await Administrador.create({
        nombre: datos.nombre,
        email: datos.email,
        password_hash: datos.password,
        telefono: datos.telefono,
    });

    return { id: admin.id, email: admin.email };
};

// ==========================================
// REGISTRO: Tendero (app)
// El email se auto-genera desde el DNI si no viene
// ==========================================
exports.registrarTendero = async (datos) => {
    // Si no viene email, lo generamos a partir del DNI
    const email = datos.email || `${datos.dni}@tendero.fiamas.app`;

    const existeEmail = await Tendero.findOne({ where: { email } });
    if (existeEmail) throw new Error('El email ya está registrado');

    const existeDni = await Tendero.findOne({ where: { dni: datos.dni } });
    if (existeDni) throw new Error('El DNI ya está registrado');

    const tendero = await Tendero.create({
        dni: datos.dni,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        email: email,
        password_hash: datos.password,
        telefono: datos.telefono,
    });

    return { id: tendero.id, email: tendero.email };
};

// ==========================================
// REGISTRO: Cliente
// ==========================================
exports.registrarCliente = async (datos) => {
    const existeEmail = await Cliente.findOne({ where: { email: datos.email } });
    if (existeEmail && datos.email) throw new Error('El email ya está registrado');

    const cliente = await Cliente.create({
        tienda_id: datos.tienda_id || null,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        email: datos.email,
        telefono: datos.telefono,
        password_hash: datos.password,
        dni: datos.dni,
        direccion: datos.direccion,
    });

    return { id: cliente.id, email: cliente.email };
};