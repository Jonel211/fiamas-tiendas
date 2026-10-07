const { Producto, Categoria, Tienda, Alerta, LogSistema, sequelize } = require('../models');

// ==========================================
// 1. CREAR PRODUCTO
// ==========================================
exports.crearProducto = async (req, res) => {
    try {
        const {
            tienda_id,
            categoria_id,
            nombre,
            descripcion,
            codigo_barras,
            imagen_url,
            tipo_venta,
            unidad_medida,
            precio_venta,
            stock_actual,
            stock_minimo
        } = req.body;

        // Validar que la tienda exista y esté activa
        const tienda = await Tienda.findByPk(tienda_id);
        if (!tienda || !tienda.activo) {
            return res.status(404).json({ error: 'La tienda no existe o está inactiva.' });
        }

        // Validar que la categoría exista y pertenezca a esa tienda
        const categoria = await Categoria.findOne({
            where: { id: categoria_id, tienda_id, activo: true }
        });
        if (!categoria) {
            return res.status(400).json({ error: 'La categoría no existe o no pertenece a esta tienda.' });
        }

        // Validar que no exista un producto con el mismo código de barras
        if (codigo_barras) {
            const existente = await Producto.findOne({ where: { codigo_barras } });
            if (existente) {
                return res.status(400).json({ error: 'Ya existe un producto con ese código de barras.' });
            }
        }

        // Crear el producto
        const nuevoProducto = await Producto.create({
            tienda_id,
            categoria_id,
            nombre,
            descripcion,
            codigo_barras,
            imagen_url,
            tipo_venta: tipo_venta || 'unidad',
            unidad_medida: unidad_medida || 'unidad',
            precio_venta,
            stock_actual: stock_actual || 0,
            stock_minimo: stock_minimo || 0,
            activo: true,
            creado_en: new Date(),
            actualizado_en: new Date()
        });

        res.status(201).json({
            msg: 'Producto creado exitosamente',
            producto: nuevoProducto
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error interno al crear el producto.', detalle: error.message });
    }
};

// ==========================================
// 2. OBTENER TODOS LOS PRODUCTOS DE UNA TIENDA
// ==========================================
exports.getProductosPorTienda = async (req, res) => {
    try {
        let tiendaId;

        // Si es tendero, forzar su tienda. Si es admin, puede pasar tienda_id por params o query
        if (req.usuario.rol === 'tendero') {
            tiendaId = req.usuario.tienda_id;
        } else {
            tiendaId = req.params.tienda_id || req.query.tienda_id;
        }

        if (!tiendaId) {
            return res.status(400).json({ error: 'Se requiere el ID de la tienda.' });
        }

        const productos = await Producto.findAll({
            where: { tienda_id: tiendaId, activo: true },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre', 'imagen_url']
                }
            ],
            order: [['nombre', 'ASC']]
        });

        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error interno al obtener productos.' });
    }
};

// ==========================================
// 3. OBTENER UN PRODUCTO POR ID
// ==========================================
exports.getProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOne({
            where: { id, activo: true },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre', 'imagen_url']
                },
                {
                    model: Tienda,
                    as: 'tienda',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.status(200).json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error interno al obtener el producto.' });
    }
};

