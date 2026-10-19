const { Tendero, Tienda, LogSistema, sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// 1. OBTENER ESTADÍSTICAS GENERALES PARA REPORTES
exports.getEstadisticas = async (req, res) => {
    try {
        const [totalTiendas, totalTenderos, tiendasActivas, tenderosActivos] = await Promise.all([
            Tienda.count(),
            Tendero.count(),
            Tienda.count({ where: { activo: true } }),
            Tendero.count({ where: { activo: true } })
        ]);

        // Crecimiento mensual de tiendas (últimos 6 meses) — PostgreSQL: TO_CHAR
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const tiendasPorMes = await Tienda.findAll({
            attributes: [
                [fn('TO_CHAR', col('creado_en'), 'YYYY-MM'), 'mes'],
                [fn('COUNT', col('id')), 'total']
            ],
            where: {
                creado_en: { [Op.gte]: sixMonthsAgo }
            },
            group: [literal("TO_CHAR(creado_en, 'YYYY-MM')")],
            order: [[literal("TO_CHAR(creado_en, 'YYYY-MM')"), 'ASC']],
            raw: true
        });

        const tenderosPorMes = await Tendero.findAll({
            attributes: [
                [fn('TO_CHAR', col('creado_en'), 'YYYY-MM'), 'mes'],
                [fn('COUNT', col('id')), 'total']
            ],
            where: {
                creado_en: { [Op.gte]: sixMonthsAgo }
            },
            group: [literal("TO_CHAR(creado_en, 'YYYY-MM')")],
            order: [[literal("TO_CHAR(creado_en, 'YYYY-MM')"), 'ASC']],
            raw: true
        });

        // Top 5 tenderos con más tiendas
        const topTenderos = await Tendero.findAll({
            attributes: [
                'id', 'nombres', 'apellidos', 'dni', 'activo',
                [fn('COUNT', col('tiendas.id')), 'total_tiendas']
            ],
            include: [{
                model: Tienda,
                as: 'tiendas',
                attributes: [],
                required: false
            }],
            group: ['Tendero.id'],
            order: [[literal('total_tiendas'), 'DESC']],
            limit: 5,
            subQuery: false
        });

        // Últimos 5 registros de actividad
        const ultimosLogs = await LogSistema.findAll({
            order: [['fecha', 'DESC']],
            limit: 5
        });

        // Últimos 6 tenderos registrados con sus tiendas asociadas
        const ultimosTenderos = await Tendero.findAll({
            attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono', 'activo', 'creado_en'],
            include: [{
                model: Tienda,
                as: 'tiendas',
                attributes: ['id', 'nombre']
            }],
            order: [['creado_en', 'DESC']],
            limit: 6
        });

        res.json({
            resumen: {
                totalTiendas,
                totalTenderos,
                tiendasActivas,
                tenderosActivos,
                tasaActividadTiendas: totalTiendas > 0 ? Math.round((tiendasActivas / totalTiendas) * 100) : 0,
                tasaActividadTenderos: totalTenderos > 0 ? Math.round((tenderosActivos / totalTenderos) * 100) : 0
            },
            crecimientoTiendas: tiendasPorMes,
            crecimientoTenderos: tenderosPorMes,
            topTenderos: topTenderos.map(t => ({
                id: t.id,
                nombre: `${t.nombres} ${t.apellidos}`,
                dni: t.dni,
                activo: t.activo,
                totalTiendas: parseInt(t.dataValues.total_tiendas) || 0
            })),
            ultimosTenderos: ultimosTenderos.map(t => {
                const tiendaPrincipal = t.tiendas && t.tiendas.length > 0 ? t.tiendas[0].nombre : 'Sin tienda';
                const tiendasExtra = t.tiendas && t.tiendas.length > 1 ? ` (+${t.tiendas.length - 1})` : '';
                return {
                    id: t.id,
                    nombre: `${t.nombres} ${t.apellidos}`,
                    tienda: `${tiendaPrincipal}${tiendasExtra}`,
                    estado: t.activo ? 'Activo' : 'Inactivo',
                    actividad: t.creado_en ? new Date(t.creado_en).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Reciente',
                    totalTiendas: t.tiendas ? t.tiendas.length : 0
                };
            }),
            ultimaActividad: ultimosLogs.map(l => ({
                id: l.id,
                accion: l.accion,
                descripcion: l.descripcion,
                fecha: l.fecha
            }))
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error interno al obtener estadísticas.' });
    }
};
