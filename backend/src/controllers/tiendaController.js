// src/controllers/tiendaController.js
const { Tienda, Tendero } = require('../models');

// Crear una nueva tienda
exports.crearTienda = async (req, res) => {
    try {
        const tendero_id = req.usuario.id; // Usamos el ID del usuario logueado por seguridad
        const { nombre, direccion, ruc, telefono, email, logo_url, horario_apertura, horario_cierre, dias_operacion, moneda, zona_horaria } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la tienda es obligatorio'
            });
        }

        const tienda = await Tienda.create({
            tendero_id,
            nombre,
            direccion,
            ruc,
            telefono,
            email,
            logo_url,
            horario_apertura,
            horario_cierre,
            dias_operacion,
            moneda: moneda || 'PEN',
            zona_horaria: zona_horaria || 'America/Lima'
        });

        res.status(201).json({
            success: true,
            message: 'Tienda creada exitosamente',
            data: { tienda }
        });
    } catch (error) {
        console.error('Error al crear tienda:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al crear la tienda',
            error: error.message
        });
    }
};

// Obtener todas las tiendas del tendero logueado
exports.obtenerMisTiendas = async (req, res) => {
    try {
        const tendero_id = req.usuario.id;
        const { activo } = req.query;

        const where = { tendero_id };
        if (activo !== undefined) {
            where.activo = activo === 'true';
        }

        const tiendas = await Tienda.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            message: 'Tiendas obtenidas exitosamente',
            data: {
                tiendas,
                total: tiendas.length
            }
        });
    } catch (error) {
        console.error('Error al obtener tiendas:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al obtener las tiendas',
            error: error.message
        });
    }
};

// Obtener una tienda específica por ID
exports.obtenerTiendaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const tienda = await Tienda.findOne({
            where: {
                id,
                tendero_id: req.usuario.id // Seguridad: solo puede ver sus propias tiendas
            },
            include: [{
                model: Tendero,
                as: 'tendero',
                attributes: ['id', 'nombres', 'apellidos', 'email']
            }]
        });

        if (!tienda) {
            return res.status(404).json({
                success: false,
                message: 'Tienda no encontrada o no tienes permiso para verla'
            });
        }

        res.json({
            success: true,
            message: 'Tienda obtenida exitosamente',
            data: { tienda }
        });
    } catch (error) {
        console.error('Error al obtener tienda:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al obtener la tienda',
            error: error.message
        });
    }
};

// Actualizar una tienda
exports.actualizarTienda = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, ruc, telefono, email, logo_url, horario_apertura, horario_cierre, dias_operacion, moneda, zona_horaria, configuracion } = req.body;

        const tienda = await Tienda.findOne({
            where: { id, tendero_id: req.usuario.id }
        });

        if (!tienda) {
            return res.status(404).json({
                success: false,
                message: 'Tienda no encontrada o no tienes permiso para editarla'
            });
        }

        await tienda.update({
            nombre: nombre || tienda.nombre,
            direccion: direccion !== undefined ? direccion : tienda.direccion,
            ruc: ruc !== undefined ? ruc : tienda.ruc,
            telefono: telefono !== undefined ? telefono : tienda.telefono,
            email: email !== undefined ? email : tienda.email,
            logo_url: logo_url !== undefined ? logo_url : tienda.logo_url,
            horario_apertura: horario_apertura !== undefined ? horario_apertura : tienda.horario_apertura,
            horario_cierre: horario_cierre !== undefined ? horario_cierre : tienda.horario_cierre,
            dias_operacion: dias_operacion !== undefined ? dias_operacion : tienda.dias_operacion,
            moneda: moneda || tienda.moneda,
            zona_horaria: zona_horaria || tienda.zona_horaria,
            configuracion: configuracion || tienda.configuracion
        });

        res.json({
            success: true,
            message: 'Tienda actualizada exitosamente',
            data: { tienda }
        });
    } catch (error) {
        console.error('Error al actualizar tienda:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al actualizar la tienda',
            error: error.message
        });
    }
};

// Eliminar tienda (Soft Delete)
exports.eliminarTienda = async (req, res) => {
    try {
        const { id } = req.params;

        const tienda = await Tienda.findOne({
            where: { id, tendero_id: req.usuario.id }
        });

        if (!tienda) {
            return res.status(404).json({
                success: false,
                message: 'Tienda no encontrada o no tienes permiso para eliminarla'
            });
        }

        await tienda.update({ activo: false });

        res.json({
            success: true,
            message: 'Tienda eliminada (desactivada) exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar tienda:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al eliminar la tienda',
            error: error.message
        });
    }
};