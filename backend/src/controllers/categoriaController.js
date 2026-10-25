const { Categoria, Tienda, Producto } = require('../models');
const { Op } = require('sequelize');

// ══════════════════════════════════════════════════════════════════════════
// 1. CREAR CATEGORÍA
// POST /api/categorias
// ══════════════════════════════════════════════════════════════════════════
exports.crearCategoria = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const { nombre, descripcion, tienda_id, icono, color, activo } = req.body;

        if (!nombre || !tienda_id) {
            return res.status(400).json({ error: 'El nombre y el tienda_id son obligatorios.' });
        }

        const whereTienda = esAdmin
            ? { id: tienda_id, activo: true }
            : { id: tienda_id, tendero_id: usuarioId, activo: true };

        const tienda = await Tienda.findOne({ where: whereTienda });
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const existeCategoria = await Categoria.findOne({
            where: {
                nombre: { [Op.iLike]: nombre.trim() },
                tienda_id,
                activo: true
            }
        });

        if (existeCategoria) {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre en esta tienda.' });
        }

        const nuevaCategoria = await Categoria.create({
            nombre: nombre.trim(),
            descripcion: descripcion ? descripcion.trim() : null,
            tienda_id,
            icono: icono || null,
            color: color || null,
            activo: activo !== undefined ? Boolean(activo) : true
        });

        res.status(201).json({
            msg: 'Categoría creada exitosamente.',
            categoria: nuevaCategoria
        });
    } catch (error) {
        console.error(' [CREAR] Error:', error);
        res.status(500).json({ error: 'Error interno al crear la categoría.', detalle: error.message });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 2. LISTAR CATEGORÍAS DE UNA TIENDA
// GET /api/categorias?tienda_id=xxx
// ══════════════════════════════════════════════════════════════════════════
exports.listarCategorias = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const tiendaId = req.query.tienda_id;
        if (!tiendaId) {
            return res.status(400).json({ error: 'El parámetro tienda_id es obligatorio.' });
        }

        const whereTienda = esAdmin ? { id: tiendaId, activo: true } : { id: tiendaId, tendero_id: usuarioId, activo: true };
        const tienda = await Tienda.findOne({ where: whereTienda });

        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const categorias = await Categoria.findAll({
            where: { tienda_id: tiendaId },
            order: [['nombre', 'ASC']]
        });
        res.status(200).json({
            msg: 'Categorías obtenidas exitosamente.',
            total: categorias.length,
            categorias
        });
    } catch (error) {
        console.error(' [BACKEND] Error al listar categorías:', error);
        res.status(500).json({ error: 'Error interno al obtener las categorías.', detalle: error.message });
    }
};


// ══════════════════════════════════════════════════════════════════════════
// 3. OBTENER DETALLE DE UNA CATEGORÍA
// GET /api/categorias/:id
// ══════════════════════════════════════════════════════════════════════════
exports.obtenerCategoria = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const categoriaId = req.params.id;

        const categoria = await Categoria.findByPk(categoriaId);
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        const whereTienda = esAdmin
            ? { id: categoria.tienda_id, activo: true }
            : { id: categoria.tienda_id, tendero_id: usuarioId, activo: true };

        const tienda = await Tienda.findOne({ where: whereTienda });
        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para ver esta categoría.' });
        }

        res.status(200).json({
            msg: 'Categoría obtenida exitosamente.',
            categoria
        });
    } catch (error) {
        console.error(' [OBTENER] Error:', error);
        res.status(500).json({ error: 'Error interno al obtener la categoría.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 4. ACTUALIZAR CATEGORÍA
// PUT /api/categorias/:id
// ══════════════════════════════════════════════════════════════════════════
exports.actualizarCategoria = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const categoriaId = req.params.id;
        const { nombre, descripcion, icono, color, activo } = req.body;

        const categoria = await Categoria.findByPk(categoriaId);
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        const whereTienda = esAdmin
            ? { id: categoria.tienda_id, activo: true }
            : { id: categoria.tienda_id, tendero_id: usuarioId, activo: true };

        const tienda = await Tienda.findOne({ where: whereTienda });
        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para editar esta categoría.' });
        }

        if (nombre && nombre.trim() !== categoria.nombre) {
            const existeCategoria = await Categoria.findOne({
                where: {
                    nombre: { [Op.iLike]: nombre.trim() },
                    tienda_id: categoria.tienda_id,
                    activo: true,
                    id: { [Op.ne]: categoriaId }
                }
            });
            if (existeCategoria) {
                return res.status(400).json({ error: 'Ya existe una categoría con ese nombre en esta tienda.' });
            }
        }

        const datosActualizacion = {};
        if (nombre !== undefined) datosActualizacion.nombre = nombre.trim();
        if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? descripcion.trim() : null;
        if (icono !== undefined) datosActualizacion.icono = icono;
        if (color !== undefined) datosActualizacion.color = color;
        if (activo !== undefined) datosActualizacion.activo = Boolean(activo);

        await categoria.update(datosActualizacion);

        res.status(200).json({
            msg: 'Categoría actualizada exitosamente.',
            categoria
        });
    } catch (error) {
        console.error(' [ACTUALIZAR] Error:', error);
        res.status(500).json({ error: 'Error interno al actualizar la categoría.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 5. ELIMINAR CATEGORÍA (Hard Delete)
// DELETE /api/categorias/:id
// ══════════════════════════════════════════════════════════════════════════
exports.eliminarCategoria = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;
        const esAdmin = req.usuario.rol === 'admin';
        const categoriaId = req.params.id;

        const categoria = await Categoria.findByPk(categoriaId);
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        const whereTienda = esAdmin
            ? { id: categoria.tienda_id, activo: true }
            : { id: categoria.tienda_id, tendero_id: usuarioId, activo: true };

        const tienda = await Tienda.findOne({ where: whereTienda });
        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para eliminar esta categoría.' });
        }

        // Eliminación permanente de la base de datos
        await categoria.destroy();

        res.status(200).json({
            msg: 'Categoría eliminada permanentemente.'
        });
    } catch (error) {
        console.error(' [ELIMINAR] Error:', error);
        res.status(500).json({ error: 'Error interno al eliminar la categoría.', detalle: error.message });
    }
};