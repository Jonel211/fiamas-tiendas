const { Op } = require('sequelize');
const { Alerta, Tienda, Tendero, sequelize } = require('../models');

// Qué alertas le corresponden a este tendero
async function filtroTendero(tenderoId) {
    const tendero = await Tendero.findByPk(tenderoId, { attributes: ['id', 'creado_en', 'activo'] });
    if (!tendero || tendero.activo === false) return null;

    const tiendas = await Tienda.findAll({ where: { tendero_id: tenderoId }, attributes: ['id'] });
    const tiendaIds = tiendas.map(t => t.id);

    const or = [
        // 1. Dirigidas directamente a él
        { destinatario_tipo: 'tendero', destinatario_id: tenderoId },
        // 2. Difusiones generales del admin para todos los tenderos
        { destinatario_tipo: 'todos' },
    ];

    // 3. Alertas del sistema o asociadas a sus tiendas
    if (tiendaIds.length) {
        or.push({ destinatario_tipo: 'tendero', destinatario_id: null, tienda_id: { [Op.in]: tiendaIds } });
        or.push({ tienda_id: { [Op.in]: tiendaIds } });
    }

    return {
        estado: { [Op.ne]: 'cerrada' },
        tipo_alerta: { [Op.ne]: 'ayuda_soporte' },
        emisor_tipo: { [Op.ne]: 'tendero' },
        [Op.or]: or,
    };
}

async function obtener(tenderoId, limit = 100) {
    const where = await filtroTendero(tenderoId);
    if (!where) return null;

    const alertas = await Alerta.findAll({
        where,
        order: [['fecha_creacion', 'DESC']],
        limit
    });

    return alertas.map(a => {
        let leida = false;
        if (a.destinatario_tipo === 'todos') {
            const leidaPor = Array.isArray(a.leida_por) ? a.leida_por : [];
            leida = leidaPor.includes(tenderoId);
        } else {
            leida = a.estado !== 'pendiente';
        }

        return {
            id: a.id,
            tipo: a.tipo_alerta || 'aviso_admin',
            prioridad: a.prioridad || 'media',
            titulo: a.titulo || 'Notificación',
            mensaje: a.mensaje || '',
            leida,
            fecha: a.fecha_creacion ? new Date(a.fecha_creacion).toISOString() : new Date().toISOString(),
        };
    });
}

// GET /api/notificaciones
exports.listar = async (req, res) => {
    try {
        const items = await obtener(req.usuario.id);
        if (!items) return res.status(404).json({ error: 'Tendero no encontrado o inactivo.' });
        res.json({ noLeidas: items.filter(i => !i.leida).length, items });
    } catch (e) {
        console.error('Error al listar notificaciones:', e);
        res.status(500).json({ error: 'Error interno al obtener las notificaciones.' });
    }
};

// GET /api/notificaciones/no-leidas/count
exports.contarNoLeidas = async (req, res) => {
    try {
        const items = await obtener(req.usuario.id, 200);
        if (!items) return res.status(404).json({ error: 'Tendero no encontrado o inactivo.' });
        res.json({ count: items.filter(i => !i.leida).length });
    } catch (e) {
        console.error('Error al contar notificaciones:', e);
        res.status(500).json({ error: 'Error interno.' });
    }
};

// PATCH /api/notificaciones/:id/leer
exports.marcarLeida = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const where = await filtroTendero(tenderoId);
        if (!where) return res.status(404).json({ error: 'Tendero no encontrado o inactivo.' });

        const alerta = await Alerta.findOne({ where: { [Op.and]: [where, { id: req.params.id }] } });
        if (!alerta) return res.status(404).json({ error: 'Notificación no encontrada.' });

        if (alerta.destinatario_tipo === 'todos') {
            const leidaPor = Array.isArray(alerta.leida_por) ? [...alerta.leida_por] : [];
            if (!leidaPor.includes(tenderoId)) {
                leidaPor.push(tenderoId);
                await alerta.update({ leida_por: leidaPor });
            }
        } else if (alerta.estado === 'pendiente') {
            await alerta.update({ estado: 'leida' });
        }
        res.sendStatus(204);
    } catch (e) {
        console.error('Error al marcar leída:', e);
        res.status(500).json({ error: 'Error interno.' });
    }
};

// PATCH /api/notificaciones/leer-todas
exports.marcarTodas = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const where = await filtroTendero(tenderoId);
        if (!where) return res.status(404).json({ error: 'Tendero no encontrado o inactivo.' });

        const alertas = await Alerta.findAll({ where, attributes: ['id', 'destinatario_tipo', 'estado', 'leida_por'] });

        for (const alerta of alertas) {
            if (alerta.destinatario_tipo === 'todos') {
                const leidaPor = Array.isArray(alerta.leida_por) ? [...alerta.leida_por] : [];
                if (!leidaPor.includes(tenderoId)) {
                    leidaPor.push(tenderoId);
                    await alerta.update({ leida_por: leidaPor });
                }
            } else if (alerta.estado === 'pendiente') {
                await alerta.update({ estado: 'leida' });
            }
        }
        res.sendStatus(204);
    } catch (e) {
        console.error('Error al marcar todas:', e);
        res.status(500).json({ error: 'Error interno.' });
    }
};

// PATCH /api/notificaciones/limpiar-todas
exports.limpiarTodas = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const where = await filtroTendero(tenderoId);
        if (!where) return res.status(404).json({ error: 'Tendero no encontrado o inactivo.' });

        const alertas = await Alerta.findAll({ where, attributes: ['id', 'destinatario_tipo', 'estado', 'leida_por'] });

        for (const alerta of alertas) {
            if (alerta.destinatario_tipo === 'todos') {
                const leidaPor = Array.isArray(alerta.leida_por) ? [...alerta.leida_por] : [];
                if (!leidaPor.includes(tenderoId)) {
                    leidaPor.push(tenderoId);
                    await alerta.update({ leida_por: leidaPor });
                }
            } else {
                await alerta.update({ estado: 'cerrada' });
            }
        }
        res.sendStatus(204);
    } catch (e) {
        console.error('Error al limpiar todas:', e);
        res.status(500).json({ error: 'Error interno al limpiar notificaciones.' });
    }
};