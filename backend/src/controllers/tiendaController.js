const { Tienda, Tendero, Producto, Categoria, Alerta, Fiado, FiadoDetalle, Pago, ScoringHistorial, LogSistema, ClienteTienda, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

// 0. OBTENER TODAS LAS TIENDAS (PANEL ADMIN)
exports.getTiendasAdmin = async (req, res) => {
    try {
        const tiendas = await Tienda.findAll({
            include: [{ model: Tendero, as: 'tendero', attributes: ['id', 'dni', 'nombres', 'apellidos', 'telefono'] }],
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
        const { nombre, tendero_id, imagen_url, direccion, ruc, telefono, activo, qr_activo } = req.body;

        if (!nombre || !tendero_id) {
            return res.status(400).json({ error: 'El nombre de la tienda y el tendero_id son obligatorios.' });
        }

        if (ruc && ruc.trim() !== '') {
            const rucLimpio = String(ruc).trim();
            if (!/^\d{11}$/.test(rucLimpio)) {
                return res.status(400).json({ error: 'El RUC debe tener exactamente 11 dígitos numéricos.' });
            }
        }

        if (telefono && telefono.trim() !== '') {
            const telLimpio = String(telefono).trim();
            if (!/^\d{9}$/.test(telLimpio)) {
                return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos numéricos.' });
            }
        }

        // Verificar que el tendero exista
        const tendero = await Tendero.findByPk(tendero_id);
        if (!tendero) {
            return res.status(404).json({ error: 'El tendero especificado no existe.' });
        }

        const nuevaTienda = await Tienda.create({
            nombre: String(nombre).trim(),
            tendero_id,
            imagen_url: imagen_url || null,
            direccion: direccion || null,
            ruc: ruc ? String(ruc).trim() : null,
            telefono: telefono ? String(telefono).trim() : tendero.telefono,
            qr_token: crypto.randomUUID(),
            qr_activo: qr_activo !== undefined ? qr_activo : true,
            activo: activo !== undefined ? activo : true
        });

        const tiendaCompleta = await Tienda.findByPk(nuevaTienda.id, {
            include: [{ model: Tendero, as: 'tendero', attributes: ['id', 'dni', 'nombres', 'apellidos', 'telefono'] }]
        });

        res.status(201).json({ msg: 'Tienda creada exitosamente', tienda: tiendaCompleta });
    } catch (error) {
        console.error('Error al crear tienda:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Ya existe una tienda con esos datos únicos.' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors?.[0]?.message || 'Datos de tienda inválidos.' });
        }
        res.status(500).json({ error: error.message || 'Error interno al crear la tienda.' });
    }
};

// 1. OBTENER DATOS DE LA TIENDA (TENDERO LOGUEADO)
exports.getTienda = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const tienda = await Tienda.findOne({
            where: { tendero_id: tenderoId, activo: true },
            include: [{ model: Tendero, as: 'tendero', attributes: ['id', 'nombres', 'apellidos', 'telefono'] }]
        });

        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        res.status(200).json({ msg: 'Datos de la tienda', tienda });
    } catch (error) {
        console.error('Error al obtener tienda:', error);
        res.status(500).json({ error: 'Error interno al obtener la tienda.' });
    }
};

