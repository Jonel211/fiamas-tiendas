const { Administrador, Tendero, Cliente, Tienda, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ==========================================
// 1. LOGIN INTELIGENTE (v6)
// Admin usa email | Tendero y Cliente usan teléfono
// ==========================================
const login = async (req, res) => {
    try {
        const { identificador, email, telefono, password } = req.body;

        if (!password) {
            return res.status(400).json({ error: 'Se requiere la contraseña.' });
        }

        // Unificamos el identificador (puede venir como email, telefono o identificador)
        const identificadorUsar = identificador || email || telefono;

        if (!identificadorUsar) {
            return res.status(400).json({ error: 'Se requiere email o teléfono para iniciar sesión.' });
        }

        let usuarioValido = false;
        let rol = null;
        let payload = {};

        // 1️ ADMINISTRADOR: Solo busca si el identificador tiene formato de correo (@)
        if (identificadorUsar.includes('@')) {
            const admin = await Administrador.findOne({
                where: { email: identificadorUsar, activo: true }
            });

            if (admin && await admin.validarPassword(password)) {
                usuarioValido = true;
                rol = 'admin';
                payload = { id: admin.id, nombre: admin.nombre, rol };
            }
        }

        // 2️ TENDERO: Busca exclusivamente por teléfono
        if (!usuarioValido) {
            const tendero = await Tendero.findOne({
                where: { telefono: identificadorUsar, activo: true }
            });

            if (tendero && await tendero.validarPassword(password)) {
                usuarioValido = true;
                rol = 'tendero';

                // Obtener la tienda asociada al tendero
                const tienda = await Tienda.findOne({
                    where: { tendero_id: tendero.id, activo: true }
                });

                payload = {
                    id: tendero.id,
                    nombre: `${tendero.nombres} ${tendero.apellidos}`.trim(),
                    rol,
                    tienda_id: tienda ? tienda.id : null
                };
            }
        }

        // 3️ CLIENTE: Busca exclusivamente por teléfono
        if (!usuarioValido) {
            const cliente = await Cliente.findOne({
                where: { telefono: identificadorUsar, activo: true }
            });

            // El cliente puede no tener password si aún no la ha establecido
            if (cliente && (!cliente.password_hash || await cliente.validarPassword(password))) {
                usuarioValido = true;
                rol = 'cliente';
                payload = {
                    id: cliente.id,
                    nombre: `${cliente.nombres} ${cliente.apellidos}`.trim(),
                    rol
                };
            }
        }

        // 4️ VALIDACIÓN FINAL
        if (!usuarioValido) {
            return res.status(401).json({
                error: 'Credenciales inválidas. Verifica tu email/teléfono y contraseña.'
            });
        }

        // 5️ Generar Token JWT
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
// 2. REGISTRO DE ADMINISTRADOR (Usa Email)
// ==========================================
const registerAdmin = async (req, res) => {
    try {
        const { nombre, email, password, telefono } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
        }

        const existente = await Administrador.findOne({ where: { email } });
        if (existente) {
            return res.status(400).json({ error: 'Ya existe un administrador con ese email.' });
        }

        const nuevoAdmin = await Administrador.create({
            nombre,
            email,
            password_hash: password,
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
// 3. REGISTRO DE TENDERO (Usa Teléfono, SIN Email)
// ==========================================
const registerTendero = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { dni, nombres, apellidos, password, telefono, nombre_tienda } = req.body;

        if (!dni || !nombres || !apellidos || !telefono || !password) {
            await t.rollback();
            return res.status(400).json({ error: 'DNI, nombres, apellidos, teléfono y contraseña son obligatorios.' });
        }

        // Verificar duplicados por DNI o Teléfono
        const existeDni = await Tendero.findOne({ where: { dni } });
        if (existeDni) {
            await t.rollback();
            return res.status(400).json({ error: 'Ya existe un tendero con ese DNI.' });
        }

        const existeTelefono = await Tendero.findOne({ where: { telefono } });
        if (existeTelefono) {
            await t.rollback();
            return res.status(400).json({ error: 'Ya existe un tendero con ese número de teléfono.' });
        }

        // 1. Crear el tendero (SIN campo email, según esquema v6)
        const nuevoTendero = await Tendero.create({
            dni,
            nombres,
            apellidos,
            password_hash: password,
            telefono
        }, { transaction: t });

        // 2. Crear su tienda por defecto con un QR token único
        await Tienda.create({
            tendero_id: nuevoTendero.id,
            nombre: nombre_tienda || `Tienda de ${nombres}`,
            telefono: telefono,
            qr_token: crypto.randomUUID(),
            qr_activo: true,
            activo: true
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            msg: 'Tendero y tienda registrados exitosamente',
            tendero_id: nuevoTendero.id
        });
    } catch (error) {
        await t.rollback();
        console.error('Error al registrar tendero:', error);
        res.status(500).json({ error: 'Error al registrar tendero', detalle: error.message });
    }
};

// ==========================================
// 4. REGISTRO DE CLIENTE (Usa Teléfono, SIN Email)
// ==========================================
const registerCliente = async (req, res) => {
    try {
        const { telefono, nombres, apellidos, password, direccion } = req.body;

        if (!telefono || !nombres || !apellidos) {
            return res.status(400).json({ error: 'Teléfono, nombres y apellidos son obligatorios.' });
        }

        const existente = await Cliente.findOne({ where: { telefono } });
        if (existente) {
            return res.status(400).json({ error: 'Ya existe un cliente registrado con ese número de teléfono.' });
        }

        const nuevoCliente = await Cliente.create({
            telefono,
            nombres,
            apellidos,
            password_hash: password || null,
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