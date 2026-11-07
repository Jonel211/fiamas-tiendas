const { Producto, Tienda, Categoria, Tendero, Cliente, Fiado, Pago, ClienteTienda, FiadoDetalle, sequelize } = require('../models');
const { Op } = require('sequelize');

// ══════════════════════════════════════════════════════════════════════════
// 1. CREAR PRODUCTO
// POST /api/productos
// ══════════════════════════════════════════════════════════════════════════
exports.crearProducto = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const { nombre, descripcion, tienda_id, categoria_id, codigo_barras, tipo_venta, unidad_medida, precio_venta, activo, imagen_url } = req.body;

        if (!nombre || !tienda_id || !categoria_id || precio_venta === undefined) {
            return res.status(400).json({ error: 'El nombre, tienda_id, categoria_id y precio_venta son obligatorios.' });
        }

        const whereTienda = esAdmin ? { id: tienda_id, activo: true } : { id: tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const categoria = await Categoria.findByPk(categoria_id);
        if (!categoria || categoria.tienda_id !== tienda_id) {
            return res.status(400).json({ error: 'La categoría no existe o no pertenece a esta tienda.' });
        }

        const nuevoProducto = await Producto.create({
            nombre: nombre.trim(),
            descripcion: descripcion ? descripcion.trim() : null,
            tienda_id,
            categoria_id,
            codigo_barras: codigo_barras || null,
            tipo_venta: tipo_venta || 'unidad',
            unidad_medida: unidad_medida || 'unidad',
            precio_venta: parseFloat(precio_venta),
            activo: activo !== undefined ? Boolean(activo) : true,
            imagen_url: imagen_url || null
        });

        res.status(201).json({
            msg: 'Producto creado exitosamente.',
            producto: nuevoProducto
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error interno al crear el producto.', detalle: error.message });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 2. LISTAR PRODUCTOS DE UNA TIENDA
// GET /api/productos/tienda/:tiendaId
// ══════════════════════════════════════════════════════════════════════════
exports.listarProductosPorTienda = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const tiendaId = req.params.tiendaId;

        if (!tiendaId) {
            return res.status(400).json({ error: 'El parámetro tienda_id es obligatorio.' });
        }

        const whereTienda = esAdmin ? { id: tiendaId, activo: true } : { id: tiendaId, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const productos = await Producto.findAll({
            where: { tienda_id: tiendaId },
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'icono', 'color']
            }],
            order: [['nombre', 'ASC']]
        });

        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al listar productos:', error);
        res.status(500).json({ error: 'Error interno al obtener los productos.', detalle: error.message });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 3. ACTUALIZAR PRODUCTO
// PUT /api/productos/:id
// ══════════════════════════════════════════════════════════════════════════
exports.actualizarProducto = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const productoId = req.params.id;
        const { nombre, descripcion, categoria_id, codigo_barras, tipo_venta, unidad_medida, precio_venta, activo, imagen_url } = req.body;

        const producto = await Producto.findByPk(productoId);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const whereTienda = esAdmin ? { id: producto.tienda_id, activo: true } : { id: producto.tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para editar este producto.' });
        }

        if (categoria_id && categoria_id !== producto.categoria_id) {
            const categoria = await Categoria.findByPk(categoria_id);
            if (!categoria || categoria.tienda_id !== producto.tienda_id) {
                return res.status(400).json({ error: 'La categoría no existe o no pertenece a esta tienda.' });
            }
        }

        const datosActualizacion = {};
        if (nombre !== undefined) datosActualizacion.nombre = nombre.trim();
        if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? descripcion.trim() : null;
        if (categoria_id !== undefined) datosActualizacion.categoria_id = categoria_id;
        if (codigo_barras !== undefined) datosActualizacion.codigo_barras = codigo_barras;
        if (tipo_venta !== undefined) datosActualizacion.tipo_venta = tipo_venta;
        if (unidad_medida !== undefined) datosActualizacion.unidad_medida = unidad_medida;
        if (precio_venta !== undefined) datosActualizacion.precio_venta = parseFloat(precio_venta);
        if (activo !== undefined) datosActualizacion.activo = Boolean(activo);
        if (imagen_url !== undefined) datosActualizacion.imagen_url = imagen_url;

        await producto.update(datosActualizacion);

        res.status(200).json({
            msg: 'Producto actualizado exitosamente.',
            producto
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno al actualizar el producto.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 4. ELIMINAR PRODUCTO (Hard Delete)
// DELETE /api/productos/:id
// ═════════════════════════════════════════════════════════════════════════
exports.eliminarProducto = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const productoId = req.params.id;

        const producto = await Producto.findByPk(productoId);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const whereTienda = esAdmin ? { id: producto.tienda_id, activo: true } : { id: producto.tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para eliminar este producto.' });
        }

        await producto.destroy();

        res.status(200).json({
            msg: 'Producto eliminado permanentemente.'
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno al eliminar el producto.' });
    }
};

// ═════════════════════════════════════════════════════════════════════════
// CONTROLADOR DE REPORTES
// ═════════════════════════════════════════════════════════════════════════

exports.obtenerReporteVentas = async (req, res) => {
    try {
        res.status(200).json({
            msg: 'Reporte de ventas obtenido exitosamente (función en desarrollo)',
            data: []
        });
    } catch (error) {
        console.error('Error al obtener reporte de ventas:', error);
        res.status(500).json({ error: 'Error interno al obtener el reporte de ventas.' });
    }
};

exports.obtenerReporteProductos = async (req, res) => {
    try {
        res.status(200).json({
            msg: 'Reporte de productos obtenido exitosamente (función en desarrollo)',
            data: []
        });
    } catch (error) {
        console.error('Error al obtener reporte de productos:', error);
        res.status(500).json({ error: 'Error interno al obtener el reporte de productos.' });
    }
};

exports.obtenerEstadisticas = async (req, res) => {
    try {
        const totalTiendas = await Tienda.count();
        const totalTenderos = await Tendero.count();

        const tiendasActivas = await Tienda.count({ where: { activo: true } });
        const tiendasInactivas = await Tienda.count({ where: { activo: false } });

        const tenderosActivos = await Tendero.count({ where: { activo: true } });
        const tenderosInactivos = await Tendero.count({ where: { activo: false } });

        const getGrowthData = async (Model) => {
            const records = await Model.findAll({ attributes: ['creado_en'], raw: true });
            const currentDate = new Date();
            const data = [];

            for (let i = 5; i >= 0; i--) {
                const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

                const count = records.filter(r => {
                    if (!r.creado_en) return false;
                    const rd = new Date(r.creado_en);
                    return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
                }).length;

                data.push({ mes: mesKey, total: count });
            }
            return data;
        };

        const crecimientoTiendas = await getGrowthData(Tienda);
        const crecimientoTenderos = await getGrowthData(Tendero);

        const ultimosTenderosRaw = await Tendero.findAll({
            limit: 5,
            order: [['creado_en', 'DESC']],
            include: [{
                model: Tienda,
                as: 'tiendas',
                attributes: ['nombre']
            }]
        });

        const ultimosTenderos = ultimosTenderosRaw.map(t => ({
            id: t.id,
            nombre: `${t.nombres} ${t.apellidos}`,
            tienda: t.tiendas && t.tiendas.length > 0 ? t.tiendas[0].nombre : 'Sin tienda',
            estado: t.activo ? 'Activo' : 'Inactivo',
            ultima_actividad: t.creado_en
        }));

        res.status(200).json({
            resumen: {
                totalTiendas,
                totalTenderos,
                tiendasActivas,
                tiendasInactivas,
                tenderosActivos,
                tenderosInactivos
            },
            crecimientoTiendas,
            crecimientoTenderos,
            ultimosTenderos
        });

    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ error: 'Error interno al obtener las estadísticas.' });
    }
};

// ═════════════════════════════════════════════════════════════════════════
// REPORTES PARA LA APP DEL TENDERO
// GET /api/reportes/resumen-app?tienda_id=xxx&periodo=semana&cliente_id=yyy
// ═════════════════════════════════════════════════════════════════════════

// Perú es UTC-5 (sin horario de verano); el servidor está en UTC
const OFFSET_PERU_MS = 5 * 60 * 60 * 1000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Medianoche de Perú expresada en UTC. offsetDias = 0 es hoy.
function inicioDiaPeru(offsetDias = 0) {
    const p = new Date(Date.now() - OFFSET_PERU_MS);
    return new Date(Date.UTC(p.getUTCFullYear(), p.getUTCMonth(), p.getUTCDate() - offsetDias, 5, 0, 0));
}

function inicioMesPeru() {
    const p = new Date(Date.now() - OFFSET_PERU_MS);
    return new Date(Date.UTC(p.getUTCFullYear(), p.getUTCMonth(), 1, 5, 0, 0));
}

exports.obtenerReportesTendero = async (req, res) => {
    try {
        const { tienda_id, periodo } = req.query;
        const cliente_id = req.query.cliente_id && req.query.cliente_id !== 'all'
            ? String(req.query.cliente_id)
            : null;

        if (!tienda_id || !UUID_REGEX.test(String(tienda_id))) {
            return res.status(400).json({ error: 'El parámetro tienda_id es obligatorio y debe ser válido.' });
        }
        if (cliente_id && !UUID_REGEX.test(cliente_id)) {
            return res.status(400).json({ error: 'El cliente_id no es válido.' });
        }

        // Validar que la tienda sea del usuario
        const whereTienda = req.usuario.rol === 'admin'
            ? { id: tienda_id }
            : { id: tienda_id, tendero_id: req.usuario.id, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const estadosPendientes = { [Op.in]: ['pendiente', 'parcial'] };

        // 1. Fecha de inicio según el periodo
        let fechaInicio = null;
        if (periodo === 'hoy') fechaInicio = inicioDiaPeru(0);
        else if (periodo === 'semana') fechaInicio = inicioDiaPeru(6);
        else if (periodo === 'mes') fechaInicio = inicioMesPeru();

        const whereFiado = { tienda_id, estado: { [Op.ne]: 'cancelado' } };
        const wherePago = { tienda_id };
        if (fechaInicio) {
            whereFiado.creado_en = { [Op.gte]: fechaInicio };
            wherePago.fecha_pago = { [Op.gte]: fechaInicio };
        }
        if (cliente_id) {
            whereFiado.cliente_id = cliente_id;
            wherePago.cliente_id = cliente_id;
        }

        const nombreCliente = (c) => ({
            nombres: c ? c.nombres : '',
            apellidos: c ? c.apellidos : ''
        });

        // 2. Listas (para los PDF). Se arman como objetos simples.
        const fiadosDb = await Fiado.findAll({
            where: whereFiado,
            include: [{ model: Cliente, as: 'cliente', attributes: ['nombres', 'apellidos'] }],
            order: [['creado_en', 'DESC']]
        });
        const listaFiados = fiadosDb.map(f => ({
            id: f.id,
            creado_en: f.creado_en,
            estado: f.estado,
            monto_total: Number(f.monto_total),
            monto_pagado: Number(f.monto_pagado || 0),
            cliente: nombreCliente(f.cliente)
        }));

        const pagosDb = await Pago.findAll({
            where: wherePago,
            include: [{ model: Cliente, as: 'cliente', attributes: ['nombres', 'apellidos'] }],
            order: [['fecha_pago', 'DESC']]
        });
        const listaCobros = pagosDb.map(p => ({
            id: p.id,
            fecha_pago: p.fecha_pago,
            monto: Number(p.monto),
            cliente: nombreCliente(p.cliente)
        }));

        // 3. Totales
        const totalFiados = listaFiados.length;
        const montoTotalFiado = listaFiados.reduce((s, f) => s + f.monto_total, 0);
        const totalCobros = listaCobros.length;
        const montoTotalCobrado = listaCobros.reduce((s, p) => s + p.monto, 0);

        // Por cobrar: saldo actual (no depende del periodo, sí del cliente)
        const pendientes = await Fiado.findAll({
            where: { tienda_id, estado: estadosPendientes, ...(cliente_id && { cliente_id }) },
            attributes: ['cliente_id', 'monto_total', 'monto_pagado'],
            raw: true
        });
        let porCobrar = 0;
        const clientesUnicos = new Set();
        pendientes.forEach(f => {
            porCobrar += Number(f.monto_total) - Number(f.monto_pagado);
            clientesUnicos.add(f.cliente_id);
        });

        // 4. Top productos (solo obedece al periodo, no al cliente)
        const whereFiadoTop = { tienda_id, estado: { [Op.ne]: 'cancelado' } };
        if (fechaInicio) whereFiadoTop.creado_en = { [Op.gte]: fechaInicio };

        const topRaw = await FiadoDetalle.findAll({
            include: [
                { model: Fiado, as: 'fiado', where: whereFiadoTop, attributes: [] },
                { model: Producto, as: 'producto', attributes: ['nombre'] }
            ],
            attributes: ['producto_id', [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido']],
            group: ['producto_id', 'producto.id', 'producto.nombre'],
            order: [[sequelize.literal('total_vendido'), 'DESC']],
            limit: 10,
            raw: true
        });
        const topProductos = topRaw.map(p => ({
            nombre: p['producto.nombre'],
            cantidad: Number(p.total_vendido)
        }));

        // 5. Totales del perfil
        const totalClientes = await ClienteTienda.count({ where: { tienda_id, activo: true } });
        const totalProductos = await Producto.count({ where: { tienda_id, activo: true } });

        // 6. Gráfico: últimos 7 días, una sola consulta, días en hora de Perú
        const fiadosGrafico = await Fiado.findAll({
            where: {
                tienda_id,
                estado: { [Op.ne]: 'cancelado' },
                ...(cliente_id && { cliente_id }),
                creado_en: { [Op.gte]: inicioDiaPeru(6) }
            },
            attributes: ['creado_en', 'monto_total'],
            raw: true
        });

        const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const ini = inicioDiaPeru(i).getTime();
            const fin = ini + 24 * 60 * 60 * 1000;
            const monto = fiadosGrafico
                .filter(f => {
                    const t = new Date(f.creado_en).getTime();
                    return t >= ini && t < fin;
                })
                .reduce((s, f) => s + Number(f.monto_total), 0);
            const diaPeru = new Date(ini - OFFSET_PERU_MS);
            chartData.push({ dia: diasSemana[diaPeru.getUTCDay()], monto });
        }

        res.status(200).json({
            resumen: {
                version: 'reportes-v2',
                filtros: { periodo: periodo || 'todo', cliente_id },
                totalFiados, montoTotalFiado, porCobrar,
                clientesPendientes: clientesUnicos.size,
                totalCobros, montoTotalCobrado,
                totalClientes, totalProductos,
                topProductos, chartData, listaFiados, listaCobros
            }
        });

    } catch (error) {
        console.error('Error al obtener reportes de la tienda:', error);
        res.status(500).json({ error: 'Error interno al obtener los reportes.' });
    }
};