// 2.  ACTUALIZAR DATOS DE LA TIENDA (CORREGIDO)
exports.actualizarTienda = async (req, res) => {
    try {
        const esAdmin = req.usuario.rol === 'admin';

        //  OBTENER EL ID CORRECTO DE LA URL (req.params.id)
        const tiendaId = req.params.id;

        if (!tiendaId) {
            return res.status(400).json({ error: 'ID de la tienda es requerido para actualizar.' });
        }

        let tienda;

        if (esAdmin) {
            // Admin puede editar cualquier tienda
            tienda = await Tienda.findByPk(tiendaId);
        } else {
            //  TENDERO: Solo puede editar SUS propias tiendas
            // Usamos el tiendaId de la URL y verificamos que pertenezca al tendero logueado
            const tenderoId = req.usuario.id;

            tienda = await Tienda.findOne({
                where: {
                    id: tiendaId,        //  ID específico de la tienda a editar
                    tendero_id: tenderoId, //  Verificar que sea del tendero logueado
                    activo: true
                }
            });
        }

        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos para editarla.' });
        }

        const { nombre, imagen_url, direccion, ruc, telefono, activo, qr_activo } = req.body;

        // Validaciones
        if (ruc !== undefined && ruc !== null && String(ruc).trim() !== '') {
            const rucLimpio = String(ruc).trim();
            if (!/^\d{11}$/.test(rucLimpio)) {
                return res.status(400).json({ error: 'El RUC debe tener exactamente 11 dígitos numéricos.' });
            }
        }

        if (telefono !== undefined && telefono !== null && String(telefono).trim() !== '') {
            const telLimpio = String(telefono).trim();
            if (!/^\d{9}$/.test(telLimpio)) {
                return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos numéricos.' });
            }
        }

        // Construir objeto de actualización
        const datosActualizacion = {};

        if (nombre !== undefined) datosActualizacion.nombre = String(nombre).trim();
        if (imagen_url !== undefined) datosActualizacion.imagen_url = imagen_url;
        if (direccion !== undefined) datosActualizacion.direccion = direccion;
        if (ruc !== undefined) datosActualizacion.ruc = ruc ? String(ruc).trim() : null;
        if (telefono !== undefined) datosActualizacion.telefono = telefono ? String(telefono).trim() : null;

        // Solo admin puede cambiar estos campos
        if (esAdmin && activo !== undefined) datosActualizacion.activo = activo;
        if (qr_activo !== undefined) datosActualizacion.qr_activo = qr_activo;

        datosActualizacion.actualizado_en = new Date();

        //  ACTUALIZAR LA TIENDA CORRECTA
        await tienda.update(datosActualizacion);

        // Recargar datos actualizados
        const tiendaActualizada = await Tienda.findByPk(tienda.id, {
            include: [{ model: Tendero, as: 'tendero', attributes: ['id', 'dni', 'nombres', 'apellidos', 'telefono'] }]
        });

        res.status(200).json({
            msg: 'Tienda actualizada exitosamente',
            tienda: tiendaActualizada
        });
    } catch (error) {
        console.error('Error al actualizar tienda:', error);
        res.status(500).json({ error: 'Error interno al actualizar la tienda.' });
    }
};

// 2.1 TOGGLE ACTIVO TIENDA (ADMIN)
exports.toggleActivoTienda = async (req, res) => {
    try {
        const { id } = req.params;
        const tienda = await Tienda.findByPk(id);

        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada.' });
        }

        const nuevoEstado = !tienda.activo;
        await tienda.update({
            activo: nuevoEstado,
            actualizado_en: new Date()
        });

        res.status(200).json({
            msg: `Tienda ${nuevoEstado ? 'activada' : 'desactivada'} exitosamente`,
            activo: nuevoEstado
        });
    } catch (error) {
        console.error('Error al cambiar estado de tienda:', error);
        res.status(500).json({ error: 'Error interno al cambiar estado de la tienda.' });
    }
};

// 2.2 ELIMINAR TIENDA (ADMIN)
exports.eliminarTiendaAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const tienda = await Tienda.findByPk(id);

        if (!tienda) {
            await t.rollback();
            return res.status(404).json({ error: 'Tienda no encontrada.' });
        }

        // Obtener IDs de fiados para borrar detalles y pagos
        const fiados = await Fiado.findAll({ where: { tienda_id: id }, attributes: ['id'], transaction: t });
        const fiadosIds = fiados.map(f => f.id);

        if (fiadosIds.length > 0) {
            await Promise.all([
                FiadoDetalle.destroy({ where: { fiado_id: { [Op.in]: fiadosIds } }, transaction: t }),
                Pago.destroy({ where: { fiado_id: { [Op.in]: fiadosIds } }, transaction: t })
            ]);
        }
        await Promise.all([
            Pago.destroy({ where: { tienda_id: id }, transaction: t }),
            Fiado.destroy({ where: { tienda_id: id }, transaction: t }),
            Alerta.destroy({ where: { tienda_id: id }, transaction: t }),
            ScoringHistorial.destroy({ where: { tienda_id: id }, transaction: t }),
            LogSistema.destroy({ where: { tienda_id: id }, transaction: t }),
            ClienteTienda.destroy({ where: { tienda_id: id }, transaction: t }),
            Producto.destroy({ where: { tienda_id: id }, transaction: t }),
            Categoria.destroy({ where: { tienda_id: id }, transaction: t })
        ]);
        await tienda.destroy({ transaction: t });

        await t.commit();
        res.status(200).json({ msg: 'Tienda eliminada exitosamente', id });
    } catch (error) {
        await t.rollback();
        console.error('Error al eliminar tienda:', error);
        res.status(500).json({ error: 'Error interno al eliminar la tienda.' });
    }
};

