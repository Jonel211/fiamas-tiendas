const { Categoria, Tienda, Producto } = require('../models');
const { Op } = require('sequelize');

const ICONO_MAX = 50;

// Tienda activa a la que el usuario tiene derecho (admin: cualquiera).
// Un id inválido para Postgres devuelve null en vez de un 500.
async function tiendaPermitida(req, tiendaId) {
    if (!tiendaId) return null;
    const where = req.usuario.rol === 'admin'
        ? { id: tiendaId, activo: true }
        : { id: tiendaId, tendero_id: req.usuario.id, activo: true };
    try {
        return await Tienda.findOne({ where });
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') return null;
        throw error;
    }
}

async function buscarCategoria(id) {
    try {
        return await Categoria.findByPk(id);
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') return null;
        throw error;
    }
}

// ══════════════════════════════════════════════════════════════════════════
// 1. CREAR CATEGORÍA  ·  POST /api/categorias
// ══════════════════════════════════════════════════════════════════════════
exports.crearCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, tienda_id, icono, color, activo } = req.body;

        if (!nombre || !String(nombre).trim() || !tienda_id) {
            return res.status(400).json({ error: 'El nombre y el tienda_id son obligatorios.' });
        }
        if (icono && String(icono).length > ICONO_MAX) {
            return res.status(400).json({ error: 'El ícono es demasiado largo.' });
        }

        const tienda = await tiendaPermitida(req, tienda_id);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const existeCategoria = await Categoria.findOne({
            where: {
                nombre: { [Op.iLike]: String(nombre).trim() },
                tienda_id: tienda.id,
                activo: true
            }
        });
        if (existeCategoria) {
            return res.status(400).json({ error: 'Ya existe una categoría con ese nombre en esta tienda.' });
        }

        const nuevaCategoria = await Categoria.create({
            nombre: String(nombre).trim(),
            descripcion: descripcion ? String(descripcion).trim() : null,
            tienda_id: tienda.id,
            icono: icono || null,
            color: color || null,
            activo: activo !== undefined ? Boolean(activo) : true
        });

        res.status(201).json({ msg: 'Categoría creada exitosamente.', categoria: nuevaCategoria });
    } catch (error) {
        console.error(' [CREAR] Error:', error);
        res.status(500).json({ error: 'Error interno al crear la categoría.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 2. LISTAR CATEGORÍAS DE UNA TIENDA  ·  GET /api/categorias?tienda_id=xxx
// ══════════════════════════════════════════════════════════════════════════
exports.listarCategorias = async (req, res) => {
    try {
        const tiendaId = req.query.tienda_id;
        if (!tiendaId) {
            return res.status(400).json({ error: 'El parámetro tienda_id es obligatorio.' });
        }

        const tienda = await tiendaPermitida(req, tiendaId);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const categorias = await Categoria.findAll({
            where: { tienda_id: tienda.id },
            order: [['nombre', 'ASC']]
        });

        res.status(200).json({
            msg: 'Categorías obtenidas exitosamente.',
            total: categorias.length,
            categorias
        });
    } catch (error) {
        console.error(' [LISTAR] Error:', error);
        res.status(500).json({ error: 'Error interno al obtener las categorías.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 3. OBTENER DETALLE  ·  GET /api/categorias/:id
// ══════════════════════════════════════════════════════════════════════════
exports.obtenerCategoria = async (req, res) => {
    try {
        const categoria = await buscarCategoria(req.params.id);
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        const tienda = await tiendaPermitida(req, categoria.tienda_id);
        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para ver esta categoría.' });
        }

        res.status(200).json({ msg: 'Categoría obtenida exitosamente.', categoria });
    } catch (error) {
        console.error(' [OBTENER] Error:', error);
        res.status(500).json({ error: 'Error interno al obtener la categoría.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 4. ACTUALIZAR  ·  PUT /api/categorias/:id
// ══════════════════════════════════════════════════════════════════════════
exports.actualizarCategoria = async (req, res) => {
    try {
        const categoriaId = req.params.id;
        const { nombre, descripcion, icono, color, activo } = req.body;

        const categoria = await buscarCategoria(categoriaId);
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        const tienda = await tiendaPermitida(req, categoria.tienda_id);
        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para editar esta categoría.' });
        }

        if (nombre !== undefined && !String(nombre).trim()) {
            return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
        }
        if (icono && String(icono).length > ICONO_MAX) {
            return res.status(400).json({ error: 'El ícono es demasiado largo.' });
        }

        if (nombre && String(nombre).trim() !== categoria.nombre) {
            const existeCategoria = await Categoria.findOne({
                where: {
                    nombre: { [Op.iLike]: String(nombre).trim() },
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
        if (nombre !== undefined) datosActualizacion.nombre = String(nombre).trim();
        if (descripcion !== undefined) datosActualizacion.descripcion = descripcion ? String(descripcion).trim() : null;
        if (icono !== undefined) datosActualizacion.icono = icono;
        if (color !== undefined) datosActualizacion.color = color;
        if (activo !== undefined) datosActualizacion.activo = Boolean(activo);

        await categoria.update(datosActualizacion);

        res.status(200).json({ msg: 'Categoría actualizada exitosamente.', categoria });
    } catch (error) {
        console.error(' [ACTUALIZAR] Error:', error);
        res.status(500).json({ error: 'Error interno al actualizar la categoría.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 5. ELIMINAR (borrado permanente)  ·  DELETE /api/categorias/:id
//    Se bloquea si tiene productos, para no dejarlos huérfanos ni romper la FK.
// ══════════════════════════════════════════════════════════════════════════
exports.eliminarCategoria = async (req, res) => {
    try {
        const categoria = await buscarCategoria(req.params.id);
        if (!categoria) {
            return res.status(404).json({ error: 'Categoría no encontrada.' });
        }

        const tienda = await tiendaPermitida(req, categoria.tienda_id);
        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos para eliminar esta categoría.' });
        }

        // Ajusta 'categoria_id' si tu columna se llama distinto.
        const enUso = await Producto.count({ where: { categoria_id: categoria.id } });
        if (enUso > 0) {
            return res.status(409).json({
                error: `No se puede eliminar la categoría porque tiene ${enUso} producto(s) asociado(s).`,
                cantidad_productos: enUso
            });
        }

        await categoria.destroy();

        res.status(200).json({ msg: 'Categoría eliminada permanentemente.' });
    } catch (error) {
        console.error(' [ELIMINAR] Error:', error);
        res.status(500).json({ error: 'Error interno al eliminar la categoría.' });
    }
};