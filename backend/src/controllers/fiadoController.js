const { Fiado, FiadoDetalle, Producto, Cliente, ClienteTienda, Tienda, Tendero, Pago, sequelize } = require('../models');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════════════════════════════════════
// 1. CREAR NUEVO FIADO
// POST /api/fiados
// ═══════════════════════════════════════════════════════════════════════════
const crearFiado = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const tenderoId = req.usuario.id;
        const { cliente_id, tienda_id, fecha_vencimiento, notas, productos } = req.body;

        if (!cliente_id || !tienda_id || !productos || productos.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'cliente_id, tienda_id y productos son obligatorios.' });
        }

        const tienda = await Tienda.findOne({ where: { id: tienda_id, tendero_id: tenderoId, activo: true }, transaction: t });
        if (!tienda) {
            await t.rollback();
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const vinculacion = await ClienteTienda.findOne({ where: { cliente_id, tienda_id, activo: true }, transaction: t });
        if (!vinculacion) {
            await t.rollback();
            return res.status(400).json({ error: 'El cliente no está vinculado a esta tienda.' });
        }

        let montoTotal = 0;
        const detallesFiado = [];

        for (const item of productos) {
            if (!item.producto_id || !item.cantidad || item.cantidad <= 0) {
                await t.rollback();
                return res.status(400).json({ error: 'Cada producto debe tener producto_id y cantidad válida.' });
            }

            const producto = await Producto.findByPk(item.producto_id, { transaction: t });
            if (!producto || !producto.activo) {
                await t.rollback();
                return res.status(404).json({ error: `Producto no encontrado o no disponible.` });
            }

            if (producto.stock_actual !== null && producto.stock_actual < item.cantidad) {
                await t.rollback();
                return res.status(400).json({ error: `Stock insuficiente para ${producto.nombre}.` });
            }

            const precioUnitario = producto.precio_venta;
            const subtotal = precioUnitario * item.cantidad;
            montoTotal += subtotal;

            detallesFiado.push({ producto_id: item.producto_id, cantidad: item.cantidad, precio_unitario: precioUnitario, subtotal });
        }

        const nuevoSaldo = Number(vinculacion.saldo_actual) + montoTotal;
        if (nuevoSaldo > Number(vinculacion.limite_credito)) {
            await t.rollback();
            return res.status(400).json({ error: `El fiado excede el límite de crédito.` });
        }

        const numeroFiado = `F-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const fiado = await Fiado.create({
            numero_fiado: numeroFiado, tienda_id, cliente_id, tendero_id: tenderoId,
            monto_total: montoTotal, monto_pagado: 0, estado: 'pendiente',
            fecha_fiado: new Date(), fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null, notas: notas || null
        }, { transaction: t });

        for (const detalle of detallesFiado) {
            await FiadoDetalle.create({ fiado_id: fiado.id, ...detalle }, { transaction: t });
            const producto = await Producto.findByPk(detalle.producto_id, { transaction: t });
            if (producto.stock_actual !== null) {
                await producto.update({ stock_actual: producto.stock_actual - detalle.cantidad, actualizado_en: new Date() }, { transaction: t });
            }
        }

        await vinculacion.update({ saldo_actual: nuevoSaldo, total_fiados: vinculacion.total_fiados + 1, actualizado_en: new Date() }, { transaction: t });
        await t.commit();

        const fiadoCompleto = await Fiado.findByPk(fiado.id, {
            include: [
                { model: FiadoDetalle, as: 'detalles', include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'precio_venta'] }] },
                { model: Cliente, as: 'cliente', attributes: ['id', 'nombres', 'apellidos', 'telefono'] },
                { model: Tienda, as: 'tienda', attributes: ['id', 'nombre'] }
            ]
        });

        res.status(201).json({ msg: 'Fiado creado exitosamente.', fiado: fiadoCompleto, nuevo_saldo_cliente: nuevoSaldo });
    } catch (error) {
        await t.rollback();
        console.error('Error al crear fiado:', error);
        res.status(500).json({ error: 'Error interno al crear el fiado.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. LISTAR FIADOS DE LA TIENDA
// GET /api/fiados?tienda_id=xxx&estado=pendiente
// ═══════════════════════════════════════════════════════════════════════════
const listarFiados = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { tienda_id, estado, cliente_id } = req.query;

        const whereFiado = {};
        if (tienda_id) {
            const tienda = await Tienda.findOne({ where: { id: tienda_id, tendero_id: tenderoId, activo: true } });
            if (!tienda) return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
            whereFiado.tienda_id = tienda_id;
        } else {
            const tiendas = await Tienda.findAll({ where: { tendero_id: tenderoId, activo: true }, attributes: ['id'] });
            whereFiado.tienda_id = { [Op.in]: tiendas.map(t => t.id) };
        }

        if (estado) whereFiado.estado = estado;
        if (cliente_id) whereFiado.cliente_id = cliente_id;

        const fiados = await Fiado.findAll({
            where: whereFiado,
            include: [
                { model: Cliente, as: 'cliente', attributes: ['id', 'nombres', 'apellidos', 'telefono'] },
                { model: Tienda, as: 'tienda', attributes: ['id', 'nombre'] }
            ],
            order: [['creado_en', 'DESC']],
            limit: 100
        });

        const fiadosFormateados = fiados.map(fiado => ({
            id: fiado.id, numero_fiado: fiado.numero_fiado, cliente: fiado.cliente, tienda: fiado.tienda,
            monto_total: fiado.monto_total, monto_pagado: fiado.monto_pagado,
            saldo_pendiente: fiado.monto_total - fiado.monto_pagado, estado: fiado.estado,
            fecha_fiado: fiado.fecha_fiado, fecha_vencimiento: fiado.fecha_vencimiento
        }));

        res.status(200).json({ msg: 'Fiados obtenidos exitosamente.', total: fiadosFormateados.length, fiados: fiadosFormateados });
    } catch (error) {
        console.error('Error al listar fiados:', error);
        res.status(500).json({ error: 'Error interno al obtener los fiados.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. OBTENER DETALLE DE UN FIADO
// GET /api/fiados/:id
// ═══════════════════════════════════════════════════════════════════════════
const obtenerFiado = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const fiado = await Fiado.findByPk(req.params.id, {
            include: [
                { model: FiadoDetalle, as: 'detalles', include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'precio_venta'] }] },
                { model: Cliente, as: 'cliente', attributes: ['id', 'nombres', 'apellidos', 'telefono'] },
                { model: Tienda, as: 'tienda', attributes: ['id', 'nombre'] },
                { model: Pago, as: 'pagos', attributes: ['id', 'monto', 'fecha_pago', 'metodo_pago', 'notas'], order: [['fecha_pago', 'DESC']] }
            ]
        });

        if (!fiado) return res.status(404).json({ error: 'Fiado no encontrado.' });

        const tienda = await Tienda.findOne({ where: { id: fiado.tienda_id, tendero_id: tenderoId } });
        if (!tienda) return res.status(403).json({ error: 'No tienes permisos para ver este fiado.' });

        res.status(200).json({
            msg: 'Fiado obtenido exitosamente.',
            fiado: {
                id: fiado.id, numero_fiado: fiado.numero_fiado, cliente: fiado.cliente, tienda: fiado.tienda,
                monto_total: fiado.monto_total, monto_pagado: fiado.monto_pagado,
                saldo_pendiente: fiado.monto_total - fiado.monto_pagado, estado: fiado.estado,
                fecha_fiado: fiado.fecha_fiado, fecha_vencimiento: fiado.fecha_vencimiento, notas: fiado.notas,
                detalles: fiado.detalles.map(d => ({ producto: d.producto, cantidad: d.cantidad, precio_unitario: d.precio_unitario, subtotal: d.subtotal })),
                pagos: fiado.pagos
            }
        });
    } catch (error) {
        console.error('Error al obtener fiado:', error);
        res.status(500).json({ error: 'Error interno al obtener el fiado.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. ACTUALIZAR FIADO
// PUT /api/fiados/:id
// ═══════════════════════════════════════════════════════════════════════════
const actualizarFiado = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { estado, fecha_vencimiento, notas } = req.body;
        const fiado = await Fiado.findByPk(req.params.id);

        if (!fiado) return res.status(404).json({ error: 'Fiado no encontrado.' });

        const tienda = await Tienda.findOne({ where: { id: fiado.tienda_id, tendero_id: tenderoId } });
        if (!tienda) return res.status(403).json({ error: 'No tienes permisos para editar este fiado.' });

        const datosActualizacion = { actualizado_en: new Date() };
        if (estado && ['pendiente', 'parcial', 'pagado', 'cancelado'].includes(estado)) datosActualizacion.estado = estado;
        if (fecha_vencimiento) datosActualizacion.fecha_vencimiento = new Date(fecha_vencimiento);
        if (notas !== undefined) datosActualizacion.notas = notas;

        await fiado.update(datosActualizacion);

        res.status(200).json({ msg: 'Fiado actualizado exitosamente.', fiado: { id: fiado.id, numero_fiado: fiado.numero_fiado, estado: fiado.estado, fecha_vencimiento: fiado.fecha_vencimiento, notas: fiado.notas } });
    } catch (error) {
        console.error('Error al actualizar fiado:', error);
        res.status(500).json({ error: 'Error interno al actualizar el fiado.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. ELIMINAR FIADO
// DELETE /api/fiados/:id
// ═══════════════════════════════════════════════════════════════════════════
const eliminarFiado = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const tenderoId = req.usuario.id;
        const fiado = await Fiado.findByPk(req.params.id, { transaction: t });

        if (!fiado) { await t.rollback(); return res.status(404).json({ error: 'Fiado no encontrado.' }); }

        const tienda = await Tienda.findOne({ where: { id: fiado.tienda_id, tendero_id: tenderoId }, transaction: t });
        if (!tienda) { await t.rollback(); return res.status(403).json({ error: 'No tienes permisos.' }); }

        const pagosCount = await Pago.count({ where: { fiado_id: fiado.id }, transaction: t });
        if (pagosCount > 0) { await t.rollback(); return res.status(400).json({ error: 'No se puede eliminar un fiado con pagos registrados.' }); }

        const detalles = await FiadoDetalle.findAll({ where: { fiado_id: fiado.id }, transaction: t });
        for (const detalle of detalles) {
            const producto = await Producto.findByPk(detalle.producto_id, { transaction: t });
            if (producto && producto.stock_actual !== null) {
                await producto.update({ stock_actual: producto.stock_actual + detalle.cantidad, actualizado_en: new Date() }, { transaction: t });
            }
        }

        const vinculacion = await ClienteTienda.findOne({ where: { cliente_id: fiado.cliente_id, tienda_id: fiado.tienda_id, activo: true }, transaction: t });
        if (vinculacion) {
            await vinculacion.update({
                saldo_actual: Math.max(0, Number(vinculacion.saldo_actual) - Number(fiado.monto_total)),
                total_fiados: Math.max(0, vinculacion.total_fiados - 1),
                actualizado_en: new Date()
            }, { transaction: t });
        }

        await FiadoDetalle.destroy({ where: { fiado_id: fiado.id }, transaction: t });
        await fiado.destroy({ transaction: t });
        await t.commit();

        res.status(200).json({ msg: 'Fiado eliminado exitosamente.' });
    } catch (error) {
        await t.rollback();
        console.error('Error al eliminar fiado:', error);
        res.status(500).json({ error: 'Error interno al eliminar el fiado.' });
    }
};

// ✅ EXPORTACIÓN CORREGIDA
module.exports = {
    crearFiado,
    listarFiados,
    obtenerFiado,
    actualizarFiado,
    eliminarFiado
};