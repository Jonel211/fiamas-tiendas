const { Cliente, ClienteTienda, Tienda, Fiado, FiadoDetalle, Pago, Producto, sequelize } = require('../models');
const cloudinary = require('../config/cloudinary');

// ACTUALIZAR FOTO DE PERFIL DEL CLIENTE
// PATCH /api/app-cliente/mi-perfil/foto
exports.actualizarFotoPerfil = async (req, res) => {
    try {
        const clienteId = req.usuario.id;

        if (!req.file) {
            return res.status(400).json({ error: 'No se envió ningún archivo de imagen.' });
        }

        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        // Subir buffer directamente a Cloudinary
        const uploadToCloudinary = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'clientes/perfiles' },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(buffer);
            });
        };

        const result = await uploadToCloudinary(req.file.buffer);
        const fotoUrl = result.secure_url;

        // Actualizar la URL en la BD
        await cliente.update({
            foto_perfil_url: fotoUrl,
            actualizado_en: new Date()
        });

        res.status(200).json({
            msg: 'Foto de perfil actualizada exitosamente.',
            foto_perfil_url: fotoUrl,
            cliente: {
                id: cliente.id,
                nombres: cliente.nombres,
                apellidos: cliente.apellidos,
                foto_perfil_url: fotoUrl
            }
        });
    } catch (error) {
        console.error('Error al subir foto de perfil:', error);
        res.status(500).json({ error: 'Error interno al procesar la foto de perfil.' });
    }
};


