const { Producto, Categoria, Tienda, Alerta, LogSistema, sequelize } = require('../models');
const { Op } = require('sequelize');

// 1. CREAR PRODUCTO
exports.crearProducto = async (req, res) => {
    try {
        let {
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

        // Si es tendero, asegurar que cree el producto en su propia tienda
        if (req.usuario && req.usuario.rol === 'tendero') {
            if (!req.usuario.tienda_id) {
                return res.status(403).json({ error: 'El tendero no tiene una tienda asignada.' });
            }
            tienda_id = req.usuario.tienda_id;
        }

        if (!tienda_id) {
            return res.status(400).json({ error: 'El ID de la tienda es obligatorio.' });
        }

        if (!nombre || precio_venta === undefined) {
            return res.status(400).json({ error: 'El nombre y el precio de venta son obligatorios.' });
        }

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
            descripcion: descripcion || null,
            codigo_barras: codigo_barras || null,
            imagen_url: imagen_url || null,
            tipo_venta: tipo_venta || 'unidad',
            unidad_medida: unidad_medida || 'unidad',
            precio_venta,
            stock_actual: stock_actual !== undefined ? stock_actual : null,
            stock_minimo: stock_minimo !== undefined ? stock_minimo : null,
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

// 2. OBTENER TODOS LOS PRODUCTOS DE UNA TIENDA
exports.getProductosPorTienda = async (req, res) => {
    try {
        let tiendaId;

        // Si es tendero, forzar su tienda. Si es admin, puede pasar tienda_id por params o query
        if (req.usuario && req.usuario.rol === 'tendero') {
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
                    attributes: ['id', 'nombre', 'icono', 'color']
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

// 3. OBTENER UN PRODUCTO POR ID
exports.getProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOne({
            where: { id, activo: true },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre', 'icono', 'color']
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

// 4. ACTUALIZAR PRODUCTO
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

        // Control de acceso multi-tienda: el tendero solo puede editar sus propios productos
        if (req.usuario && req.usuario.rol === 'tendero' && producto.tienda_id !== req.usuario.tienda_id) {
            return res.status(403).json({ error: 'No tienes permiso para modificar productos de otra tienda.' });
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
            const existente = await Producto.findOne({ where: { codigo_barras, id: { [Op.ne]: id } } });
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

        // Verificar si el stock bajó del mínimo después de la actualización (solo si se gestiona stock)
        const valorStock = datosActualizacion.stock_actual !== undefined ? datosActualizacion.stock_actual : producto.stock_actual;
        const valorMinimo = datosActualizacion.stock_minimo !== undefined ? datosActualizacion.stock_minimo : producto.stock_minimo;

        if (valorStock !== null && valorMinimo !== null) {
            const stockFinal = Number(valorStock);
            const minimoFinal = Number(valorMinimo);

            if (stockFinal <= minimoFinal) {
                // Evitar alertas duplicadas pendientes
                const alertaExistente = await Alerta.findOne({
                    where: {
                        tienda_id: producto.tienda_id,
                        producto_id: producto.id,
                        tipo_alerta: 'stock_bajo',
                        estado: 'pendiente'
                    }
                });

                if (!alertaExistente) {
                    await Alerta.create({
                        emisor_tipo: 'sistema',
                        destinatario_tipo: 'tendero',
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
            }
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

// 5. ELIMINAR PRODUCTO (Soft Delete)
exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOne({ where: { id, activo: true } });
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        // Control de acceso multi-tienda: el tendero solo puede eliminar sus propios productos
        if (req.usuario && req.usuario.rol === 'tendero' && producto.tienda_id !== req.usuario.tienda_id) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar productos de otra tienda.' });
        }

        // Soft delete: solo marcamos como inactivo
        await producto.update({ activo: false, actualizado_en: new Date() });

        res.status(200).json({ msg: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error interno al eliminar el producto.' });
    }
};

// 6. OBTENER PRODUCTOS CON STOCK BAJO
exports.getProductosStockBajo = async (req, res) => {
    try {
        let tiendaId;

        if (req.usuario && req.usuario.rol === 'tendero') {
            tiendaId = req.usuario.tienda_id;
        } else {
            tiendaId = req.params.tienda_id || req.query.tienda_id;
        }

        if (!tiendaId) {
            return res.status(400).json({ error: 'Se requiere el ID de la tienda.' });
        }

        // Buscar productos donde stock_actual <= stock_minimo (excluyendo productos sin control de stock)
        const productos = await Producto.findAll({
            where: {
                tienda_id: tiendaId,
                activo: true,
                stock_actual: { [Op.ne]: null },
                stock_minimo: { [Op.ne]: null },
                [Op.and]: [
                    sequelize.where(
                        sequelize.col('stock_actual'),
                        { [Op.lte]: sequelize.col('stock_minimo') }
                    )
                ]
            },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre', 'icono', 'color']
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

// 7. BUSCAR PRODUCTOS POR NOMBRE O CÓDIGO DE BARRAS
exports.buscarProductos = async (req, res) => {
    try {
        const { q } = req.query; // Query de búsqueda
        let tiendaId;

        if (req.usuario && req.usuario.rol === 'tendero') {
            tiendaId = req.usuario.tienda_id;
        } else {
            tiendaId = req.query.tienda_id;
        }

        if (!q) {
            return res.status(400).json({ error: 'Se requiere un término de búsqueda (parámetro q).' });
        }

        const whereCondition = {
            activo: true,
            [Op.or]: [
                { nombre: { [Op.iLike]: `%${q}%` } },
                { codigo_barras: { [Op.iLike]: `%${q}%` } }
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
                    attributes: ['id', 'nombre', 'icono', 'color']
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