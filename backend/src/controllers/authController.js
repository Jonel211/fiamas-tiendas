const authService = require('../services/authService');

// 1. LOGIN
const login = async (req, res, next) => {
    try {
        const { identificador, email, telefono, password, rol } = req.body;
        const idFinal = identificador || email || telefono;

        const resultado = await authService.login({
            identificador: idFinal,
            password,
            rolRequerido: rol
        });

        res.status(200).json({
            msg: 'Inicio de sesión exitoso',
            ...resultado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor al intentar iniciar sesión.' });
    }
};

// 2. REGISTRO DE ADMINISTRADOR
const registerAdmin = async (req, res, next) => {
    try {
        const resultado = await authService.registrarAdministrador(req.body);

        res.status(201).json({
            msg: 'Administrador registrado exitosamente',
            ...resultado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error al registrar admin:', error);
        res.status(500).json({ error: 'Error al registrar administrador', detalle: error.message });
    }
};

// 3. REGISTRO DE TENDERO
const registerTendero = async (req, res, next) => {
    try {
        const resultado = await authService.registrarTendero(req.body);

        res.status(201).json({
            msg: 'Tendero y tienda registrados exitosamente',
            ...resultado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error al registrar tendero:', error);
        res.status(500).json({ error: 'Error al registrar tendero', detalle: error.message });
    }
};

// 4. REGISTRO DE CLIENTE
const registerCliente = async (req, res, next) => {
    try {
        const resultado = await authService.registrarCliente(req.body);

        res.status(201).json({
            msg: 'Cliente registrado exitosamente. Ahora puede vincularse a una tienda.',
            ...resultado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error al registrar cliente:', error);
        res.status(500).json({ error: 'Error al registrar cliente', detalle: error.message });
    }
};

// 5. OBTENER PERFIL ADMIN
const getPerfilAdmin = async (req, res, next) => {
    try {
        const { Administrador } = require('../models');
        const adminId = req.usuario.id;

        const admin = await Administrador.findByPk(adminId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!admin) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        res.status(200).json({
            msg: 'Perfil obtenido exitosamente',
            usuario: admin
        });
    } catch (error) {
        console.error('Error al obtener perfil admin:', error);
        res.status(500).json({ error: 'Error interno al obtener el perfil.' });
    }
};

// 6. ACTUALIZAR PERFIL ADMIN (Nombre, teléfono, email, contraseña)
const actualizarPerfilAdmin = async (req, res, next) => {
    try {
        const { Administrador } = require('../models');
        const adminId = req.usuario.id;
        const { nombre, email, telefono, currentPassword, newPassword } = req.body;

        const admin = await Administrador.findByPk(adminId);
        if (!admin) {
            return res.status(404).json({ error: 'Administrador no encontrado.' });
        }

        // Si se desea cambiar la contraseña o cambiar email, verificar contraseña actual
        if (newPassword || (email && email !== admin.email)) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Se requiere la contraseña actual para realizar cambios sensibles.' });
            }
            const esValida = await admin.validarPassword(currentPassword);
            if (!esValida) {
                return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
            }
        }

        // Verificar si el nuevo email ya existe en otro admin
        if (email && email !== admin.email) {
            const { Op } = require('sequelize');
            const existeEmail = await Administrador.findOne({ where: { email, id: { [Op.ne]: adminId } } });
            if (existeEmail) {
                return res.status(400).json({ error: 'El correo electrónico ya está registrado por otro administrador.' });
            }
            admin.email = email;
        }

        if (nombre) admin.nombre = nombre;
        if (telefono !== undefined) admin.telefono = telefono;
        if (newPassword && newPassword.trim() !== '') {
            admin.password_hash = newPassword;
        }

        await admin.save();

        res.status(200).json({
            msg: 'Perfil actualizado exitosamente',
            usuario: {
                id: admin.id,
                nombre: admin.nombre,
                email: admin.email,
                telefono: admin.telefono,
                rol: 'admin'
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil admin:', error);
        res.status(500).json({ error: 'Error interno al actualizar el perfil.' });
    }
};

module.exports = {
    login,
    registerAdmin,
    registerTendero,
    registerCliente,
    getPerfilAdmin,
    actualizarPerfilAdmin
};