// 1. PERFIL DEL CLIENTE
// GET /api/app-cliente/mi-perfil
exports.miPerfil = async (req, res) => {
    try {
        const clienteId = req.usuario.id;

        const cliente = await Cliente.findByPk(clienteId, {
            attributes: ['id', 'telefono', 'nombres', 'apellidos', 'direccion', 'foto_perfil_url', 'activo', 'creado_en']
        });

        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        res.status(200).json({
            msg: 'Perfil obtenido exitosamente.',
            cliente
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno al obtener el perfil.' });
    }
};

// 2. ACTUALIZAR PERFIL DEL CLIENTE
// PUT /api/app-cliente/mi-perfil
// ═══════════════════════════════════════════════════════════════════════════
exports.actualizarMiPerfil = async (req, res) => {
    try {
        const clienteId = req.usuario.id;
        const { direccion, foto_perfil_url } = req.body;

        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        const datosActualizacion = {};
        if (direccion !== undefined) datosActualizacion.direccion = direccion ? String(direccion).trim() : null;
        if (foto_perfil_url !== undefined) datosActualizacion.foto_perfil_url = foto_perfil_url;

        datosActualizacion.actualizado_en = new Date();

        await cliente.update(datosActualizacion);

        res.status(200).json({
            msg: 'Perfil actualizado exitosamente.',
            cliente: {
                id: cliente.id,
                telefono: cliente.telefono,
                nombres: cliente.nombres,
                apellidos: cliente.apellidos,
                direccion: cliente.direccion,
                foto_perfil_url: cliente.foto_perfil_url
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno al actualizar el perfil.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. MIS TIENDAS VINCULADAS
// GET /api/app-cliente/mis-tiendas
// ═══════════════════════════════════════════════════════════════════════════
exports.misTiendas = async (req, res) => {
    try {
        const clienteId = req.usuario.id;

        const vinculaciones = await ClienteTienda.findAll({
            where: {
                cliente_id: clienteId,
                activo: true
            },
            include: [{
                model: Tienda,
                as: 'tienda',
                attributes: ['id', 'nombre', 'direccion', 'telefono', 'imagen_url'],
                where: { activo: true }
            }]
        });

        const tiendas = vinculaciones.map(v => ({
            id: v.tienda.id,
            nombre: v.tienda.nombre,
            direccion: v.tienda.direccion,
            telefono: v.tienda.telefono,
            imagen_url: v.tienda.imagen_url,
            vinculacion: {
                limite_credito: v.limite_credito,
                saldo_actual: v.saldo_actual,
                score_pagador: v.score_pagador,
                categoria_pagador: v.categoria_pagador,
                total_fiados: v.total_fiados,
                total_pagos: v.total_pagos
            }
        }));

        res.status(200).json({
            msg: 'Tiendas obtenidas exitosamente.',
            total: tiendas.length,
            tiendas
        });
    } catch (error) {
        console.error('Error al obtener tiendas:', error);
        res.status(500).json({ error: 'Error interno al obtener las tiendas.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. MIS FIADOS (en una tienda específica o todas)
// GET /api/app-cliente/mis-fiados?tienda_id=xxx
// ═══════════════════════════════════════════════════════════════════════════
exports.misFiados = async (req, res) => {
    try {
        const clienteId = req.usuario.id;
        const tiendaId = req.query.tienda_id;

        const whereFiado = { cliente_id: clienteId };

        if (tiendaId) {
            const vinculacion = await ClienteTienda.findOne({
                where: { cliente_id: clienteId, tienda_id: tiendaId, activo: true }
            });
            if (!vinculacion) {
                return res.status(403).json({ error: 'No tienes acceso a esta tienda.' });
            }
            whereFiado.tienda_id = tiendaId;
        }

        const fiados = await Fiado.findAll({
            where: whereFiado,
            include: [
                {
                    model: Tienda,
                    as: 'tienda',
                    attributes: ['id', 'nombre']
                },
                {
                    model: FiadoDetalle,
                    as: 'detalles',
                    include: [{
                        model: Producto,
                        as: 'producto',
                        attributes: ['id', 'nombre', 'precio_venta']
                    }]
                },
                {
                    model: Pago,
                    as: 'pagos',
                    // ✅ CORREGIDO: Se eliminó 'metodo_pago' porque no existe en la BD
                    attributes: ['id', 'monto', 'fecha_pago', 'notas'],
                    order: [['fecha_pago', 'DESC']]
                }
            ],
            order: [['creado_en', 'DESC']]
        });

        const fiadosFormateados = fiados.map(fiado => ({
            id: fiado.id,
            tienda: fiado.tienda,
            monto_total: fiado.monto_total,
            monto_pagado: fiado.monto_pagado || 0,
            saldo_pendiente: fiado.monto_total - (fiado.monto_pagado || 0),
            estado: fiado.estado,
            fecha_creacion: fiado.creado_en,
            fecha_vencimiento: fiado.fecha_vencimiento,
            detalles: fiado.detalles.map(detalle => ({
                producto: detalle.producto,
                cantidad: detalle.cantidad,
                precio_unitario: detalle.precio_unitario,
                subtotal: detalle.cantidad * detalle.precio_unitario
            })),
            pagos: fiado.pagos.map(pago => ({
                id: pago.id,
                monto: pago.monto,
                fecha_pago: pago.fecha_pago,
                notas: pago.notas || null // ✅ CORREGIDO: Se eliminó 'metodo_pago'
            }))
        }));

        res.status(200).json({
            msg: 'Fiados obtenidos exitosamente.',
            total: fiadosFormateados.length,
            fiados: fiadosFormateados
        });
    } catch (error) {
        console.error('Error al obtener fiados:', error);
        res.status(500).json({ error: 'Error interno al obtener los fiados.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. MI RESUMEN (Score, saldos, métricas)
// GET /api/app-cliente/mi-resumen
// ═══════════════════════════════════════════════════════════════════════════
exports.miResumen = async (req, res) => {
    try {
        const clienteId = req.usuario.id;

        const vinculaciones = await ClienteTienda.findAll({
            where: { cliente_id: clienteId, activo: true },
            include: [{
                model: Tienda,
                as: 'tienda',
                attributes: ['id', 'nombre'],
                where: { activo: true }
            }]
        });

        const resumenPorTienda = await Promise.all(
            vinculaciones.map(async (vinculo) => {
                const fiadosActivos = await Fiado.count({
                    where: {
                        cliente_id: clienteId,
                        tienda_id: vinculo.tienda_id,
                        estado: { [Op.in]: ['pendiente', 'parcial'] }
                    }
                });

                const montoPendiente = await Fiado.sum('monto_total', {
                    where: {
                        cliente_id: clienteId,
                        tienda_id: vinculo.tienda_id,
                        estado: { [Op.in]: ['pendiente', 'parcial'] }
                    }
                });

                const fiadosMora = await Fiado.count({
                    where: {
                        cliente_id: clienteId,
                        tienda_id: vinculo.tienda_id,
                        estado: { [Op.in]: ['pendiente', 'parcial'] },
                        fecha_vencimiento: { [Op.lt]: new Date() }
                    }
                });

                return {
                    tienda: vinculo.tienda,
                    limite_credito: vinculo.limite_credito,
                    saldo_actual: vinculo.saldo_actual,
                    score_pagador: vinculo.score_pagador,
                    categoria_pagador: vinculo.categoria_pagador,
                    total_fiados: vinculo.total_fiados,
                    total_pagos: vinculo.total_pagos,
                    fiados_activos: fiadosActivos,
                    monto_pendiente: Number(montoPendiente) || 0,
                    fiados_en_mora: fiadosMora,
                    porcentaje_limite_usado: vinculo.limite_credito > 0
                        ? ((vinculo.saldo_actual / vinculo.limite_credito) * 100).toFixed(2)
                        : 0
                };
            })
        );

        const totalSaldo = resumenPorTienda.reduce((sum, t) => sum + Number(t.saldo_actual), 0);
        const totalLimite = resumenPorTienda.reduce((sum, t) => sum + Number(t.limite_credito), 0);

        res.status(200).json({
            msg: 'Resumen obtenido exitosamente.',
            resumen_global: {
                total_tiendas: resumenPorTienda.length,
                saldo_total_pendiente: totalSaldo,
                limite_credito_total: totalLimite,
                porcentaje_limite_usado: totalLimite > 0
                    ? ((totalSaldo / totalLimite) * 100).toFixed(2)
                    : 0
            },
            detalle_por_tienda: resumenPorTienda
        });
    } catch (error) {
        console.error('Error al obtener resumen:', error);
        res.status(500).json({ error: 'Error interno al obtener el resumen.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 6. MI HISTORIAL DE PAGOS
// GET /api/app-cliente/mis-pagos?tienda_id=xxx&fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
// ═══════════════════════════════════════════════════════════════════════════
exports.misPagos = async (req, res) => {
    try {
        const clienteId = req.usuario.id;
        const tiendaId = req.query.tienda_id;
        const fechaInicio = req.query.fecha_inicio;
        const fechaFin = req.query.fecha_fin;

        const wherePago = { cliente_id: clienteId };

        if (tiendaId) {
            const vinculacion = await ClienteTienda.findOne({
                where: { cliente_id: clienteId, tienda_id: tiendaId, activo: true }
            });
            if (!vinculacion) {
                return res.status(403).json({ error: 'No tienes acceso a esta tienda.' });
            }
            wherePago.tienda_id = tiendaId;
        }

        if (fechaInicio || fechaFin) {
            wherePago.fecha_pago = {};
            if (fechaInicio) wherePago.fecha_pago[Op.gte] = new Date(fechaInicio);
            if (fechaFin) wherePago.fecha_pago[Op.lte] = new Date(fechaFin + 'T23:59:59');
        }

        const pagos = await Pago.findAll({
            where: wherePago,
            include: [
                {
                    model: Fiado,
                    as: 'fiado',
                    attributes: ['id', 'monto_total', 'estado'],
                    include: [{
                        model: Tienda,
                        as: 'tienda',
                        attributes: ['id', 'nombre']
                    }]
                }
            ],
            order: [['fecha_pago', 'DESC']],
            limit: 100
        });

        const pagosFormateados = pagos.map(pago => ({
            id: pago.id,
            monto: pago.monto,
            fecha_pago: pago.fecha_pago,
            // ✅ CORREGIDO: Se eliminó 'metodo_pago'
            referencia: pago.referencia,
            notas: pago.notas,
            fiado: {
                id: pago.fiado.id,
                monto_total: pago.fiado.monto_total,
                estado: pago.fiado.estado,
                tienda: pago.fiado.tienda
            }
        }));

        const totalPagado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

        res.status(200).json({
            msg: 'Historial de pagos obtenido exitosamente.',
            total_pagos: pagosFormateados.length,
            total_pagado: totalPagado,
            pagos: pagosFormateados
        });
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({ error: 'Error interno al obtener los pagos.' });
    }
};