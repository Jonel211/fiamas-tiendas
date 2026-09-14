const jwt = require('jsonwebtoken');
const { Administrador, Tendero, Cliente } = require('../models');

// Generacion de tokens
const generarToken = (usuario, rol) => {
    return jwt.sign(
        { id: usuario.id, rol: rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Validacion de inicio de sesion para todos los usuarios
exports.login = async (email, password, rolRequerido) => {
    let usuario = null;
    let rolEncontrado = rolRequerido;

    if (rolRequerido === 'admin') {
        usuario = await Administrador.findOne({ where: { email } });
    } else if (rolRequerido === 'tendero') {
        usuario = await Tendero.findOne({ where: { email } });
    } else if (rolRequerido === 'cliente') {
        usuario = await Cliente.findOne({ where: { email } });
    } else {
        usuario = await Administrador.findOne({ where: { email } });
        if (usuario) {
            rolEncontrado = 'admin';
        } else {
            usuario = await Tendero.findOne({ where: { email } });
            if (usuario) {
                rolEncontrado = 'tendero';
            } else {
                usuario = await Cliente.findOne({ where: { email } });
                if (usuario) rolEncontrado = 'cliente';
            }
        }
    }

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
            rol: rolEncontrado
        }
    };
};

// Registro de administradores
exports.registrarAdministrador = async (datos) => {
    const existe = await Administrador.findOne({ where: { email: datos.email } });
    if (existe) throw new Error('El email ya está registrado');

    const admin = await Administrador.create({
        nombre: datos.nombre,
        email: datos.email,
        password_hash: datos.password,
        telefono: datos.telefono
    });

    return { id: admin.id, email: admin.email };
};

// Registro de tenderos
exports.registrarTendero = async (datos) => {
    const existeEmail = await Tendero.findOne({ where: { email: datos.email } });
    if (existeEmail) throw new Error('El email ya está registrado');

    const existeDni = await Tendero.findOne({ where: { dni: datos.dni } });
    if (existeDni) throw new Error('El DNI ya está registrado');

    const tendero = await Tendero.create({
        dni: datos.dni,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        email: datos.email,
        password_hash: datos.password,
        telefono: datos.telefono
    });

    return { id: tendero.id, email: tendero.email };
};

// Registro de clientes
exports.registrarCliente = async (datos) => {
    const existeEmail = await Cliente.findOne({ where: { email: datos.email } });
    if (existeEmail && datos.email) throw new Error('El email ya está registrado');

    // tienda_id puede ser null
    const cliente = await Cliente.create({
        tienda_id: datos.tienda_id || null,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        email: datos.email,
        telefono: datos.telefono,
        password_hash: datos.password,
        dni: datos.dni,
        direccion: datos.direccion
    });

    return { id: cliente.id, email: cliente.email };
};
