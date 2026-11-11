const { ClienteTienda, Fiado, Pago, sequelize } = require('../models');
const { Op } = require('sequelize');

const calcularYActualizarScoring = async (clienteId, tiendaId) => {
    try {
        const vinculacion = await ClienteTienda.findOne({
            where: { cliente_id: clienteId, tienda_id: tiendaId, activo: true }
        });

        if (!vinculacion) return { score: 100, categoria: 'nuevo' };

        const hoy = new Date().toISOString().slice(0, 10);

        const fiados = await Fiado.findAll({
            where: { cliente_id: clienteId, tienda_id: tiendaId },
            include: [{
                model: Pago,
                as: 'pagos',
                attributes: ['fecha_pago'],
                separate: true
            }]
        });

        const historial = fiados.filter(f => f.estado !== 'cancelado');
        const totalFiados = historial.length;
        const totalPagos = fiados.reduce((total, f) => total + (f.pagos?.length || 0), 0);

        if (totalFiados === 0) {
            await vinculacion.update({
                score_pagador: 100,
                categoria_pagador: 'nuevo',
                total_fiados: 0,
                total_pagos: 0,
                cantidad_fiados_mora: 0
            });
            return { score: 100, categoria: 'nuevo' };
        }

        const activos = historial.filter(f =>
            !['pagado', 'cancelado'].includes(f.estado) &&
            Number(f.monto_total) > Number(f.monto_pagado || 0)
        );

        const fiadosMora = activos.filter(f =>
            f.fecha_vencimiento && String(f.fecha_vencimiento).slice(0, 10) < hoy
        ).length;

        let pagadosTarde = 0;
        for (const fiado of historial) {
            if (fiado.estado === 'pagado' && fiado.fecha_vencimiento) {
                const fechaVenc = String(fiado.fecha_vencimiento).slice(0, 10);
                const pagoTarde = fiado.pagos?.some(p =>
                    new Date(p.fecha_pago).toISOString().slice(0, 10) > fechaVenc
                );
                if (pagoTarde) pagadosTarde++;
            }
        }

        let score = Math.max(0, 100 - (fiadosMora * 20) - (pagadosTarde * 10));

        let categoria = 'malo';
        if (score >= 80) categoria = 'bueno';
        else if (score >= 50) categoria = 'regular';

        await vinculacion.update({
            score_pagador: score,
            categoria_pagador: categoria,
            total_fiados: totalFiados,
            total_pagos: totalPagos,
            cantidad_fiados_mora: fiadosMora
        });

        console.log(` Scoring actualizado: Cliente ${clienteId}, Tienda ${tiendaId} -> Score: ${score}, Categoría: ${categoria}`);
        return { score, categoria };

    } catch (error) {
        console.error(' Error al calcular scoring:', error);
        throw error;
    }
};

module.exports = { calcularYActualizarScoring };