// 3. GENERAR/REGENERAR CÓDIGO QR
exports.generarQR = async (req, res) => {
    try {
        const esAdmin = req.usuario.rol === 'admin';
        const tiendaId = req.params.id || req.body.id;

        let tienda;
        if (esAdmin) {
            if (!tiendaId) {
                return res.status(400).json({ error: 'ID de la tienda requerido para generar QR.' });
            }
            tienda = await Tienda.findByPk(tiendaId);
        } else {
            const tenderoId = req.usuario.id;
            tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        }

        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró la tienda especificada.' });
        }

        // Generar nuevo token QR único
        const nuevoToken = crypto.randomUUID();

        await tienda.update({
            qr_token: nuevoToken,
            qr_fecha_creacion: new Date(),
            qr_activo: true,
            actualizado_en: new Date()
        });

        // URL base configurable para la vinculación
        const frontendUrl = process.env.FRONTEND_URL || 'https://fiamas.app';
        const qrUrl = `${frontendUrl}/vincular-tienda?token=${nuevoToken}`;

        res.status(200).json({
            msg: 'Código QR generado exitosamente',
            qr_token: nuevoToken,
            qr_url: qrUrl,
            qr_activo: tienda.qr_activo
        });
    } catch (error) {
        console.error('Error al generar QR:', error);
        res.status(500).json({ error: 'Error interno al generar el código QR.' });
    }
};

// 4. ACTIVAR/DESACTIVAR CÓDIGO QR
exports.toggleQR = async (req, res) => {
    try {
        const esAdmin = req.usuario.rol === 'admin';
        const tiendaId = req.params.id || req.body.id;
        const { activo } = req.body; // true o false

        let tienda;
        if (esAdmin) {
            if (!tiendaId) {
                return res.status(400).json({ error: 'ID de la tienda requerido para cambiar QR.' });
            }
            tienda = await Tienda.findByPk(tiendaId);
        } else {
            const tenderoId = req.usuario.id;
            tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        }

        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró la tienda especificada.' });
        }

        const nuevoEstadoQR = activo !== undefined ? Boolean(activo) : !tienda.qr_activo;

        await tienda.update({
            qr_activo: nuevoEstadoQR,
            actualizado_en: new Date()
        });

        res.status(200).json({
            msg: `Código QR ${nuevoEstadoQR ? 'activado' : 'desactivado'} exitosamente`,
            qr_activo: nuevoEstadoQR
        });
    } catch (error) {
        console.error('Error al cambiar estado del QR:', error);
        res.status(500).json({ error: 'Error interno al cambiar el estado del QR.' });
    }
};

// 5. OBTENER RESUMEN DE LA TIENDA (Dashboard)
exports.getResumenTienda = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;

        const tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        // Total de productos
        const totalProductos = await Producto.count({
            where: { tienda_id: tienda.id, activo: true }
        });

        // Productos con stock bajo (solo productos con control de inventario)
        const productosStockBajo = await Producto.count({
            where: {
                tienda_id: tienda.id,
                activo: true,
                stock_actual: { [Op.ne]: null },
                stock_minimo: { [Op.ne]: null },
                [Op.and]: [
                    sequelize.where(sequelize.col('stock_actual'), { [Op.lte]: sequelize.col('stock_minimo') })
                ]
            }
        });

        // Total de categorías
        const totalCategorias = await Categoria.count({
            where: { tienda_id: tienda.id, activo: true }
        });

        // Total de clientes vinculados
        const totalClientes = await ClienteTienda.count({
            where: { tienda_id: tienda.id, activo: true }
        });

        // Fiados pendientes
        const fiadosPendientes = await Fiado.count({
            where: {
                tienda_id: tienda.id,
                estado: { [Op.in]: ['pendiente', 'parcial'] }
            }
        });

        // Monto total por cobrar
        const fiadosMonto = await Fiado.sum('monto_total', {
            where: {
                tienda_id: tienda.id,
                estado: { [Op.in]: ['pendiente', 'parcial'] }
            }
        });

        // Alertas pendientes
        const alertasPendientes = await Alerta.count({
            where: { tienda_id: tienda.id, estado: 'pendiente' }
        });

        res.status(200).json({
            msg: 'Resumen de la tienda',
            resumen: {
                tienda_id: tienda.id,
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