const { Administrador, Tendero, Cliente, Tienda, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ==========================================
// 1. LOGIN INTELIGENTE (v6) - CORREGIDO
// ==========================================
const login = async (req, res) => {
    try {
        // Acepta tanto "identificador" como "email" o "telefono" desde el frontend
        const { identificador, email, telefono, password } = req.body;

        // Validar que tengamos contraseña
        if (!password) {
            return res.status(400).json({ error: 'Se requiere la contraseña.' });
        }

        // Determinar el identificador (email para admin, teléfono para tendero/cliente)
        const identificadorUsar = identificador || email || telefono;

        if (!identificadorUsar) {
            return res.status(400).json({ error: 'Se requiere email o teléfono para iniciar sesión.' });
        }

        let usuarioEncontrado = null;
        let rol = null;
        let payload = {};

        // 1️ Intentar buscar como ADMINISTRADOR (usa email)
        // Solo buscar si el identificador parece un email (contiene @)
        if (identificadorUsar.includes('@')) {
            usuarioEncontrado = await Administrador.findOne({
                where: { email: identificadorUsar, activo: true }
            });

            if (usuarioEncontrado && await usuarioEncontrado.validarPassword(password)) {
                rol = 'admin';
                payload = {
                    id: usuarioEncontrado.id,
                    nombre: usuarioEncontrado.nombre,
                    rol
                };
            }
        }

        // 2️ Intentar buscar como TENDERO (usa teléfono)
        if (!usuarioEncontrado) {
            usuarioEncontrado = await Tendero.findOne({
                where: { telefono: identificadorUsar, activo: true }
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
                where: { telefono: identificadorUsar, activo: true }
            });

            if (usuarioEncontrado && usuarioEncontrado.password_hash && await usuarioEncontrado.validarPassword(password)) {
                rol = 'cliente';
                payload = {
                    id: usuarioEncontrado.id,
                    nombre: usuarioEncontrado.nombres,
                    rol
                };
            }
        }

        // 4️ Si no se encontró en ninguna tabla
        if (!usuarioEncontrado) {
            return res.status(401).json({ error: 'Credenciales inválidas o usuario inactivo.' });
        }

        // 5️ Generar el Token JWT
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'tu_clave_secreta_temporal',
            { expiresIn: '24h' }
        );

        // 6️ Responder al frontend
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

// ==========================================
// 2. REGISTRO DE ADMINISTRADOR
// ==========================================
const registerAdmin = async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        // Validaciones básicas
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
        }

        // Verificar si ya existe un admin con ese email
        const existente = await Administrador.findOne({ where: { email } });
        if (existente) {
            return res.status(400).json({ error: 'Ya existe un administrador con ese email.' });
        }

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

// ==========================================
// 3. REGISTRO DE TENDERO (Crea Tendero + Tienda)
// ==========================================
const registerTendero = async (req, res) => {
    const t = await sequelize.transaction(); // Transacción para garantizar consistencia
    try {
        const { dni, nombres, apellidos, email, password, telefono, nombre_tienda } = req.body;

        // Validaciones básicas
        if (!dni || !nombres || !apellidos || !telefono || !password) {
            await t.rollback();
            return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos.' });
        }

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

        // Validaciones básicas
        if (!telefono || !nombres || !apellidos) {
            return res.status(400).json({ error: 'Teléfono, nombres y apellidos son obligatorios.' });
        }

        // Verificar si ya existe un cliente con ese teléfono
        const existente = await Cliente.findOne({ where: { telefono } });
        if (existente) {
            return res.status(400).json({ error: 'Ya existe un cliente con ese teléfono.' });
        }

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