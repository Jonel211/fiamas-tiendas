const { Tienda, Tendero, Producto, Categoria, Alerta, Fiado, FiadoDetalle, Pago, ScoringHistorial, LogSistema, ClienteTienda, Cliente, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { subirImagen } = require('../utils/cloudinaryUpload');

const INCLUDE_TENDERO_BASICO = [{ model: Tendero, as: 'tendero', attributes: ['id', 'nombres', 'apellidos', 'telefono'] }];
const INCLUDE_TENDERO_COMPLETO = [{ model: Tendero, as: 'tendero', attributes: ['id', 'dni', 'nombres', 'apellidos', 'telefono'] }];

// ──────────────────────────────────────────────────────────────────────────
// AUXILIAR: devuelve la tienda solo si el usuario tiene derecho sobre ella.
// - Admin: cualquier tienda.
// - Tendero: solo sus tiendas activas.
// Si el id no es válido para la base de datos devuelve null (404, no 500).
// ──────────────────────────────────────────────────────────────────────────
async function buscarTiendaPermitida(req, tiendaId, opciones = {}) {
    if (!tiendaId) return null;
    const where = req.usuario.rol === 'admin'
        ? { id: tiendaId }
        : { id: tiendaId, tendero_id: req.usuario.id, activo: true };
    try {
        return await Tienda.findOne({ where, ...opciones });
    } catch (error) {
        if (error.name === 'SequelizeDatabaseError') return null;
        throw error;
    }
}

// 0. OBTENER TODAS LAS TIENDAS (PANEL ADMIN)
exports.getTiendasAdmin = async (req, res) => {
    try {
        const tiendas = await Tienda.findAll({
            include: INCLUDE_TENDERO_COMPLETO,
            order: [['creado_en', 'DESC']]
        });
        res.status(200).json({ msg: 'Listado de tiendas obtenido exitosamente', tiendas });
    } catch (error) {
        console.error('Error al obtener tiendas:', error);
        res.status(500).json({ error: 'Error interno al obtener las tiendas.' });
    }
};

// 0.1 CREAR TIENDA (PANEL ADMIN O TENDERO)
exports.crearTiendaAdmin = async (req, res) => {
    try {
        const { nombre, imagen_url, direccion, ruc, telefono, activo, qr_activo } = req.body;

        // El tendero SIEMPRE crea tiendas a su nombre; solo el admin elige el dueño.
        const tendero_id = req.usuario.rol === 'admin' ? req.body.tendero_id : req.usuario.id;

        if (!nombre || !String(nombre).trim() || !tendero_id) {
            return res.status(400).json({ error: 'El nombre de la tienda y el tendero_id son obligatorios.' });
        }

        const rucLimpio = ruc !== undefined && ruc !== null ? String(ruc).trim() : '';
        if (rucLimpio !== '' && !/^\d{11}$/.test(rucLimpio)) {
            return res.status(400).json({ error: 'El RUC debe tener exactamente 11 dígitos numéricos.' });
        }

        const telLimpio = telefono !== undefined && telefono !== null ? String(telefono).trim() : '';
        if (telLimpio !== '' && !/^\d{9}$/.test(telLimpio)) {
            return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos numéricos.' });
        }

        const tendero = await Tendero.findByPk(tendero_id);
        if (!tendero) {
            return res.status(404).json({ error: 'El tendero especificado no existe.' });
        }

        const nuevaTienda = await Tienda.create({
            nombre: String(nombre).trim(),
            tendero_id,
            imagen_url: imagen_url || null,
            direccion: direccion || null,
            ruc: rucLimpio || null,
            telefono: telLimpio || tendero.telefono,
            qr_token: crypto.randomUUID(),
            qr_activo: qr_activo !== undefined ? qr_activo : true,
            activo: activo !== undefined ? activo : true
        });

        const tiendaCompleta = await Tienda.findByPk(nuevaTienda.id, { include: INCLUDE_TENDERO_COMPLETO });

        res.status(201).json({ msg: 'Tienda creada exitosamente', tienda: tiendaCompleta });
    } catch (error) {
        console.error('Error al crear tienda:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ya existe una tienda con esos datos únicos.' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors?.[0]?.message || 'Datos de tienda inválidos.' });
        }
        res.status(500).json({ error: 'Error interno al crear la tienda.' });
    }
};

