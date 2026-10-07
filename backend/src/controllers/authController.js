const { Administrador, Tendero, Cliente, Tienda, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Para generar el qr_token


// 1. LOGIN INTELIGENTE (v6)

const login = async (req, res) => {
    try {
        const { identificador, password } = req.body;
        let usuarioEncontrado = null;
        let rol = null;
        let payload = {};

        // 1️ Intentar buscar como ADMINISTRADOR (usa email)
        usuarioEncontrado = await Administrador.findOne({
            where: { email: identificador, activo: true }
        });
        if (usuarioEncontrado && await usuarioEncontrado.validarPassword(password)) {
            rol = 'admin';
            payload = { id: usuarioEncontrado.id, nombre: usuarioEncontrado.nombre, rol };
        }

        // 2️ Intentar buscar como TENDERO (usa teléfono)
        if (!usuarioEncontrado) {
            usuarioEncontrado = await Tendero.findOne({
                where: { telefono: identificador, activo: true }
            });
            if (usuarioEncontrado && await usuarioEncontrado.validarPassword(password)) {
                rol = 'tendero';
                const tienda = await Tienda.findOne({
                    where: { tendero_id: usuarioEncontrado.id, activo: true }
                });
                payload = {
                    id: usuarioEncontrado.id,
                    nombre: usuarioEncontrado.nombres,
                    rol,
                    tienda_id: tienda ? tienda.id : null
                };
            }
        }

        // 3️ Intentar buscar como CLIENTE (usa teléfono)
        if (!usuarioEncontrado) {
            usuarioEncontrado = await Cliente.findOne({
                where: { telefono: identificador, activo: true }
            });
            if (usuarioEncontrado && usuarioEncontrado.password_hash && await usuarioEncontrado.validarPassword(password)) {
                rol = 'cliente';
                payload = { id: usuarioEncontrado.id, nombre: usuarioEncontrado.nombres, rol };
            }
        }

        if (!usuarioEncontrado) {
            return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo.' });
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'tu_clave_secreta_temporal',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            msg: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: payload.id,
                nombre: payload.nombre,
                rol: payload.rol,
                tienda_id: payload.tienda_id || null
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor al intentar iniciar sesión.' });
    }
};

// 2. REGISTRO DE ADMINISTRADOR

const registerAdmin = async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        const nuevoAdmin = await Administrador.create({
            nombre,
            email,
            password_hash: password, // El hook del modelo lo encriptará automáticamente
            telefono
        });

        res.status(201).json({
            msg: 'Administrador registrado exitosamente',
            id: nuevoAdmin.id
        });
    } catch (error) {
        console.error('Error al registrar admin:', error);
        res.status(500).json({ error: 'Error al registrar administrador', detalle: error.message });
    }
};


// 3. REGISTRO DE TENDERO (Crea Tendero + Tienda)

const registerTendero = async (req, res) => {
    const t = await sequelize.transaction(); // Transacción para garantizar consistencia
    try {
        const { dni, nombres, apellidos, email, password, telefono, nombre_tienda } = req.body;

        // 1. Crear el tendero
        const nuevoTendero = await Tendero.create({
            dni,
            nombres,
            apellidos,
            email,
            password_hash: password,
            telefono
        }, { transaction: t });

        // 2. Crear su tienda por defecto con un QR token único
        await Tienda.create({
            tendero_id: nuevoTendero.id,
            nombre: nombre_tienda || `Tienda de ${nombres}`,
            telefono: telefono,
            qr_token: crypto.randomUUID(), // Genera un UUID v4 único para el código QR
            qr_activo: true,
            activo: true
        }, { transaction: t });

        await t.commit(); // Confirmar cambios

        res.status(201).json({
            msg: 'Tendero y tienda registrados exitosamente',
            tendero_id: nuevoTendero.id
        });
    } catch (error) {
        await t.rollback(); // Deshacer si algo falla
        console.error('Error al registrar tendero:', error);
        res.status(500).json({ error: 'Error al registrar tendero', detalle: error.message });
    }
};

// ==========================================
// 4. REGISTRO DE CLIENTE
// ==========================================
const registerCliente = async (req, res) => {
    try {
        const { telefono, nombres, apellidos, password, direccion } = req.body;

        const nuevoCliente = await Cliente.create({
            telefono,
            nombres,
            apellidos,
            password_hash: password || null, // Opcional si aún no tiene contraseña
            direccion
        });

        res.status(201).json({
            msg: 'Cliente registrado exitosamente. Ahora puede vincularse a una tienda.',
            id: nuevoCliente.id
        });
    } catch (error) {
        console.error('Error al registrar cliente:', error);
        res.status(500).json({ error: 'Error al registrar cliente', detalle: error.message });
    }
};

// ==========================================
// EXPORTACIONES
// ==========================================
module.exports = {
    login,
    registerAdmin,
    registerTendero,
    registerCliente
};