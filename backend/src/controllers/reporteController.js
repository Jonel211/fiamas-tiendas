// ✅ Agregamos 'Tendero' a la importación
const { Producto, Tienda, Categoria, Tendero } = require('../models');
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