// 1. OBTENER DATOS DE UNA TIENDA (TENDERO LOGUEADO)
// GET /api/tiendas/mi-tienda?tienda_id=xxx  (tienda_id es opcional)
exports.getTienda = async (req, res) => {
    try {
        const tiendaId = req.query.tienda_id;
        let tienda;

        if (tiendaId) {
            tienda = await buscarTiendaPermitida(req, tiendaId, { include: INCLUDE_TENDERO_BASICO });
        } else {
            // Sin tienda_id: la más antigua, de forma estable (antes era arbitraria).
            tienda = await Tienda.findOne({
                where: { tendero_id: req.usuario.id, activo: true },
                include: INCLUDE_TENDERO_BASICO,
                order: [['creado_en', 'ASC']]
            });
        }

        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        res.status(200).json({ msg: 'Datos de la tienda', tienda });
    } catch (error) {
        console.error('Error al obtener tienda:', error);
        res.status(500).json({ error: 'Error interno al obtener la tienda.' });
    }
};

// 6. OBTENER TODAS LAS TIENDAS DEL TENDERO AUTENTICADO
exports.getMisTiendas = async (req, res) => {
    try {
        const tiendas = await Tienda.findAll({
            where: { tendero_id: req.usuario.id, activo: true },
            include: INCLUDE_TENDERO_BASICO,
            order: [['creado_en', 'DESC']]
        });

        res.status(200).json({ msg: 'Tiendas del tendero obtenidas exitosamente', tiendas });
    } catch (error) {
        console.error('Error al obtener tiendas del tendero:', error);
        res.status(500).json({ error: 'Error interno al obtener las tiendas.' });
    }
};

// 2. ACTUALIZAR DATOS DE LA TIENDA
exports.actualizarTienda = async (req, res) => {
    try {
        const esAdmin = req.usuario.rol === 'admin';
        const tiendaId = req.params.id;

        if (!tiendaId) {
            return res.status(400).json({ error: 'ID de la tienda es requerido para actualizar.' });
        }

        const tienda = await buscarTiendaPermitida(req, tiendaId);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos para editarla.' });
        }

        const { nombre, imagen_url, direccion, ruc, telefono, activo, qr_activo } = req.body;

        if (nombre !== undefined && !String(nombre).trim()) {
            return res.status(400).json({ error: 'El nombre de la tienda no puede estar vacío.' });
        }

        if (ruc !== undefined && ruc !== null && String(ruc).trim() !== '') {
            if (!/^\d{11}$/.test(String(ruc).trim())) {
                return res.status(400).json({ error: 'El RUC debe tener exactamente 11 dígitos numéricos.' });
            }
        }

        if (telefono !== undefined && telefono !== null && String(telefono).trim() !== '') {
            if (!/^\d{9}$/.test(String(telefono).trim())) {
                return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos numéricos.' });
            }
        }

        const datosActualizacion = {};
        if (nombre !== undefined) datosActualizacion.nombre = String(nombre).trim();
        if (imagen_url !== undefined) datosActualizacion.imagen_url = imagen_url;
        if (direccion !== undefined) datosActualizacion.direccion = direccion;
        if (ruc !== undefined) datosActualizacion.ruc = ruc ? String(ruc).trim() : null;
        if (telefono !== undefined) datosActualizacion.telefono = telefono ? String(telefono).trim() : null;

        if (esAdmin && activo !== undefined) datosActualizacion.activo = activo;
        if (qr_activo !== undefined) datosActualizacion.qr_activo = qr_activo;

        datosActualizacion.actualizado_en = new Date();

        await tienda.update(datosActualizacion);

        const tiendaActualizada = await Tienda.findByPk(tienda.id, { include: INCLUDE_TENDERO_COMPLETO });

        res.status(200).json({ msg: 'Tienda actualizada exitosamente', tienda: tiendaActualizada });
    } catch (error) {
        console.error('Error al actualizar tienda:', error);
        res.status(500).json({ error: 'Error interno al actualizar la tienda.' });
    }
};

// 2.0 SUBIR LOGO DE LA TIENDA
// PATCH /api/tiendas/:id/logo  (campo multipart: "foto")
exports.subirLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
        }

        const tienda = await buscarTiendaPermitida(req, req.params.id);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const url = await subirImagen(req.file, 'fiamas_app/tiendas');
        await tienda.update({ imagen_url: url, actualizado_en: new Date() });

        const tiendaActualizada = await Tienda.findByPk(tienda.id, { include: INCLUDE_TENDERO_COMPLETO });

        res.status(200).json({ msg: 'Logo actualizado', tienda: tiendaActualizada });
    } catch (error) {
        console.error('Error al subir logo:', error);
        res.status(500).json({ error: 'Error interno al subir el logo.' });
    }
};

// 2.1 TOGGLE ACTIVO TIENDA (ADMIN)
exports.toggleActivoTienda = async (req, res) => {
    try {
        const { id } = req.params;
        const tienda = await Tienda.findByPk(id);
        if (!tienda) return res.status(404).json({ error: 'Tienda no encontrada.' });

        const nuevoEstado = !tienda.activo;
        await tienda.update({ activo: nuevoEstado, actualizado_en: new Date() });

        res.status(200).json({ msg: `Tienda ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`, activo: nuevoEstado });
    } catch (error) {
        console.error('Error al cambiar estado de tienda:', error);
        res.status(500).json({ error: 'Error interno al cambiar estado de la tienda.' });
    }
};

