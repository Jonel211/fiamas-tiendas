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
    // ADMIN: usa email (web)
    // ------------------------------------------
    if (rolRequerido === 'admin') {
        usuario = await Administrador.findOne({ where: { email: identifier, activo: true } });
    }
    // ------------------------------------------
    // TENDERO: busca exclusivamente por teléfono (app)
    // ------------------------------------------
    else if (rolRequerido === 'tendero') {
        usuario = await Tendero.findOne({
            where: { telefono: identifier, activo: true }
        });
    }
    // ------------------------------------------
    // CLIENTE: busca exclusivamente por teléfono
    // ------------------------------------------
    else if (rolRequerido === 'cliente') {
        usuario = await Cliente.findOne({
            where: { telefono: identifier, activo: true }
        });
    }
    // ------------------------------------------
    // SIN ROL: búsqueda inteligente en cascada
    // ------------------------------------------
    else {
        // 1. Si parece un email, busca en Admin
        if (identifier.includes('@')) {
            usuario = await Administrador.findOne({ where: { email: identifier, activo: true } });
            if (usuario) rolEncontrado = 'admin';
        }

        // 2. Si no es admin, busca en Tendero por teléfono
        if (!usuario) {
            usuario = await Tendero.findOne({ where: { telefono: identifier, activo: true } });
            if (usuario) rolEncontrado = 'tendero';
        }

        // 3. Si no es tendero, busca en Cliente por teléfono
        if (!usuario) {
            usuario = await Cliente.findOne({ where: { telefono: identifier, activo: true } });
            if (usuario) rolEncontrado = 'cliente';
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

    const isMatch = await usuario.validarPassword(password);
    if (!isMatch) {
        throw new Error('Credenciales inválidas');
    }

    // Actualizar último acceso (si el campo existe en el modelo)
    if (usuario.ultimo_acceso !== undefined) {
        usuario.ultimo_acceso = new Date();
        await usuario.save({ hooks: false });
    }

    const token = generarToken(usuario, rolEncontrado);

    return {
        token,
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre || `${usuario.nombres} ${usuario.apellidos}`.trim(),
            telefono: usuario.telefono,
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
// SIN email, solo DNI y Teléfono
// ==========================================
exports.registrarTendero = async (datos) => {
    const existeDni = await Tendero.findOne({ where: { dni: datos.dni } });
    if (existeDni) throw new Error('El DNI ya está registrado');

    const existeTelefono = await Tendero.findOne({ where: { telefono: datos.telefono } });
    if (existeTelefono) throw new Error('El número de teléfono ya está registrado');

    const tendero = await Tendero.create({
        dni: datos.dni,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        password_hash: datos.password,
        telefono: datos.telefono,
    });

    return { id: tendero.id, telefono: tendero.telefono };
};

// ==========================================
// REGISTRO: Cliente
// SIN email, solo Teléfono
// ==========================================
exports.registrarCliente = async (datos) => {
    const existeTelefono = await Cliente.findOne({ where: { telefono: datos.telefono } });
    if (existeTelefono) throw new Error('El número de teléfono ya está registrado');

    const cliente = await Cliente.create({
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        telefono: datos.telefono,
        password_hash: datos.password || null,
        direccion: datos.direccion || null,
    });

    return { id: cliente.id, telefono: cliente.telefono };
};