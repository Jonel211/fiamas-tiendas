const { Pago, Fiado, Cliente, ClienteTienda, Tienda, Tendero, sequelize } = require('../models');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════════════════════════════════════
// 1. REGISTRAR PAGO
// POST /api/pagos
// ═══════════════════════════════════════════════════════════════════════════
const registrarPago = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const tenderoId = req.usuario.id;
        const { fiado_id, monto, metodo_pago, referencia, notas } = req.body;

        // 1. Validaciones básicas
        if (!fiado_id || !monto || monto <= 0) {
            await t.rollback();
            return res.status(400).json({ error: 'fiado_id y monto (mayor a 0) son obligatorios.' });
        }

        // 2. Buscar el fiado
        const fiado = await Fiado.findByPk(fiado_id, { transaction: t });
        if (!fiado) {
            await t.rollback();
            return res.status(404).json({ error: 'Fiado no encontrado.' });
        }

        // 3. Validar que el fiado pertenezca a una tienda del tendero
        const tienda = await Tienda.findOne({
            where: { id: fiado.tienda_id, tendero_id: tenderoId },
            transaction: t
        });
        if (!tienda) {
            await t.rollback();
            return res.status(403).json({ error: 'No tienes permisos sobre este fiado.' });
        }

        // 4. Validar estado del fiado
        if (fiado.estado === 'pagado' || fiado.estado === 'cancelado') {
            await t.rollback();
            return res.status(400).json({ error: 'No se pueden registrar pagos en fiados pagados o cancelados.' });
        }

        // 5. Validar que el monto no exceda el saldo pendiente
        const saldoPendiente = Number(fiado.monto_total) - Number(fiado.monto_pagado);
        if (monto > saldoPendiente) {
            await t.rollback();
            return res.status(400).json({ error: `El monto excede el saldo pendiente (${saldoPendiente}).` });
        }

        // ✅ 6. GENERAR NÚMERO DE PAGO ÚNICO (Soluciona el error notNull Violation)
        const numeroPago = `P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 7. Preparar datos del pago
        const datosPago = {
            fiado_id: fiado_id,
            tienda_id: fiado.tienda_id,
            cliente_id: fiado.cliente_id,
            registrado_por: tenderoId,
            numero_pago: numeroPago, // ✅ AGREGADO
            monto: monto,
            referencia: referencia || null,
            notas: notas || null,
            fecha_pago: new Date()
        };

        // Manejo dinámico de la columna metodo_pago / tipo_pago
        const modeloPago = Pago.rawAttributes;
        if (modeloPago.metodo_pago) {
            datosPago.metodo_pago = metodo_pago || 'efectivo';
        } else if (modeloPago.tipo_pago) {
            datosPago.tipo_pago = metodo_pago || 'efectivo';
        } else {
            datosPago.metodo_pago = metodo_pago || 'efectivo';
        }

        // 8. Crear el pago
        const pago = await Pago.create(datosPago, { transaction: t });

        // 9. Actualizar el fiado
        const nuevoMontoPagado = Number(fiado.monto_pagado) + Number(monto);
        const nuevoEstado = nuevoMontoPagado >= Number(fiado.monto_total) ? 'pagado' : 'parcial';

        await fiado.update({
            monto_pagado: nuevoMontoPagado,
            estado: nuevoEstado,
            actualizado_en: new Date()
        }, { transaction: t });

        // 10. Actualizar vinculación cliente-tienda (reducir saldo)
        const vinculacion = await ClienteTienda.findOne({
            where: { cliente_id: fiado.cliente_id, tienda_id: fiado.tienda_id, activo: true },
            transaction: t
        });

        if (vinculacion) {
            await vinculacion.update({
                saldo_actual: Math.max(0, Number(vinculacion.saldo_actual) - Number(monto)),
                total_pagos: Number(vinculacion.total_pagos) + 1,
                actualizado_en: new Date()
            }, { transaction: t });
        }

        await t.commit();

        // 11. Determinar nombre de columna para la respuesta
        const nombreColumnaMetodo = modeloPago.metodo_pago ? 'metodo_pago' : (modeloPago.tipo_pago ? 'tipo_pago' : 'metodo_pago');

        res.status(201).json({
            msg: 'Pago registrado exitosamente.',
            pago: {
                id: pago.id,
                numero_pago: pago.numero_pago,
                monto: pago.monto,
                metodo_pago: pago[nombreColumnaMetodo] || metodo_pago || 'efectivo',
                fecha_pago: pago.fecha_pago,
                referencia: pago.referencia,
                notas: pago.notas
            },
            fiado_actualizado: {
                id: fiado.id,
                numero_fiado: fiado.numero_fiado,
                monto_total: fiado.monto_total,
                monto_pagado: nuevoMontoPagado,
                saldo_pendiente: Number(fiado.monto_total) - nuevoMontoPagado,
                estado: nuevoEstado
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al registrar pago:', error);
        res.status(500).json({ error: 'Error interno al registrar el pago.', detalle: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. LISTAR PAGOS DE LA TIENDA
// GET /api/pagos?tienda_id=xxx&fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
// ═══════════════════════════════════════════════════════════════════════════
const listarPagos = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { tienda_id, fecha_inicio, fecha_fin } = req.query;

        const wherePago = {};

        if (tienda_id) {
            const tienda = await Tienda.findOne({ where: { id: tienda_id, tendero_id: tenderoId, activo: true } });
            if (!tienda) return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
            wherePago.tienda_id = tienda_id;
        } else {
            const tiendas = await Tienda.findAll({ where: { tendero_id: tenderoId, activo: true }, attributes: ['id'] });
            wherePago.tienda_id = { [Op.in]: tiendas.map(t => t.id) };
        }

        if (fecha_inicio || fecha_fin) {
            wherePago.fecha_pago = {};
            if (fecha_inicio) wherePago.fecha_pago[Op.gte] = new Date(fecha_inicio);
            if (fecha_fin) wherePago.fecha_pago[Op.lte] = new Date(fecha_fin + 'T23:59:59');
        }

        const pagos = await Pago.findAll({
            where: wherePago,
            include: [
                {
                    model: Fiado,
                    as: 'fiado',
                    attributes: ['id', 'numero_fiado', 'monto_total', 'estado'],
                    include: [{ model: Cliente, as: 'cliente', attributes: ['id', 'nombres', 'apellidos', 'telefono'] }]
                },
                {
                    model: Tendero,
                    as: 'registrador',
                    attributes: ['id', 'nombres', 'apellidos']
                }
            ],
            order: [['fecha_pago', 'DESC']],
            limit: 100
        });

        const modeloPago = Pago.rawAttributes;
        const nombreColumnaMetodo = modeloPago.metodo_pago ? 'metodo_pago' : (modeloPago.tipo_pago ? 'tipo_pago' : 'metodo_pago');

        const pagosFormateados = pagos.map(pago => ({
            id: pago.id,
            numero_pago: pago.numero_pago,
            monto: pago.monto,
            metodo_pago: pago[nombreColumnaMetodo] || 'efectivo',
            fecha_pago: pago.fecha_pago,
            referencia: pago.referencia,
            notas: pago.notas,
            fiado: {
                id: pago.fiado.id,
                numero_fiado: pago.fiado.numero_fiado,
                monto_total: pago.fiado.monto_total,
                estado: pago.fiado.estado,
                cliente: pago.fiado.cliente
            },
            registrado_por: pago.registrador ? `${pago.registrador.nombres} ${pago.registrador.apellidos}` : 'Sistema'
        }));

        const totalPagado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

        res.status(200).json({
            msg: 'Pagos obtenidos exitosamente.',
            total_pagos: pagosFormateados.length,
            total_pagado: totalPagado,
            pagos: pagosFormateados
        });

    } catch (error) {
        console.error('Error al listar pagos:', error);
        res.status(500).json({ error: 'Error interno al obtener los pagos.', detalle: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. OBTENER DETALLE DE UN PAGO
// GET /api/pagos/:id
// ═══════════════════════════════════════════════════════════════════════════
const obtenerPago = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const pago = await Pago.findByPk(req.params.id, {
            include: [
                {
                    model: Fiado,
                    as: 'fiado',
                    attributes: ['id', 'numero_fiado', 'monto_total', 'monto_pagado', 'estado', 'fecha_fiado'],
                    include: [
                        { model: Cliente, as: 'cliente', attributes: ['id', 'nombres', 'apellidos', 'telefono'] },
                        { model: Tienda, as: 'tienda', attributes: ['id', 'nombre'] }
                    ]
                },
                {
                    model: Tendero,
                    as: 'registrador',
                    attributes: ['id', 'nombres', 'apellidos']
                }
            ]
        });

        if (!pago) return res.status(404).json({ error: 'Pago no encontrado.' });

        const tienda = await Tienda.findOne({ where: { id: pago.fiado.tienda_id, tendero_id: tenderoId } });
        if (!tienda) return res.status(403).json({ error: 'No tienes permisos para ver este pago.' });

        const modeloPago = Pago.rawAttributes;
        const nombreColumnaMetodo = modeloPago.metodo_pago ? 'metodo_pago' : (modeloPago.tipo_pago ? 'tipo_pago' : 'metodo_pago');

        res.status(200).json({
            msg: 'Pago obtenido exitosamente.',
            pago: {
                id: pago.id,
                numero_pago: pago.numero_pago,
                monto: pago.monto,
                metodo_pago: pago[nombreColumnaMetodo] || 'efectivo',
                fecha_pago: pago.fecha_pago,
                referencia: pago.referencia,
                notas: pago.notas,
                fiado: {
                    id: pago.fiado.id,
                    numero_fiado: pago.fiado.numero_fiado,
                    monto_total: pago.fiado.monto_total,
                    monto_pagado: pago.fiado.monto_pagado,
                    saldo_pendiente: Number(pago.fiado.monto_total) - Number(pago.fiado.monto_pagado),
                    estado: pago.fiado.estado,
                    fecha_fiado: pago.fiado.fecha_fiado,
                    cliente: pago.fiado.cliente,
                    tienda: pago.fiado.tienda
                },
                registrado_por: pago.registrador ? `${pago.registrador.nombres} ${pago.registrador.apellidos}` : 'Sistema'
            }
        });

    } catch (error) {
        console.error('Error al obtener pago:', error);
        res.status(500).json({ error: 'Error interno al obtener el pago.', detalle: error.message });
    }
};

module.exports = {
    registrarPago,
    listarPagos,
    obtenerPago
};