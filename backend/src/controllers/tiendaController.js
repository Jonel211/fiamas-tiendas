const { Tienda, Tendero, Producto, Categoria, Alerta, Fiado, ClienteTienda, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

// 1. OBTENER DATOS DE LA TIENDA
exports.getTienda = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;

        const tienda = await Tienda.findOne({
            where: { tendero_id: tenderoId, activo: true },
            include: [
                {
                    model: Tendero,
                    as: 'tendero',
                    attributes: ['id', 'nombres', 'apellidos', 'telefono']
                }
            ]
        });

        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        res.status(200).json({
            msg: 'Datos de la tienda',
            tienda
        });
    } catch (error) {
        console.error('Error al obtener tienda:', error);
        res.status(500).json({ error: 'Error interno al obtener la tienda.' });
    }
};

// 2. ACTUALIZAR DATOS DE LA TIENDA
exports.actualizarTienda = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { nombre, imagen_url, direccion, ruc, telefono } = req.body;

        const tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        const datosActualizacion = {};
        if (nombre !== undefined) datosActualizacion.nombre = nombre;
        if (imagen_url !== undefined) datosActualizacion.imagen_url = imagen_url;
        if (direccion !== undefined) datosActualizacion.direccion = direccion;
        if (ruc !== undefined) datosActualizacion.ruc = ruc;
        if (telefono !== undefined) datosActualizacion.telefono = telefono;
        datosActualizacion.actualizado_en = new Date();

        await tienda.update(datosActualizacion);

        res.status(200).json({
            msg: 'Tienda actualizada exitosamente',
            tienda
        });
    } catch (error) {
        console.error('Error al actualizar tienda:', error);
        res.status(500).json({ error: 'Error interno al actualizar la tienda.' });
    }
};

// 3. GENERAR/REGENERAR CÓDIGO QR
exports.generarQR = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;

        const tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
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
        const tenderoId = req.usuario.id;
        const { activo } = req.body; // true o false

        if (activo === undefined) {
            return res.status(400).json({ error: 'El campo "activo" (booleano) es requerido.' });
        }

        const tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        await tienda.update({
            qr_activo: Boolean(activo),
            actualizado_en: new Date()
        });

        res.status(200).json({
            msg: `Código QR ${activo ? 'activado' : 'desactivado'} exitosamente`,
            qr_activo: Boolean(activo)
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