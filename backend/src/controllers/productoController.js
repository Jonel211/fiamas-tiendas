const { Producto, Tienda, Categoria, sequelize } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('../config/cloudinary');

const ERROR_CODIGO_BARRAS_DUPLICADO = 'Ya existe un producto con ese código de barras en esta tienda.';

const normalizarActivo = (valor) => {
    if (valor === undefined) return undefined;
    if (valor === true || valor === 'true' || valor === 1 || valor === '1') return true;
    if (valor === false || valor === 'false' || valor === 0 || valor === '0') return false;
    return null;
};

// ══════════════════════════════════════════════════════════════════════════
// 1. CREAR PRODUCTO CON IMAGEN
// ══════════════════════════════════════════════════════════════════════════
exports.crearProducto = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const { nombre, descripcion, tienda_id, categoria_id, codigo_barras, tipo_venta, unidad_medida, precio_venta, activo } = req.body;

        const codigoBarras = typeof codigo_barras === 'string' ? (codigo_barras.trim() || null) : codigo_barras;

        const activoNormalizado = normalizarActivo(activo);
        if (activoNormalizado === null) {
            return res.status(400).json({ error: 'El campo activo debe ser true o false.' });
        }

        if (!nombre || !tienda_id || !categoria_id || precio_venta === undefined) {
            return res.status(400).json({ error: 'El nombre, tienda_id, categoria_id y precio_venta son obligatorios.' });
        }

        const whereTienda = esAdmin ? { id: tienda_id, activo: true } : { id: tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(404).json({ error: 'No tienes permiso para acceder a los datos de esta tienda.' });
        }

        const categoria = await Categoria.findByPk(categoria_id);
        if (!categoria || categoria.tienda_id !== tienda_id) {
            return res.status(400).json({ error: 'La categoría no existe o no pertenece a esta tienda.' });
        }

        const nombreLimpio = String(nombre).trim();
        const nombreNormalizado = nombreLimpio.toLowerCase();

        const productoExistente = await Producto.findOne({
            where: {
                tienda_id,
                [Op.where]: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('nombre')),
                    nombreNormalizado
                )
            }
        });

        if (productoExistente) {
            return res.status(409).json({ error: 'Ya existe un producto con este nombre en esta tienda.' });
        }

        if (codigoBarras) {
            const productoConCodigo = await Producto.findOne({
                where: { codigo_barras: codigoBarras, tienda_id }
            });
            if (productoConCodigo) {
                return res.status(409).json({ error: ERROR_CODIGO_BARRAS_DUPLICADO });
            }
        }

        let imagen_url = null;
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            const cldRes = await cloudinary.uploader.upload(dataURI, {
                folder: 'fiamas_app/productos',
                resource_type: 'image'
            });
            imagen_url = cldRes.secure_url;
        }

        const nuevoProducto = await Producto.create({
            nombre: nombreLimpio,
            descripcion: descripcion ? descripcion.trim() : null,
            tienda_id,
            categoria_id,
            codigo_barras: codigoBarras ?? null,
            tipo_venta: tipo_venta || 'unidad',
            unidad_medida: unidad_medida || 'unidad',
            precio_venta: parseFloat(precio_venta),
            ...(activoNormalizado !== undefined ? { activo: activoNormalizado } : {}),
            imagen_url
        });

        const productoCreado = await Producto.findByPk(nuevoProducto.id, {
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'icono', 'color']
            }]
        });

        return res.status(201).json({
            msg: 'Producto creado exitosamente.',
            producto: productoCreado
        });
    } catch (error) {
        console.error('Error al crear producto:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Ya existe un producto con este nombre o código de barras en esta tienda.' });
        }

        return res.status(500).json({ error: 'Error interno al crear el producto.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 2. LISTAR PRODUCTOS DE UNA TIENDA
// ══════════════════════════════════════════════════════════════════════════
exports.listarProductosPorTienda = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';

        const tiendaId = req.query.tienda_id || req.params.tiendaId;

        if (!tiendaId) {
            return res.status(400).json({ error: 'El parámetro tienda_id es obligatorio.' });
        }

        const whereTienda = esAdmin ? { id: tiendaId, activo: true } : { id: tiendaId, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const whereProductos = { tienda_id: tiendaId };
        if (req.query.activo !== undefined) {
            whereProductos.activo = String(req.query.activo).toLowerCase() === 'true';
        }

        const productos = await Producto.findAll({
            where: whereProductos,
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'icono', 'color']
            }],
            order: [['nombre', 'ASC']]
        });

        return res.status(200).json({
            msg: 'Productos obtenidos exitosamente.',
            productos
        });
    } catch (error) {
        console.error('Error al listar productos:', error);
        return res.status(500).json({ error: 'Error interno al obtener los productos.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 3. OBTENER PRODUCTO POR ID
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

        return res.status(200).json({ producto });
    } catch (error) {
        console.error('Error al obtener producto:', error);
        return res.status(500).json({ error: 'Error interno al obtener el producto.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 4. ACTUALIZAR PRODUCTO CON IMAGEN
// ══════════════════════════════════════════════════════════════════════════
exports.actualizarProducto = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const productoId = req.params.id;
        const { nombre, descripcion, categoria_id, codigo_barras, tipo_venta, unidad_medida, precio_venta, activo } = req.body;

        const codigoBarras = typeof codigo_barras === 'string' ? (codigo_barras.trim() || null) : codigo_barras;

        const activoNormalizado = normalizarActivo(activo);
        if (activoNormalizado === null) {
            return res.status(400).json({ error: 'El campo activo debe ser true o false.' });
        }

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

        if (nombre && nombre.trim().toLowerCase() !== producto.nombre.toLowerCase()) {
            const nombreLimpio = nombre.trim();
            const productoExistenteNombre = await Producto.findOne({
                where: {
                    tienda_id: producto.tienda_id,
                    id: { [Op.ne]: productoId },
                    [Op.where]: sequelize.where(
                        sequelize.fn('LOWER', sequelize.col('nombre')),
                        nombreLimpio.toLowerCase()
                    )
                }
            });
            if (productoExistenteNombre) {
                return res.status(409).json({ error: 'Ya existe un producto con este nombre en esta tienda.' });
            }
        }

        if (codigoBarras) {
            const productoExistente = await Producto.findOne({
                where: {
                    codigo_barras: codigoBarras,
                    tienda_id: producto.tienda_id,
                    id: { [Op.ne]: productoId }
                }
            });
            if (productoExistente) {
                return res.status(409).json({ error: ERROR_CODIGO_BARRAS_DUPLICADO });
            }
        }

        const datosActualizacion = {};
        if (nombre !== undefined) datosActualizacion.nombre = nombre.trim();
        if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? descripcion.trim() : null;
        if (categoria_id !== undefined) datosActualizacion.categoria_id = categoria_id;
        if (codigo_barras !== undefined) datosActualizacion.codigo_barras = codigoBarras;
        if (tipo_venta !== undefined) datosActualizacion.tipo_venta = tipo_venta;
        if (unidad_medida !== undefined) datosActualizacion.unidad_medida = unidad_medida;
        if (precio_venta !== undefined) datosActualizacion.precio_venta = parseFloat(precio_venta);
        if (activoNormalizado !== undefined) datosActualizacion.activo = activoNormalizado;

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            const cldRes = await cloudinary.uploader.upload(dataURI, {
                folder: 'fiamas_app/productos',
                resource_type: 'image'
            });
            datosActualizacion.imagen_url = cldRes.secure_url;
        }

        await producto.update(datosActualizacion);

        const productoActualizado = await Producto.findByPk(productoId, {
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'icono', 'color']
            }]
        });

        return res.status(200).json({
            msg: 'Producto actualizado exitosamente.',
            producto: productoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            const esNombre = error.fields && (error.fields.nombre !== undefined || error.errors?.some(e => e.path === 'nombre'));
            return res.status(409).json({
                error: esNombre
                    ? 'Ya existe un producto con este nombre en esta tienda.'
                    : 'Ya existe un producto con este código de barras en esta tienda.'
            });
        }
        return res.status(500).json({ error: 'Error interno al actualizar el producto.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 5. ELIMINAR PRODUCTO
// ══════════════════════════════════════════════════════════════════════════
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

        return res.status(200).json({
            msg: 'Producto eliminado permanentemente.'
        });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return res.status(500).json({ error: 'Error interno al eliminar el producto.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 6. BÚSQUEDA POR CÓDIGO DE BARRAS (PARA EL POS)
// ══════════════════════════════════════════════════════════════════════════
exports.buscarPorCodigoBarras = async (req, res) => {
    try {
        const { codigo } = req.params;
        const { tienda_id } = req.query;

        const producto = await Producto.findOne({
            where: { codigo_barras: codigo, tienda_id, activo: true }
        });

        if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });

        return res.status(200).json({ producto });
    } catch (error) {
        console.error('Error al buscar producto por código de barras:', error);
        return res.status(500).json({ error: 'Error al buscar producto.' });
    }
};