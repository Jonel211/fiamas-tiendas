// src/controllers/productoController.js
const { Producto, Categoria, Tienda } = require('../models');
const { Op } = require('sequelize');

// Crear un nuevo producto
exports.crearProducto = async (req, res) => {
    try {
        const {
            tienda_id, categoria_id, nombre, descripcion, sku, codigo_barras,
            precio_compra, precio_venta, stock_actual, stock_minimo, unidad_medida
        } = req.body;

        if (!tienda_id || !nombre || !precio_venta) {
            return res.status(400).json({
                success: false,
                message: 'Los campos tienda_id, nombre y precio_venta son obligatorios'
            });
        }

        // SEGURIDAD: Verificar que la tienda pertenece al tendero logueado
        const tienda = await Tienda.findOne({
            where: { id: tienda_id, tendero_id: req.usuario.id }
        });

        if (!tienda) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para agregar productos a esta tienda'
            });
        }

        // Verificar código de barras único dentro de la misma tienda
        if (codigo_barras) {
            const existeCodigo = await Producto.findOne({ where: { codigo_barras, tienda_id } });
            if (existeCodigo) {
                return res.status(409).json({
                    success: false,
                    message: 'El código de barras ya está registrado en esta tienda'
                });
            }
        }

        const producto = await Producto.create({
            tienda_id,
            categoria_id,
            nombre,
            descripcion,
            sku,
            codigo_barras,
            precio_compra: precio_compra || 0,
            precio_venta,
            stock_actual: stock_actual || 0,
            stock_minimo: stock_minimo || 0,
            unidad_medida: unidad_medida || 'unidad'
        });

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: { producto }
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al crear el producto',
            error: error.message
        });
    }
};

// Obtener productos de una tienda específica
exports.obtenerProductosPorTienda = async (req, res) => {
    try {
        const { tienda_id } = req.params;
        const { busca, categoria_id, page = 1, limit = 20 } = req.query;

        // SEGURIDAD: Verificar acceso a la tienda
        const tienda = await Tienda.findOne({
            where: { id: tienda_id, tendero_id: req.usuario.id }
        });
        if (!tienda) {
            return res.status(403).json({
                success: false,
                message: 'No tienes acceso a los productos de esta tienda'
            });
        }

        const where = { tienda_id, activo: true };
        if (categoria_id) where.categoria_id = categoria_id;
        if (busca) {
            where.nombre = { [Op.iLike]: `%${busca}%` }; // Búsqueda insensible a mayúsculas
        }

        const { count, rows: productos } = await Producto.findAndCountAll({
            where,
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'color']
            }],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['nombre', 'ASC']]
        });

        res.json({
            success: true,
            message: 'Productos obtenidos exitosamente',
            data: {
                productos,
                total: count,
                pagina: parseInt(page),
                totalPaginas: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al obtener los productos',
            error: error.message
        });
    }
};

// Actualizar un producto
exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const producto = await Producto.findByPk(id, {
            include: [{ model: Tienda, as: 'tienda' }]
        });

        if (!producto || producto.tienda.tendero_id !== req.usuario.id) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado o no tienes permiso para editarlo'
            });
        }

        // Verificar código de barras único si se intenta cambiar
        if (updateData.codigo_barras && updateData.codigo_barras !== producto.codigo_barras) {
            const existeCodigo = await Producto.findOne({
                where: { codigo_barras: updateData.codigo_barras, tienda_id: producto.tienda_id }
            });
            if (existeCodigo) {
                return res.status(409).json({
                    success: false,
                    message: 'El código de barras ya está registrado en esta tienda'
                });
            }
        }

        await producto.update(updateData);

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: { producto }
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al actualizar el producto',
            error: error.message
        });
    }
};

// Eliminar producto (Soft Delete)
exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByPk(id, {
            include: [{ model: Tienda, as: 'tienda' }]
        });

        if (!producto || producto.tienda.tendero_id !== req.usuario.id) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado o no tienes permiso para eliminarlo'
            });
        }

        await producto.update({ activo: false });

        res.json({
            success: true,
            message: 'Producto eliminado (desactivado) exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al eliminar el producto',
            error: error.message
        });
    }
};

// Actualizar stock (Entrada o Salida)
exports.actualizarStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { cantidad, tipo } = req.body; // tipo: 'entrada' o 'salida'

        if (!cantidad || !tipo) {
            return res.status(400).json({
                success: false,
                message: 'Los campos cantidad y tipo son obligatorios'
            });
        }

        const producto = await Producto.findByPk(id, {
            include: [{ model: Tienda, as: 'tienda' }]
        });

        if (!producto || producto.tienda.tendero_id !== req.usuario.id) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado o no tienes permiso'
            });
        }

        let nuevoStock = producto.stock_actual;
        const cantidadNum = parseInt(cantidad);

        if (tipo === 'entrada') {
            nuevoStock += cantidadNum;
        } else if (tipo === 'salida') {
            nuevoStock -= cantidadNum;
            if (nuevoStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock insuficiente para realizar esta salida'
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'El tipo debe ser "entrada" o "salida"'
            });
        }

        await producto.update({ stock_actual: nuevoStock });

        res.json({
            success: true,
            message: 'Stock actualizado exitosamente',
            data: {
                stock_anterior: producto.stock_actual,
                stock_nuevo: nuevoStock
            }
        });
    } catch (error) {
        console.error('Error al actualizar stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error del servidor al actualizar el stock',
            error: error.message
        });
    }
};