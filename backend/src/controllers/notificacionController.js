const { Op } = require('sequelize');
const { Alerta, Tienda, Tendero, sequelize } = require('../models');

// Qué alertas le corresponden a este tendero
async function filtroTendero(tenderoId) {
    const tendero = await Tendero.findByPk(tenderoId, { attributes: ['id', 'creado_en', 'activo'] });
    if (!tendero || !tendero.activo) return null;

    const tiendas = await Tienda.findAll({ where: { tendero_id: tenderoId }, attributes: ['id'] });
    const tiendaIds = tiendas.map(t => t.id);

    const or = [
        // Dirigidas directamente a él
        { destinatario_tipo: 'tendero', destinatario_id: tenderoId },
        // Difusiones del admin posteriores a su registro
        { destinatario_tipo: 'todos', tipo_alerta: 'aviso_admin',
          fecha_creacion: { [Op.gte]: tendero.creado_en } },
    ];
    // Alertas del sistema que solo traen tienda_id
    if (tiendaIds.length) {
        or.push({ destinatario_tipo: 'tendero', destinatario_id: null, tienda_id: { [Op.in]: tiendaIds } });
    }

    return {
        canal: { [Op.like]: '%aplicacion%' },
        estado: { [Op.ne]: 'cerrada' },
        [Op.or]: or,
    };
}

async function obtener(tenderoId, limit = 100) {
    const where = await filtroTendero(tenderoId);
    if (!where) return null;

    const alertas = await Alerta.findAll({ where, order: [['fecha_creacion', 'DESC']], limit });

    return alertas.map(a => ({
        id: a.id,
        tipo: a.tipo_alerta,
        prioridad: a.prioridad,
        titulo: a.titulo,
        mensaje: a.mensaje,
        leida: a.destinatario_tipo === 'todos'
            ? (a.leida_por || []).includes(tenderoId)
            : a.estado !== 'pendiente',
        fecha: a.fecha_creacion,
    }));
}

const AGREGAR_LECTURA = `
    UPDATE alertas
    SET leida_por = array_append(leida_por, :tid::uuid)
    WHERE id IN (:ids) AND NOT (:tid::uuid = ANY(leida_por))
`;

// GET /api/notificaciones
exports.listar = async (req, res) => {
    try {
        const items = await obtener(req.usuario.id);
        if (!items) return res.status(404).json({ error: 'Tendero no encontrado.' });
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
        if (!items) return res.status(404).json({ error: 'Tendero no encontrado.' });
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
        if (!where) return res.status(404).json({ error: 'Tendero no encontrado.' });

        const alerta = await Alerta.findOne({ where: { [Op.and]: [where, { id: req.params.id }] } });
        if (!alerta) return res.status(404).json({ error: 'Notificación no encontrada.' });

        if (alerta.destinatario_tipo === 'todos') {
            await sequelize.query(AGREGAR_LECTURA, { replacements: { tid: tenderoId, ids: [alerta.id] } });
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
        if (!where) return res.status(404).json({ error: 'Tendero no encontrado.' });

        const alertas = await Alerta.findAll({ where, attributes: ['id', 'destinatario_tipo', 'estado'] });

        const personales = alertas
            .filter(a => a.destinatario_tipo !== 'todos' && a.estado === 'pendiente')
            .map(a => a.id);
        const difusiones = alertas
            .filter(a => a.destinatario_tipo === 'todos')
            .map(a => a.id);

        if (personales.length) await Alerta.update({ estado: 'leida' }, { where: { id: personales } });
        if (difusiones.length) {
            await sequelize.query(AGREGAR_LECTURA, { replacements: { tid: tenderoId, ids: difusiones } });
        }
        res.sendStatus(204);
    } catch (e) {
        console.error('Error al marcar todas:', e);
        res.status(500).json({ error: 'Error interno.' });
    }
};