// ==========================================
// 4. ACTUALIZAR PRODUCTO
// ==========================================
exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            categoria_id,
            nombre,
            descripcion,
            codigo_barras,
            imagen_url,
            tipo_venta,
            unidad_medida,
            precio_venta,
            stock_actual,
            stock_minimo
        } = req.body;

        const producto = await Producto.findOne({ where: { id, activo: true } });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        // Si se cambia la categoría, validar que pertenezca a la misma tienda
        if (categoria_id && categoria_id !== producto.categoria_id) {
            const categoria = await Categoria.findOne({
                where: { id: categoria_id, tienda_id: producto.tienda_id, activo: true }
            });
            if (!categoria) {
                return res.status(400).json({ error: 'La categoría no existe o no pertenece a esta tienda.' });
            }
        }

        // Si se cambia el código de barras, validar que no exista en otro producto
        if (codigo_barras && codigo_barras !== producto.codigo_barras) {
            const existente = await Producto.findOne({ where: { codigo_barras } });
            if (existente) {
                return res.status(400).json({ error: 'Ya existe otro producto con ese código de barras.' });
            }
        }

        // Construir el objeto de actualización solo con los campos que se enviaron
        const datosActualizacion = {};
        if (categoria_id !== undefined) datosActualizacion.categoria_id = categoria_id;
        if (nombre !== undefined) datosActualizacion.nombre = nombre;
        if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
        if (codigo_barras !== undefined) datosActualizacion.codigo_barras = codigo_barras;
        if (imagen_url !== undefined) datosActualizacion.imagen_url = imagen_url;
        if (tipo_venta !== undefined) datosActualizacion.tipo_venta = tipo_venta;
        if (unidad_medida !== undefined) datosActualizacion.unidad_medida = unidad_medida;
        if (precio_venta !== undefined) datosActualizacion.precio_venta = precio_venta;
        if (stock_actual !== undefined) datosActualizacion.stock_actual = stock_actual;
        if (stock_minimo !== undefined) datosActualizacion.stock_minimo = stock_minimo;
        datosActualizacion.actualizado_en = new Date();

        await producto.update(datosActualizacion);

        // Verificar si el stock bajó del mínimo después de la actualización
        const stockFinal = datosActualizacion.stock_actual !== undefined ? datosActualizacion.stock_actual : producto.stock_actual;
        const minimoFinal = datosActualizacion.stock_minimo !== undefined ? datosActualizacion.stock_minimo : producto.stock_minimo;

        if (stockFinal <= minimoFinal) {
            await Alerta.create({
                tienda_id: producto.tienda_id,
                producto_id: producto.id,
                tipo_alerta: 'stock_bajo',
                prioridad: 'alta',
                titulo: 'Stock Bajo',
                mensaje: `El producto "${producto.nombre}" tiene stock (${stockFinal}) por debajo del mínimo (${minimoFinal}).`,
                canal: 'interno',
                estado: 'pendiente',
                fecha_creacion: new Date()
            });
        }

        res.status(200).json({
            msg: 'Producto actualizado exitosamente',
            producto
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error interno al actualizar el producto.', detalle: error.message });
    }
};

// ==========================================
// 5. ELIMINAR PRODUCTO (Soft Delete)
// ==========================================
exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOne({ where: { id, activo: true } });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        // Soft delete: solo marcamos como inactivo
        await producto.update({ activo: false, actualizado_en: new Date() });

        res.status(200).json({ msg: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno al eliminar el producto.' });
    }
};

// ==========================================
// 6. OBTENER PRODUCTOS CON STOCK BAJO
// ==========================================
exports.getProductosStockBajo = async (req, res) => {
    try {
        let tiendaId;

        if (req.usuario.rol === 'tendero') {
            tiendaId = req.usuario.tienda_id;
        } else {
            tiendaId = req.params.tienda_id || req.query.tienda_id;
        }

        if (!tiendaId) {
            return res.status(400).json({ error: 'Se requiere el ID de la tienda.' });
        }

        // Buscar productos donde stock_actual <= stock_minimo
        const productos = await Producto.findAll({
            where: {
                tienda_id: tiendaId,
                activo: true,
                [sequelize.Op.and]: [
                    sequelize.where(
                        sequelize.col('stock_actual'),
                        { [sequelize.Op.lte]: sequelize.col('stock_minimo') }
                    )
                ]
            },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['stock_actual', 'ASC']]
        });

        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos con stock bajo:', error);
        res.status(500).json({ error: 'Error interno al obtener productos con stock bajo.' });
    }
};

// ==========================================
// 7. BUSCAR PRODUCTOS POR NOMBRE O CÓDIGO DE BARRAS
// ==========================================
exports.buscarProductos = async (req, res) => {
    try {
        const { q } = req.query; // Query de búsqueda
        let tiendaId;

        if (req.usuario.rol === 'tendero') {
            tiendaId = req.usuario.tienda_id;
        } else {
            tiendaId = req.query.tienda_id;
        }

        if (!q) {
            return res.status(400).json({ error: 'Se requiere un término de búsqueda (parámetro q).' });
        }

        const whereCondition = {
            activo: true,
            [sequelize.Op.or]: [
                { nombre: { [sequelize.Op.iLike]: `%${q}%` } },
                { codigo_barras: { [sequelize.Op.iLike]: `%${q}%` } }
            ]
        };

        if (tiendaId) {
            whereCondition.tienda_id = tiendaId;
        }

        const productos = await Producto.findAll({
            where: whereCondition,
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ],
            limit: 50,
            order: [['nombre', 'ASC']]
        });

        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al buscar productos:', error);
        res.status(500).json({ error: 'Error interno al buscar productos.' });
    }
};