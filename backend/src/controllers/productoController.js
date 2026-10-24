const { Producto, Tienda, Categoria } = require('../models');
const { Op } = require('sequelize');

// ══════════════════════════════════════════════════════════════════════════
// 1. CREAR PRODUCTO
// POST /api/productos
// ══════════════════════════════════════════════════════════════════════════
exports.crearProducto = async (req, res) => {
    try {
        console.log(' [CREAR PRODUCTO] Body recibido:', JSON.stringify(req.body, null, 2));
        console.log('🔑 [CREAR PRODUCTO] Usuario:', req.usuario.id, 'Rol:', req.usuario.rol);

        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const { nombre, descripcion, tienda_id, categoria_id, codigo_barras, tipo_venta, unidad_medida, precio_venta, activo, imagen_url } = req.body;

        if (!nombre || !tienda_id || !categoria_id || precio_venta === undefined) {
            return res.status(400).json({ error: 'El nombre, tienda_id, categoria_id y precio_venta son obligatorios.' });
        }

        console.log('🔍 [CREAR PRODUCTO] Buscando tienda:', tienda_id);
        const whereTienda = esAdmin ? { id: tienda_id, activo: true } : { id: tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            console.log('❌ [CREAR PRODUCTO] Tienda no encontrada o sin permisos');
            return res.status(404).json({ error: 'No tienes permiso para acceder a los datos de esta tienda.' });
        }

        console.log('✅ [CREAR PRODUCTO] Tienda válida:', tienda.nombre);

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

        console.log('✅ [CREAR PRODUCTO] Producto creado:', nuevoProducto.id);

        res.status(201).json({
            msg: 'Producto creado exitosamente.',
            producto: nuevoProducto
        });
    } catch (error) {
        console.error('❌ [CREAR PRODUCTO] Error:', error);
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
// 3. OBTENER PRODUCTO POR ID
// GET /api/productos/:id
// ══════════════════════════════════════════════════════════════════════════
exports.obtenerProductoPorId = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const productoId = req.params.id;

        const producto = await Producto.findByPk(productoId, {
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'icono', 'color']
            }]
        });

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        const whereTienda = esAdmin ? { id: producto.tienda_id, activo: true } : { id: producto.tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para ver este producto.' });
        }

        res.status(200).json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error interno al obtener el producto.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 4. ACTUALIZAR PRODUCTO
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

        // OBTENER EL PRODUCTO ACTUALIZADO CON LA CATEGORÍA INCLUIDA
        const productoActualizado = await Producto.findByPk(productoId, {
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'icono', 'color']
            }]
        });

        res.status(200).json({
            msg: 'Producto actualizado exitosamente.',
            producto: productoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno al actualizar el producto.' });
    }
};
// ══════════════════════════════════════════════════════════════════════════
// 5. ELIMINAR PRODUCTO (Hard Delete)
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