// 2.2 ELIMINAR TIENDA
// - Admin: borrado permanente en cascada.
// - Tendero: también borrado permanente (BORRADO_REAL_PARA_TENDERO = true).
//   Pon BORRADO_REAL_PARA_TENDERO = false para que el tendero solo
//   desactive la tienda (soft delete) y se conserven sus datos.
const BORRADO_REAL_PARA_TENDERO = true;

exports.eliminarTiendaAdmin = async (req, res) => {
    let t;
    try {
        const { id } = req.params;
        const esAdmin = req.usuario.rol === 'admin';

        const tienda = await buscarTiendaPermitida(req, id);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        if (!esAdmin && !BORRADO_REAL_PARA_TENDERO) {
            await tienda.update({ activo: false, actualizado_en: new Date() });
            return res.status(200).json({ msg: 'Tienda eliminada exitosamente', id });
        }

        t = await sequelize.transaction();

        const fiados = await Fiado.findAll({ where: { tienda_id: id }, attributes: ['id'], transaction: t });
        const fiadosIds = fiados.map(f => f.id);

        // Secuencial: varias consultas en paralelo sobre la misma transacción
        // se encolan igual y dificultan depurar errores.
        if (fiadosIds.length > 0) {
            await FiadoDetalle.destroy({ where: { fiado_id: { [Op.in]: fiadosIds } }, transaction: t });
            await Pago.destroy({ where: { fiado_id: { [Op.in]: fiadosIds } }, transaction: t });
        }
        await Pago.destroy({ where: { tienda_id: id }, transaction: t });
        await Fiado.destroy({ where: { tienda_id: id }, transaction: t });
        await Alerta.destroy({ where: { tienda_id: id }, transaction: t });
        await ScoringHistorial.destroy({ where: { tienda_id: id }, transaction: t });
        await LogSistema.destroy({ where: { tienda_id: id }, transaction: t });
        await ClienteTienda.destroy({ where: { tienda_id: id }, transaction: t });
        await Producto.destroy({ where: { tienda_id: id }, transaction: t });
        await Categoria.destroy({ where: { tienda_id: id }, transaction: t });
        await tienda.destroy({ transaction: t });

        await t.commit();

        res.status(200).json({ msg: 'Tienda eliminada exitosamente', id });
    } catch (error) {
        if (t) await t.rollback();
        console.error('Error al eliminar tienda:', error);
        res.status(500).json({ error: 'Error interno al eliminar la tienda.' });
    }
};

// 3. GENERAR/REGENERAR CÓDIGO QR
// POST /api/tiendas/generar-qr/:id
exports.generarQR = async (req, res) => {
    try {
        const tiendaId = req.params.id || req.body.id;
        if (!tiendaId) return res.status(400).json({ error: 'ID de la tienda requerido.' });

        const tienda = await buscarTiendaPermitida(req, tiendaId);
        if (!tienda) return res.status(404).json({ error: 'No se encontró la tienda especificada.' });

        const nuevoToken = crypto.randomUUID();
        await tienda.update({ qr_token: nuevoToken, qr_fecha_creacion: new Date(), qr_activo: true, actualizado_en: new Date() });

        const frontendUrl = process.env.FRONTEND_URL || 'https://fiamas.app';
        const qrUrl = `${frontendUrl}/vincular-tienda?token=${nuevoToken}`;

        res.status(200).json({ msg: 'Código QR generado exitosamente', qr_token: nuevoToken, qr_url: qrUrl, qr_activo: tienda.qr_activo });
    } catch (error) {
        console.error('Error al generar QR:', error);
        res.status(500).json({ error: 'Error interno al generar el código QR.' });
    }
};

// 4. ACTIVAR/DESACTIVAR CÓDIGO QR
// PUT /api/tiendas/toggle-qr/:id
exports.toggleQR = async (req, res) => {
    try {
        const tiendaId = req.params.id || req.body.id;
        const { activo } = req.body;
        if (!tiendaId) return res.status(400).json({ error: 'ID de la tienda requerido.' });

        const tienda = await buscarTiendaPermitida(req, tiendaId);
        if (!tienda) return res.status(404).json({ error: 'No se encontró la tienda especificada.' });

        const nuevoEstadoQR = activo !== undefined ? Boolean(activo) : !tienda.qr_activo;
        await tienda.update({ qr_activo: nuevoEstadoQR, actualizado_en: new Date() });

        res.status(200).json({ msg: `Código QR ${nuevoEstadoQR ? 'activado' : 'desactivado'} exitosamente`, qr_activo: nuevoEstadoQR });
    } catch (error) {
        console.error('Error al cambiar estado del QR:', error);
        res.status(500).json({ error: 'Error interno al cambiar el estado del QR.' });
    }
};

