const { Producto, Tienda, Categoria, Tendero, Fiado, Pago, ClienteTienda, FiadoDetalle, sequelize } = require('../models');
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

        // ─── 1. CRECIMIENTO CON EL FORMATO QUE ESPERA REACT ───
        const getGrowthData = async (Model) => {
            const records = await Model.findAll({ attributes: ['creado_en'], raw: true });
            const currentDate = new Date();
            const data = [];
            
            for (let i = 5; i >= 0; i--) {
                const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                
                // ✅ Formato "YYYY-MM" (ej: 2026-10) para que haga match con React
                const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                
                const count = records.filter(r => {
                    if (!r.creado_en) return false;
                    const rd = new Date(r.creado_en);
                    return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
                }).length;
                
                // ✅ Usamos "total" en lugar de "cantidad"
                data.push({ mes: mesKey, total: count });
            }
            return data;
        };

        const crecimientoTiendas = await getGrowthData(Tienda);
        const crecimientoTenderos = await getGrowthData(Tendero);

        // ─── 2. TABLA DE ÚLTIMOS TENDEROS ───
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

        // ─── 3. RESPUESTA FINAL ───
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
// OBTENER REPORTES Y ESTADÍSTICAS PARA LA APP DEL TENDERO
// GET /api/reportes/resumen-app?tienda_id=xxx&periodo=semana&cliente_id=yyy
// ═════════════════════════════════════════════════════════════════════════
exports.obtenerReportesTendero = async (req, res) => {
    try {
        const { tienda_id, periodo, cliente_id } = req.query;
        if (!tienda_id) {
            return res.status(400).json({ error: 'El parámetro tienda_id es obligatorio.' });
        }

        const estadosPendientes = { [Op.in]: ['pendiente', 'parcial'] };
        
        // 1. Calcular las fechas según el periodo seleccionado
        const ahora = new Date();
        let fechaInicio = null;
        
        if (periodo === 'hoy') {
            fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        } else if (periodo === 'semana') {
            fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 7);
        } else if (periodo === 'mes') {
            fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        }

        const whereFiado = { tienda_id };
        const wherePago = { tienda_id };
        
        if (fechaInicio) {
            whereFiado.creado_en = { [Op.gte]: fechaInicio };
            wherePago.fecha_pago = { [Op.gte]: fechaInicio };
        }

        // FILTRO POR CLIENTE (Si viene en la URL)
        if (cliente_id) {
            whereFiado.cliente_id = cliente_id;
            wherePago.cliente_id = cliente_id;
        }

        // 2. Traer las listas detalladas (Para los PDFs específicos)
        const listaFiados = await Fiado.findAll({
            where: whereFiado,
            include: [{ model: Cliente, as: 'cliente', attributes: ['nombres', 'apellidos'] }],
            order: [['creado_en', 'DESC']],
            raw: true,
            nest: true
        });

        const listaCobros = await Pago.findAll({
            where: wherePago,
            include: [{ model: Cliente, as: 'cliente', attributes: ['nombres', 'apellidos'] }],
            order: [['fecha_pago', 'DESC']],
            raw: true,
            nest: true
        });

        // 3. Calcular Totales a partir de las listas filtradas
        const totalFiados = listaFiados.length;
        const montoTotalFiado = listaFiados.reduce((sum, f) => sum + Number(f.monto_total), 0);

        // Calcular Fiados por Cobrar
        const fiadosPendientesLista = await Fiado.findAll({
            where: { tienda_id, estado: estadosPendientes, ...(cliente_id && { cliente_id }) },
            attributes: ['cliente_id', 'monto_total', 'monto_pagado'],
            raw: true
        });

        let porCobrar = 0;
        const clientesUnicos = new Set();
        fiadosPendientesLista.forEach(f => {
            porCobrar += (Number(f.monto_total) - Number(f.monto_pagado));
            clientesUnicos.add(f.cliente_id);
        });

        const totalCobros = listaCobros.length;
        const montoTotalCobrado = listaCobros.reduce((sum, p) => sum + Number(p.monto), 0);

        // 4. Top Productos
        const topProductosRaw = await FiadoDetalle.findAll({
            include: [
                { model: Fiado, as: 'fiado', where: whereFiado, attributes: [] },
                { model: Producto, as: 'producto', attributes: ['nombre'] }
            ],
            attributes: ['producto_id', [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido']],
            group: ['producto_id', 'producto.id', 'producto.nombre'],
            order: [[sequelize.literal('total_vendido'), 'DESC']],
            limit: 10,
            raw: true
        });

        const topProductos = topProductosRaw.map(p => ({
            nombre: p['producto.nombre'],
            cantidad: Number(p.total_vendido)
        }));

        // 5. Totales para el Perfil
        const totalClientes = await ClienteTienda.count({ where: { tienda_id, activo: true } });
        const totalProductos = await Producto.count({ where: { tienda_id, activo: true } });

        // 6. Datos para el gráfico (últimos 7 días de fiados)
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const dia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - i);
            const diaSiguiente = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - i + 1);
            
            const montoDia = await Fiado.sum('monto_total', {
                where: {
                    tienda_id,
                    ...(cliente_id && { cliente_id }), // Filtro de cliente también para el gráfico
                    creado_en: { [Op.gte]: dia, [Op.lt]: diaSiguiente }
                }
            }) || 0;

            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            chartData.push({
                dia: diasSemana[dia.getDay()],
                monto: Number(montoDia)
            });
        }

        res.status(200).json({
            resumen: {
                totalFiados,
                montoTotalFiado,
                porCobrar,
                clientesPendientes: clientesUnicos.size,
                totalCobros,
                montoTotalCobrado,
                totalClientes,
                totalProductos,
                topProductos,
                chartData,
                listaFiados, // NUEVO: Lista para el PDF
                listaCobros  // NUEVO: Lista para el PDF
            }
        });

    } catch (error) {
        console.error('Error al obtener reportes de la tienda:', error);
        res.status(500).json({ error: 'Error interno al obtener los reportes.' });
    }
};