const { Categoria, Tienda, Producto, sequelize } = require('../models');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════════════════════════════════════
// 1. CREAR CATEGORÍA
// POST /api/categorias
// ═══════════════════════════════════════════════════════════════════════════
exports.crearCategoria = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const { nombre, descripcion, tienda_id } = req.body;

        if (!nombre || !tienda_id) {
            return res.status(400).json({ error: 'El nombre y el tienda_id son obligatorios.' });
        }

        // Validar que la tienda exista y pertenezca al usuario (si no es admin)
        const whereTienda = esAdmin ? { id: tienda_id, activo: true } : { id: tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        // Verificar si ya existe una categoría con el mismo nombre en esta tienda
        const existeCategoria = await Categoria.findOne({
            where: {
                nombre: { [Op.iLike]: nombre.trim() }, // Case-insensitive
                tienda_id: tienda_id,
                activo: true
            }
        });

        if (existeCategoria) {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre en esta tienda.' });
        }

        const nuevaCategoria = await Categoria.create({
            nombre: String(nombre).trim(),
            descripcion: descripcion ? String(descripcion).trim() : null,
            tienda_id: tienda_id,
            activo: true
        });

        res.status(201).json({
            msg: 'Categoría creada exitosamente.',
            categoria: nuevaCategoria
        });

    } catch (error) {
        console.error('Error al crear categoría:', error);
        res.status(500).json({ error: 'Error interno al crear la categoría.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. LISTAR CATEGORÍAS DE UNA TIENDA
// GET /api/categorias?tienda_id=xxx
// ═══════════════════════════════════════════════════════════════════════════
exports.listarCategorias = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const tiendaId = req.query.tienda_id;

        if (!tiendaId) {
            return res.status(400).json({ error: 'El parámetro tienda_id es obligatorio.' });
        }

        // Validar permisos sobre la tienda
        const whereTienda = esAdmin ? { id: tiendaId, activo: true } : { id: tiendaId, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        // Obtener categorías activas de la tienda
        const categorias = await Categoria.findAll({
            where: {
                tienda_id: tiendaId,
                activo: true
            },
            order: [['nombre', 'ASC']],
            // Opcional: Incluir conteo de productos (requiere atributos específicos)
            include: [{
                model: Producto,
                as: 'productos',
                attributes: [],
                required: false
            }],
            attributes: [
                'id', 'nombre', 'descripcion', 'tienda_id', 'activo', 'creado_en',
                [sequelize.fn('COUNT', sequelize.col('productos.id')), 'total_productos']
            ],
            group: ['Categoria.id']
        });

        res.status(200).json({
            msg: 'Categorías obtenidas exitosamente.',
            total: categorias.length,
            categorias
        });

    } catch (error) {
        console.error('Error al listar categorías:', error);
        res.status(500).json({ error: 'Error interno al obtener las categorías.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. OBTENER DETALLE DE UNA CATEGORÍA
// GET /api/categorias/:id
// ═══════════════════════════════════════════════════════════════════════════
exports.obtenerCategoria = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const categoriaId = req.params.id;

        const categoria = await Categoria.findByPk(categoriaId, {
            include: [{
                model: Tienda,
                as: 'tienda',
                attributes: ['id', 'nombre']
            }]
        });

        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        // Validar permisos
        const whereTienda = esAdmin ? { id: categoria.tienda_id, activo: true } : { id: categoria.tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para ver esta categoría.' });
        }

        res.status(200).json({
            msg: 'Categoría obtenida exitosamente.',
            categoria
        });

    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({ error: 'Error interno al obtener la categoría.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. ACTUALIZAR CATEGORÍA
// PUT /api/categorias/:id
// ═══════════════════════════════════════════════════════════════════════════
exports.actualizarCategoria = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const categoriaId = req.params.id;
        const { nombre, descripcion, activo } = req.body;

        const categoria = await Categoria.findByPk(categoriaId);

        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        // Validar permisos
        const whereTienda = esAdmin ? { id: categoria.tienda_id, activo: true } : { id: categoria.tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para editar esta categoría.' });
        }

        // Si cambia el nombre, verificar que no se duplique en la misma tienda
        if (nombre && nombre.trim() !== categoria.nombre) {
            const existeCategoria = await Categoria.findOne({
                where: {
                    nombre: { [Op.iLike]: nombre.trim() },
                    tienda_id: categoria.tienda_id,
                    activo: true,
                    id: { [Op.ne]: categoriaId } // Excluir la actual
                }
            });
            if (existeCategoria) {
                return res.status(400).json({ error: 'Ya existe una categoría con ese nombre en esta tienda.' });
            }
        }

        const datosActualizacion = { actualizado_en: new Date() };
        if (nombre !== undefined) datosActualizacion.nombre = String(nombre).trim();
        if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? String(descripcion).trim() : null;
        if (activo !== undefined) datosActualizacion.activo = Boolean(activo);

        await categoria.update(datosActualizacion);

        res.status(200).json({
            msg: 'Categoría actualizada exitosamente.',
            categoria
        });

    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ error: 'Error interno al actualizar la categoría.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. ELIMINAR CATEGORÍA (Soft Delete)
// DELETE /api/categorias/:id
// ═══════════════════════════════════════════════════════════════════════════
exports.eliminarCategoria = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const categoriaId = req.params.id;

        const categoria = await Categoria.findByPk(categoriaId);

        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        // Validar permisos
        const whereTienda = esAdmin ? { id: categoria.tienda_id, activo: true } : { id: categoria.tienda_id, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para eliminar esta categoría.' });
        }

        // Verificar si tiene productos activos (Opcional: puedes bloquear la eliminación si tiene productos)
        const productosActivos = await Producto.count({
            where: { categoria_id: categoriaId, activo: true }
        });

        if (productosActivos > 0) {
            return res.status(400).json({
                error: `No se puede eliminar la categoría porque tiene ${productosActivos} producto(s) activo(s). Desactiva o reasigna los productos primero.`
            });
        }

        // Soft Delete
        await categoria.update({
            activo: false,
            actualizado_en: new Date()
        });

        res.status(200).json({
            msg: 'Categoría eliminada (desactivada) exitosamente.'
        });

    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ error: 'Error interno al eliminar la categoría.' });
    }
};