// 5. OBTENER RESUMEN DE LA TIENDA (Dashboard)
// GET /api/tiendas/resumen?tienda_id=xxx
exports.getResumenTienda = async (req, res) => {
    try {
        const tienda = await buscarTiendaPermitida(req, req.query.tienda_id);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const tiendaId = tienda.id;
        const estadosPendientes = { [Op.in]: ['pendiente', 'parcial'] };

        const [
            totalProductos,
            productosStockBajo,
            totalCategorias,
            totalClientes,
            fiadosPendientes,
            fiadosMonto,
            alertasPendientes
        ] = await Promise.all([
            Producto.count({ where: { tienda_id: tiendaId, activo: true } }),
            Producto.count({
                where: {
                    tienda_id: tiendaId,
                    activo: true,
                    stock_actual: { [Op.ne]: null },
                    stock_minimo: { [Op.ne]: null },
                    [Op.and]: [sequelize.where(sequelize.col('stock_actual'), { [Op.lte]: sequelize.col('stock_minimo') })]
                }
            }),
            Categoria.count({ where: { tienda_id: tiendaId, activo: true } }),
            ClienteTienda.count({ where: { tienda_id: tiendaId, activo: true } }),
            Fiado.count({ where: { tienda_id: tiendaId, estado: estadosPendientes } }),
            Fiado.sum('monto_total', { where: { tienda_id: tiendaId, estado: estadosPendientes } }),
            Alerta.count({ where: { tienda_id: tiendaId, estado: 'pendiente' } })
        ]);

        res.status(200).json({
            msg: 'Resumen de la tienda',
            resumen: {
                tienda_id: tiendaId,
                tienda_nombre: tienda.nombre,
                total_productos: totalProductos,
                productos_stock_bajo: productosStockBajo,
                total_categorias: totalCategorias,
                total_clientes: totalClientes,
                fiados_pendientes: fiadosPendientes,
                monto_por_cobrar: Number(fiadosMonto) || 0,
                alertas_pendientes: alertasPendientes
            }
        });
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ error: 'Error interno al obtener el resumen de la tienda.' });
    }
};

// 6. OBTENER MOVIMIENTOS RECIENTES (Dashboard)
// GET /api/tiendas/movimientos-recientes?tienda_id=xxx
exports.obtenerMovimientosRecientes = async (req, res) => {
    try {
        const tienda = await buscarTiendaPermitida(req, req.query.tienda_id);
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        const tiendaId = tienda.id;

        // 1. Obtener los últimos 5 fiados
        const fiados = await Fiado.findAll({
            where: { tienda_id: tiendaId },
            order: [['creado_en', 'DESC']],
            limit: 5,
            include: [
                { model: Cliente, as: 'cliente', attributes: ['nombres', 'apellidos'] },
                {
                    model: FiadoDetalle,
                    as: 'detalles',
                    include: [{ model: Producto, as: 'producto', attributes: ['nombre'] }]
                }
            ]
        });

        // 2. Obtener los últimos 5 pagos
        const pagos = await Pago.findAll({
            where: { tienda_id: tiendaId },
            order: [['fecha_pago', 'DESC']],
            limit: 5,
            include: [
                {
                    model: Fiado,
                    as: 'fiado',
                    include: [{ model: Cliente, as: 'cliente', attributes: ['nombres', 'apellidos'] }]
                }
            ]
        });

        // 3. Formatear los fiados
        const fiadosMapeados = fiados.map(f => ({
            id: f.id,
            tipo: 'fiado',
            cliente_nombre: f.cliente ? `${f.cliente.nombres} ${f.cliente.apellidos}` : 'Cliente Desconocido',
            monto: Number(f.monto_total) || 0,
            fecha: f.creado_en,
            detalle: f.detalles.map(d => d.producto ? d.producto.nombre : 'Producto').join(', ')
        }));

        // 4. Formatear los pagos
        const pagosMapeados = pagos.map(p => {
            const cliente = p.fiado && p.fiado.cliente;
            return {
                id: p.id,
                tipo: 'pago',
                cliente_nombre: cliente ? `${cliente.nombres} ${cliente.apellidos}` : 'Cliente Desconocido',
                monto: Number(p.monto) || 0,
                fecha: p.fecha_pago,
                detalle: 'Cobro de deuda'
            };
        });

        // 5. Combinar ambas listas, ordenar por fecha descendente y tomar los últimos 5
        const movimientos = [...fiadosMapeados, ...pagosMapeados]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 5);

        res.status(200).json({
            msg: 'Movimientos recientes obtenidos exitosamente',
            movimientos
        });

    } catch (error) {
        console.error('Error al obtener movimientos recientes:', error);
        res.status(500).json({ error: 'Error interno al obtener los movimientos.' });
    }
};