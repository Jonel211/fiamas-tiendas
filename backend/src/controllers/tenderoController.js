// src/controllers/tenderoController.js
const { Tendero } = require('../models');
const bcrypt = require('bcryptjs');

// Obtener perfil del tendero logueado
exports.obtenerPerfil = async (req, res) => {
    try {
        const tendero = await Tendero.findByPk(req.usuario.id, {
            attributes: { exclude: ['password_hash'] } // Nunca devolver la contraseña
        });

        if (!tendero) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Perfil obtenido exitosamente',
            data: { tendero }
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al obtener el perfil',
            error: error.message
        });
    }
};

// Actualizar perfil del tendero
exports.actualizarPerfil = async (req, res) => {
    try {
        const { dni, nombres, apellidos, telefono, fecha_nacimiento, direccion, password } = req.body;

        const tendero = await Tendero.findByPk(req.usuario.id);
        if (!tendero) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar DNI único si se intenta cambiar
        if (dni && dni !== tendero.dni) {
            const existeDNI = await Tendero.findOne({ where: { dni } });
            if (existeDNI) {
                return res.status(409).json({
                    success: false,
                    message: 'El DNI ya está registrado por otro usuario'
                });
            }
        }

        // Preparar datos de actualización
        const datosActualizacion = {
            dni: dni || tendero.dni,
            nombres: nombres || tendero.nombres,
            apellidos: apellidos || tendero.apellidos,
            telefono: telefono || tendero.telefono,
            fecha_nacimiento: fecha_nacimiento || tendero.fecha_nacimiento,
            direccion: direccion !== undefined ? direccion : tendero.direccion
        };

        // Si se proporciona nueva contraseña, encriptarla
        if (password) {
            datosActualizacion.password_hash = await bcrypt.hash(password, 10);
        }

        await tendero.update(datosActualizacion);

        // Obtener datos actualizados sin la contraseña
        const tenderoActualizado = await Tendero.findByPk(req.usuario.id, {
            attributes: { exclude: ['password_hash'] }
        });

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: { tendero: tenderoActualizado }
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al actualizar el perfil',
            error: error.message
        });
    }
};

// Eliminar cuenta del tendero (Soft Delete)
exports.eliminarCuenta = async (req, res) => {
    try {
        const tendero = await Tendero.findByPk(req.usuario.id);
        if (!tendero) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        await tendero.update({ activo: false });

        res.json({
            success: true,
            message: 'Cuenta eliminada (desactivada) exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al eliminar la cuenta',
            error: error.message
        });
    }
};