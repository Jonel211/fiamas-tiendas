const { Cliente, ClienteTienda, Tienda, Fiado, FiadoDetalle, Producto, Pago, Tendero, sequelize } = require('../models');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════════════════════════════════════
// 1. CREAR CLIENTE (con vinculación automática a la tienda)
// POST /api/clientes
// ═══════════════════════════════════════════════════════════════════════════
exports.crearCliente = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const tenderoId = req.usuario.id;
        const { telefono, nombres, apellidos, direccion, limite_credito } = req.body;

        // Validaciones básicas
        if (!telefono || !nombres || !apellidos) {
            await t.rollback();
            return res.status(400).json({
                error: 'Teléfono, nombres y apellidos son obligatorios.'
            });
        }

        // Validar formato de teléfono (9 dígitos)
        const telefonoLimpio = String(telefono).trim();
        if (!/^\d{9}$/.test(telefonoLimpio)) {
            await t.rollback();
            return res.status(400).json({
                error: 'El teléfono debe tener exactamente 9 dígitos numéricos.'
            });
        }

        // Validar que la tienda pertenezca al tendero
        const tiendaId = req.body.tienda_id;
        if (!tiendaId) {
            await t.rollback();
            return res.status(400).json({
                error: 'El tienda_id es obligatorio para vincular el cliente.'
            });
        }

        const tienda = await Tienda.findOne({
            where: { id: tiendaId, tendero_id: tenderoId, activo: true },
            transaction: t
        });

        if (!tienda) {
            await t.rollback();
            return res.status(404).json({
                error: 'Tienda no encontrada o no tienes permisos.'
            });
        }

        // Validar límite de crédito si se proporciona
        if (limite_credito !== undefined && limite_credito < 0) {
            await t.rollback();
            return res.status(400).json({
                error: 'El límite de crédito no puede ser negativo.'
            });
        }

        // Buscar si el cliente ya existe por teléfono
        let cliente = await Cliente.findOne({
            where: { telefono: telefonoLimpio },
            transaction: t
        });

        let clienteCreado = false;

        if (!cliente) {
            // Crear nuevo cliente
            cliente = await Cliente.create({
                telefono: telefonoLimpio,
                nombres: String(nombres).trim(),
                apellidos: String(apellidos).trim(),
                direccion: direccion ? String(direccion).trim() : null,
                activo: true
            }, { transaction: t });
            clienteCreado = true;
        }

        // Verificar si ya existe la vinculación
        const vinculacionExistente = await ClienteTienda.findOne({
            where: {
                cliente_id: cliente.id,
                tienda_id: tiendaId,
                activo: true
            },
            transaction: t
        });

        if (vinculacionExistente) {
            await t.rollback();
            return res.status(400).json({
                error: 'El cliente ya está vinculado a esta tienda.',
                cliente: cliente,
                vinculacion: vinculacionExistente
            });
        }

        // Crear vinculación automática Cliente-Tienda
        const vinculacion = await ClienteTienda.create({
            cliente_id: cliente.id,
            tienda_id: tiendaId,
            metodo_vinculacion: 'manual',
            limite_credito: limite_credito || 500.00,
            saldo_actual: 0.00,
            score_pagador: 100,
            categoria_pagador: 'nuevo',
            total_fiados: 0,
            total_pagos: 0,
            cantidad_fiados_mora: 0,
            activo: true
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            msg: clienteCreado
                ? 'Cliente creado y vinculado exitosamente'
                : 'Cliente existente vinculado a la tienda exitosamente',
            cliente: {
                id: cliente.id,
                telefono: cliente.telefono,
                nombres: cliente.nombres,
                apellidos: cliente.apellidos,
                direccion: cliente.direccion
            },
            vinculacion: {
                id: vinculacion.id,
                tienda_id: vinculacion.tienda_id,
                limite_credito: vinculacion.limite_credito,
                saldo_actual: vinculacion.saldo_actual,
                score_pagador: vinculacion.score_pagador,
                categoria_pagador: vinculacion.categoria_pagador
            }
        });

    } catch (error) {
        await t.rollback();
        console.error('Error al crear cliente:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                error: 'Ya existe un cliente con ese teléfono.'
            });
        }

        res.status(500).json({
            error: 'Error interno al crear el cliente.'
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 2. LISTAR CLIENTES DE UNA TIENDA ESPECÍFICA
// GET /api/clientes?tienda_id=xxx
// ══════════════════════════════════════════════════════════════════════════
exports.listarClientes = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const tiendaId = req.query.tienda_id;

        if (!tiendaId) {
            return res.status(400).json({
                error: 'El parámetro tienda_id es obligatorio.'
            });
        }

        // Validar que la tienda pertenezca al tendero
        const tienda = await Tienda.findOne({
            where: { id: tiendaId, tendero_id: tenderoId, activo: true }
        });

        if (!tienda) {
            return res.status(404).json({
                error: 'Tienda no encontrada o no tienes permisos.'
            });
        }

        // Obtener clientes vinculados a esta tienda
        const clientesTienda = await ClienteTienda.findAll({
            where: {
                tienda_id: tiendaId,
                activo: true
            },
            include: [{
                model: Cliente,
                as: 'cliente',
                // Se incluye el campo 'creado_en' para que el frontend pueda mostrar la fecha de registro del cliente en la app (Ej: "Cliente desde octubre 2026").
                attributes: ['id', 'telefono', 'nombres', 'apellidos', 'direccion', 'foto_perfil_url', 'creado_en'],
                where: { activo: true }
            }],
            order: [['creado_en', 'DESC']]
        });

        // Formatear respuesta
        const clientes = clientesTienda.map(ct => ({
            id: ct.cliente.id,
            telefono: ct.cliente.telefono,
            nombres: ct.cliente.nombres,
            apellidos: ct.cliente.apellidos,
            direccion: ct.cliente.direccion,
            foto_perfil_url: ct.cliente.foto_perfil_url,
            // Se retorna la fecha de creación al frontend para construir el perfil del cliente.
            creado_en: ct.cliente.creado_en, 
            vinculacion: {
                id: ct.id,
                limite_credito: ct.limite_credito,
                saldo_actual: ct.saldo_actual,
                score_pagador: ct.score_pagador,
                categoria_pagador: ct.categoria_pagador,
                total_fiados: ct.total_fiados,
                total_pagos: ct.total_pagos,
                cantidad_fiados_mora: ct.cantidad_fiados_mora,
                metodo_vinculacion: ct.metodo_vinculacion
            }
        }));

        res.status(200).json({
            msg: 'Clientes obtenidos exitosamente',
            tienda: {
                id: tienda.id,
                nombre: tienda.nombre
            },
            total: clientes.length,
            clientes
        });

    } catch (error) {
        console.error('Error al listar clientes:', error);
        res.status(500).json({
            error: 'Error interno al obtener los clientes.'
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 3. OBTENER DETALLE DE UN CLIENTE
// GET /api/clientes/:id
// ═══════════════════════════════════════════════════════════════════════════
exports.obtenerCliente = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const clienteId = req.params.id;

        // Buscar el cliente
        const cliente = await Cliente.findByPk(clienteId, {
            attributes: ['id', 'telefono', 'nombres', 'apellidos', 'direccion', 'foto_perfil_url', 'activo', 'creado_en']
        });

        if (!cliente) {
            return res.status(404).json({
                error: 'Cliente no encontrado.'
            });
        }

        // Obtener todas las vinculaciones del cliente con tiendas del tendero
        const tiendasTendero = await Tienda.findAll({
            where: { tendero_id: tenderoId, activo: true },
            attributes: ['id']
        });

        const tiendaIds = tiendasTendero.map(t => t.id);

        const vinculaciones = await ClienteTienda.findAll({
            where: {
                cliente_id: clienteId,
                tienda_id: { [Op.in]: tiendaIds },
                activo: true
            },
            include: [{
                model: Tienda,
                as: 'tienda',
                attributes: ['id', 'nombre', 'direccion']
            }]
        });

        res.status(200).json({
            msg: 'Cliente obtenido exitosamente',
            cliente: {
                id: cliente.id,
                telefono: cliente.telefono,
                nombres: cliente.nombres,
                apellidos: cliente.apellidos,
                direccion: cliente.direccion,
                foto_perfil_url: cliente.foto_perfil_url,
                activo: cliente.activo,
                creado_en: cliente.creado_en
            },
            vinculaciones: vinculaciones.map(v => ({
                id: v.id,
                tienda: v.tienda,
                limite_credito: v.limite_credito,
                saldo_actual: v.saldo_actual,
                score_pagador: v.score_pagador,
                categoria_pagador: v.categoria_pagador,
                total_fiados: v.total_fiados,
                total_pagos: v.total_pagos,
                cantidad_fiados_mora: v.cantidad_fiados_mora
            }))
        });

    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({
            error: 'Error interno al obtener el cliente.'
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 4. ACTUALIZAR CLIENTE
// PUT /api/clientes/:id
// ═══════════════════════════════════════════════════════════════════════════
exports.actualizarCliente = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const clienteId = req.params.id;
        const { nombres, apellidos, direccion, foto_perfil_url } = req.body;

        // Buscar el cliente
        const cliente = await Cliente.findByPk(clienteId);

        if (!cliente) {
            return res.status(404).json({
                error: 'Cliente no encontrado.'
            });
        }

        // Verificar que el cliente esté vinculado a alguna tienda del tendero
        const tiendasTendero = await Tienda.findAll({
            where: { tendero_id: tenderoId, activo: true },
            attributes: ['id']
        });

        const tiendaIds = tiendasTendero.map(t => t.id);

        const vinculacion = await ClienteTienda.findOne({
            where: {
                cliente_id: clienteId,
                tienda_id: { [Op.in]: tiendaIds },
                activo: true
            }
        });

        if (!vinculacion) {
            return res.status(403).json({
                error: 'No tienes permisos para editar este cliente.'
            });
        }

        // Construir objeto de actualización
        const datosActualizacion = {};

        if (nombres !== undefined) datosActualizacion.nombres = String(nombres).trim();
        if (apellidos !== undefined) datosActualizacion.apellidos = String(apellidos).trim();
        if (direccion !== undefined) datosActualizacion.direccion = direccion ? String(direccion).trim() : null;
        if (foto_perfil_url !== undefined) datosActualizacion.foto_perfil_url = foto_perfil_url;

        datosActualizacion.actualizado_en = new Date();

        await cliente.update(datosActualizacion);

        res.status(200).json({
            msg: 'Cliente actualizado exitosamente',
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
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({
            error: 'Error interno al actualizar el cliente.'
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 5. BUSCAR CLIENTE POR TELÉFONO (BÚSQUEDA PARCIAL)
// GET /api/clientes/buscar?telefono=999&tienda_id=xxx
// ═══════════════════════════════════════════════════════════════════════════
exports.buscarCliente = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const telefono = req.query.telefono;
        const tiendaId = req.query.tienda_id;

        if (!telefono) {
            return res.status(400).json({
                error: 'El parámetro telefono es obligatorio.'
            });
        }

        if (!tiendaId) {
            return res.status(400).json({
                error: 'El parámetro tienda_id es obligatorio.'
            });
        }

        // Validar que la tienda pertenezca al tendero
        const tienda = await Tienda.findOne({
            where: { id: tiendaId, tendero_id: tenderoId, activo: true }
        });

        if (!tienda) {
            return res.status(404).json({
                error: 'Tienda no encontrada o no tienes permisos.'
            });
        }

        // Búsqueda parcial por teléfono
        const clientesTienda = await ClienteTienda.findAll({
            where: {
                tienda_id: tiendaId,
                activo: true
            },
            include: [{
                model: Cliente,
                as: 'cliente',
                attributes: ['id', 'telefono', 'nombres', 'apellidos', 'foto_perfil_url'],
                where: {
                    activo: true,
                    telefono: { [Op.like]: `%${telefono}%` }
                }
            }],
            order: [['creado_en', 'DESC']]
        });

        // Filtrar resultados (solo los que tienen cliente asociado)
        const resultados = clientesTienda
            .filter(ct => ct.cliente)
            .map(ct => ({
                id: ct.cliente.id,
                telefono: ct.cliente.telefono,
                nombres: ct.cliente.nombres,
                apellidos: ct.cliente.apellidos,
                foto_perfil_url: ct.cliente.foto_perfil_url,
                vinculacion: {
                    id: ct.id,
                    limite_credito: ct.limite_credito,
                    saldo_actual: ct.saldo_actual,
                    score_pagador: ct.score_pagador,
                    categoria_pagador: ct.categoria_pagador
                }
            }));

        res.status(200).json({
            msg: 'Búsqueda completada exitosamente',
            total: resultados.length,
            resultados
        });

    } catch (error) {
        console.error('Error al buscar cliente:', error);
        res.status(500).json({
            error: 'Error interno al buscar el cliente.'
        });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// CLIENTES RECIENTES (últimos a quienes se les hizo un fiado)
// GET /api/clientes/recientes?tienda_id=xxx&limit=4
// ═══════════════════════════════════════════════════════════════════════════
exports.clientesRecientes = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const tiendaId = req.query.tienda_id;
        const limite = Math.min(parseInt(req.query.limit) || 4, 10);

        if (!tiendaId) {
            return res.status(400).json({ error: 'El parámetro tienda_id es obligatorio.' });
        }

        const tienda = await Tienda.findOne({
            where: { id: tiendaId, tendero_id: tenderoId, activo: true }
        });
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        // 1. Últimos clientes con fiado, ordenados por su fiado más reciente
        const ultimos = await Fiado.findAll({
            attributes: [
                'cliente_id',
                [sequelize.fn('MAX', sequelize.col('creado_en')), 'ultimo_fiado']
            ],
            where: { tienda_id: tiendaId },
            group: ['cliente_id'],
            order: [[sequelize.literal('ultimo_fiado'), 'DESC']],
            limit: limite,
            raw: true
        });

        const ids = ultimos.map(u => u.cliente_id);
        if (ids.length === 0) {
            return res.status(200).json({ total: 0, clientes: [] });
        }

        // 2. Datos del cliente y su vinculación con esta tienda
        const clientesTienda = await ClienteTienda.findAll({
            where: { tienda_id: tiendaId, cliente_id: { [Op.in]: ids }, activo: true },
            include: [{
                model: Cliente,
                as: 'cliente',
                attributes: ['id', 'telefono', 'nombres', 'apellidos', 'direccion', 'foto_perfil_url'],
                where: { activo: true }
            }]
        });

        // 3. Respetar el orden de "más reciente primero"
        const porCliente = new Map(clientesTienda.map(ct => [ct.cliente_id, ct]));
        const clientes = ids
            .map(id => porCliente.get(id))
            .filter(Boolean)
            .map(ct => ({
                id: ct.cliente.id,
                telefono: ct.cliente.telefono,
                nombres: ct.cliente.nombres,
                apellidos: ct.cliente.apellidos,
                direccion: ct.cliente.direccion,
                foto_perfil_url: ct.cliente.foto_perfil_url,
                vinculacion: {
                    id: ct.id,
                    limite_credito: ct.limite_credito,
                    saldo_actual: ct.saldo_actual,
                    score_pagador: ct.score_pagador,
                    categoria_pagador: ct.categoria_pagador,
                    total_fiados: ct.total_fiados,
                    total_pagos: ct.total_pagos,
                    cantidad_fiados_mora: ct.cantidad_fiados_mora
                }
            }));

        res.status(200).json({ total: clientes.length, clientes });

    } catch (error) {
        console.error('Error al obtener clientes recientes:', error);
        res.status(500).json({ error: 'Error interno al obtener los clientes recientes.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 6. VINCULAR CLIENTE EXISTENTE A UNA TIENDA
// POST /api/clientes/:clienteId/vincular
// ═══════════════════════════════════════════════════════════════════════════
exports.vincularCliente = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { clienteId } = req.params;
        const { tienda_id, limite_credito } = req.body;

        // 1. Validar que el cliente exista
        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ error: 'El cliente no existe.' });
        }

        // 2. Validar que la tienda pertenezca al tendero
        const tienda = await Tienda.findOne({
            where: { id: tienda_id, tendero_id: tenderoId, activo: true }
        });
        if (!tienda) {
            return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
        }

        // 3. Verificar si ya existe el vínculo
        const vinculoExistente = await ClienteTienda.findOne({
            where: { cliente_id: clienteId, tienda_id: tienda_id }
        });

        if (vinculoExistente) {
            // Si existe pero está inactivo, lo reactivamos
            if (!vinculoExistente.activo) {
                await vinculoExistente.update({ activo: true, actualizado_en: new Date() });
                return res.status(200).json({ msg: 'Vínculo reactivado exitosamente.', vinculacion: vinculoExistente });
            }
            return res.status(400).json({ error: 'El cliente ya está vinculado activamente a esta tienda.' });
        }

        // 4. Crear el vínculo
        const nuevaVinculacion = await ClienteTienda.create({
            cliente_id: clienteId,
            tienda_id: tienda_id,
            metodo_vinculacion: 'manual',
            limite_credito: limite_credito || 500.00,
            saldo_actual: 0.00,
            score_pagador: 100,
            categoria_pagador: 'nuevo',
            activo: true
        });

        res.status(201).json({
            msg: 'Cliente vinculado a la tienda exitosamente.',
            vinculacion: nuevaVinculacion
        });

    } catch (error) {
        console.error('Error al vincular cliente:', error);
        res.status(500).json({ error: 'Error interno al vincular el cliente.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 7. VER TIENDAS VINCULADAS A UN CLIENTE
// GET /api/clientes/:clienteId/tiendas
// ═══════════════════════════════════════════════════════════════════════════
exports.verTiendasVinculadas = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { clienteId } = req.params;

        // Validar que el cliente exista
        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        // Obtener IDs de las tiendas del tendero para filtrar (seguridad)
        const tiendasDelTendero = await Tienda.findAll({
            where: { tendero_id: tenderoId },
            attributes: ['id']
        });
        const tiendasIds = tiendasDelTendero.map(t => t.id);

        // Buscar vínculos
        const vinculaciones = await ClienteTienda.findAll({
            where: {
                cliente_id: clienteId,
                tienda_id: { [Op.in]: tiendasIds } // Solo mostrar tiendas del tendero
            },
            include: [{
                model: Tienda,
                as: 'tienda',
                attributes: ['id', 'nombre', 'direccion']
            }]
        });

        res.status(200).json({
            msg: 'Vínculos obtenidos exitosamente.',
            total: vinculaciones.length,
            vinculaciones
        });

    } catch (error) {
        console.error('Error al obtener tiendas vinculadas:', error);
        res.status(500).json({ error: 'Error interno al obtener los vínculos.' });
    }
};

// ══════════════════════════════════════════════════════════════════════════
// 8. EDITAR VÍNCULO (Ej. Cambiar límite de crédito)
// PUT /api/clientes/:clienteId/tiendas/:tiendaId
// ═══════════════════════════════════════════════════════════════════════════
exports.editarVinculo = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { clienteId, tiendaId } = req.params;
        const { limite_credito } = req.body;

        // Buscar el vínculo específico
        const vinculacion = await ClienteTienda.findOne({
            where: {
                cliente_id: clienteId,
                tienda_id: tiendaId
            }
        });

        if (!vinculacion) {
            return res.status(404).json({ error: 'El vínculo no existe.' });
        }

        // Validar que la tienda sea del tendero
        const tienda = await Tienda.findOne({
            where: { id: tiendaId, tendero_id: tenderoId }
        });
        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos sobre esta tienda.' });
        }

        // Regla de negocio: No reducir límite por debajo del saldo actual
        if (limite_credito !== undefined && limite_credito < vinculacion.saldo_actual) {
            return res.status(400).json({
                error: `El límite de crédito no puede ser menor al saldo actual (${vinculacion.saldo_actual}).`
            });
        }

        // Actualizar
        const datosUpdate = { actualizado_en: new Date() };
        if (limite_credito !== undefined) datosUpdate.limite_credito = limite_credito;

        await vinculacion.update(datosUpdate);

        res.status(200).json({
            msg: 'Vínculo actualizado exitosamente.',
            vinculacion
        });

    } catch (error) {
        console.error('Error al editar vínculo:', error);
        res.status(500).json({ error: 'Error interno al editar el vínculo.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 9. DESVINCULAR CLIENTE DE TIENDA
// DELETE /api/clientes/:clienteId/tiendas/:tiendaId
// ═══════════════════════════════════════════════════════════════════════════
exports.desvincularCliente = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { clienteId, tiendaId } = req.params;

        // Buscar el vínculo
        const vinculacion = await ClienteTienda.findOne({
            where: {
                cliente_id: clienteId,
                tienda_id: tiendaId
            }
        });

        if (!vinculacion) {
            return res.status(404).json({ error: 'El vínculo no existe.' });
        }

        // Validar permisos
        const tienda = await Tienda.findOne({
            where: { id: tiendaId, tendero_id: tenderoId }
        });
        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permisos sobre esta tienda.' });
        }

        // Validar que no tenga deuda pendiente (opcional pero recomendado)
        if (vinculacion.saldo_actual > 0) {
            return res.status(400).json({
                error: 'No se puede desvincular un cliente con deuda pendiente. Salda la deuda primero.'
            });
        }

        // Desactivar (Soft Delete)
        await vinculacion.update({ activo: false, actualizado_en: new Date() });

        res.status(200).json({
            msg: 'Cliente desvinculado exitosamente.'
        });

    } catch (error) {
        console.error('Error al desvincular cliente:', error);
        res.status(500).json({ error: 'Error interno al desvincular el cliente.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 10. LISTAR FIADOS DE UN CLIENTE
// GET /api/clientes/:clienteId/fiados?tienda_id=xxx
// ═══════════════════════════════════════════════════════════════════════════
exports.listarFiadosCliente = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { clienteId } = req.params;
        const tiendaId = req.query.tienda_id;

        // Validar que el cliente exista
        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        // Si se proporciona tienda_id, validar que pertenezca al tendero
        if (tiendaId) {
            const tienda = await Tienda.findOne({
                where: { id: tiendaId, tendero_id: tenderoId, activo: true }
            });
            if (!tienda) {
                return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
            }
        }

        // Obtener IDs de tiendas del tendero para filtrar
        const tiendasDelTendero = await Tienda.findAll({
            where: { tendero_id: tenderoId, activo: true },
            attributes: ['id']
        });
        const tiendasIds = tiendasDelTendero.map(t => t.id);

        // Construir filtros
        const whereFiado = {
            cliente_id: clienteId,
            tienda_id: { [Op.in]: tiendasIds }
        };

        if (tiendaId) {
            whereFiado.tienda_id = tiendaId;
        }

        // Buscar fiados con sus detalles
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
                    attributes: ['id', 'monto', 'fecha_pago', 'metodo_pago'],
                    order: [['fecha_pago', 'DESC']]
                }
            ],
            order: [['creado_en', 'DESC']]
        });

        // Formatear respuesta
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
                metodo_pago: pago.metodo_pago
            }))
        }));

        res.status(200).json({
            msg: 'Fiados del cliente obtenidos exitosamente.',
            total: fiadosFormateados.length,
            fiados: fiadosFormateados
        });

    } catch (error) {
        console.error('Error al listar fiados del cliente:', error);
        res.status(500).json({ error: 'Error interno al obtener los fiados.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 11. RESUMEN COMPLETO DEL CLIENTE
// GET /api/clientes/:clienteId/resumen?tienda_id=xxx
// ═══════════════════════════════════════════════════════════════════════════
exports.resumenCliente = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { clienteId } = req.params;
        const tiendaId = req.query.tienda_id;

        // Validar que el cliente exista
        const cliente = await Cliente.findByPk(clienteId, {
            // Se incluye el campo 'creado_en' para que el frontend pueda mostrar la fecha exacta en la que el cliente se registró.
            attributes: ['id', 'telefono', 'nombres', 'apellidos', 'direccion', 'foto_perfil_url', 'creado_en']
        });
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        // Obtener IDs de tiendas del tendero
        const tiendasDelTendero = await Tienda.findAll({
            where: { tendero_id: tenderoId, activo: true },
            attributes: ['id']
        });
        const tiendasIds = tiendasDelTendero.map(t => t.id);

        // Si se proporciona tienda_id, validar
        if (tiendaId) {
            const tienda = await Tienda.findOne({
                where: { id: tiendaId, tendero_id: tenderoId, activo: true }
            });
            if (!tienda) {
                return res.status(404).json({ error: 'Tienda no encontrada o no tienes permisos.' });
            }
        }

        // Obtener vínculos del cliente con las tiendas del tendero
        const whereVinculo = {
            cliente_id: clienteId,
            tienda_id: { [Op.in]: tiendasIds },
            activo: true
        };

        if (tiendaId) {
            whereVinculo.tienda_id = tiendaId;
        }

        const vinculaciones = await ClienteTienda.findAll({
            where: whereVinculo,
            include: [{
                model: Tienda,
                as: 'tienda',
                attributes: ['id', 'nombre']
            }]
        });

        // Calcular estadísticas por vínculo
        const resumenPorTienda = await Promise.all(
            vinculaciones.map(async (vinculo) => {
                // Total de fiados
                const totalFiados = await Fiado.count({
                    where: {
                        cliente_id: clienteId,
                        tienda_id: vinculo.tienda_id,
                        estado: { [Op.in]: ['pendiente', 'parcial'] }
                    }
                });

                // Monto total pendiente
                const montoPendiente = await Fiado.sum('monto_total', {
                    where: {
                        cliente_id: clienteId,
                        tienda_id: vinculo.tienda_id,
                        estado: { [Op.in]: ['pendiente', 'parcial'] }
                    }
                });

                // Fiados en mora
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
                    cantidad_fiados_mora: vinculo.cantidad_fiados_mora,
                    // Datos calculados en tiempo real
                    fiados_activos: totalFiados,
                    monto_pendiente_real: Number(montoPendiente) || 0,
                    fiados_en_mora: fiadosMora,
                    porcentaje_limite_usado: vinculo.limite_credito > 0
                        ? ((vinculo.saldo_actual / vinculo.limite_credito) * 100).toFixed(2)
                        : 0
                };
            })
        );

        // Resumen global
        const totalSaldo = resumenPorTienda.reduce((sum, t) => sum + Number(t.saldo_actual), 0);
        const totalLimite = resumenPorTienda.reduce((sum, t) => sum + Number(t.limite_credito), 0);
        const totalFiadosActivos = resumenPorTienda.reduce((sum, t) => sum + t.fiados_activos, 0);

        res.status(200).json({
            msg: 'Resumen del cliente obtenido exitosamente.',
            cliente: {
                id: cliente.id,
                telefono: cliente.telefono,
                nombres: cliente.nombres,
                apellidos: cliente.apellidos,
                direccion: cliente.direccion,
                foto_perfil_url: cliente.foto_perfil_url,
                // Se retorna la fecha de creación para que el frontend pueda renderizar el perfil del cliente correctamente.
                creado_en: cliente.creado_en
            },
            resumen_global: {
                total_tiendas_vinculadas: resumenPorTienda.length,
                saldo_total_pendiente: totalSaldo,
                limite_credito_total: totalLimite,
                total_fiados_activos: totalFiadosActivos,
                porcentaje_limite_global_usado: totalLimite > 0
                    ? ((totalSaldo / totalLimite) * 100).toFixed(2)
                    : 0
            },
            detalle_por_tienda: resumenPorTienda
        });

    } catch (error) {
        console.error('Error al obtener resumen del cliente:', error);
        res.status(500).json({ error: 'Error interno al obtener el resumen.' });
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// 12. HISTORIAL DE PAGOS DEL CLIENTE
// GET /api/clientes/:clienteId/historial-pagos?tienda_id=xxx&fecha_inicio=YYYY-MM-DD&fecha_fin=YYYY-MM-DD
// ═══════════════════════════════════════════════════════════════════════════
exports.historialPagosCliente = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { clienteId } = req.params;
        const tiendaId = req.query.tienda_id;
        const fechaInicio = req.query.fecha_inicio;
        const fechaFin = req.query.fecha_fin;

        // Validar que el cliente exista
        const cliente = await Cliente.findByPk(clienteId);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado.' });
        }

        // Obtener IDs de tiendas del tendero
        const tiendasDelTendero = await Tienda.findAll({
            where: { tendero_id: tenderoId, activo: true },
            attributes: ['id']
        });
        const tiendasIds = tiendasDelTendero.map(t => t.id);

        // Construir filtros
        const wherePago = {
            cliente_id: clienteId,
            tienda_id: { [Op.in]: tiendasIds }
        };

        if (tiendaId) {
            wherePago.tienda_id = tiendaId;
        }

        // Filtro por rango de fechas
        if (fechaInicio || fechaFin) {
            wherePago.fecha_pago = {};
            if (fechaInicio) {
                wherePago.fecha_pago[Op.gte] = new Date(fechaInicio);
            }
            if (fechaFin) {
                wherePago.fecha_pago[Op.lte] = new Date(fechaFin + 'T23:59:59');
            }
        }

        // Buscar pagos con información del fiado
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
                },
                {
                    model: Tendero,
                    as: 'registrador',
                    attributes: ['id', 'nombres', 'apellidos']
                }
            ],
            order: [['fecha_pago', 'DESC']],
            limit: 100 // Limitar para no sobrecargar
        });

        // Formatear respuesta
        const pagosFormateados = pagos.map(pago => ({
            id: pago.id,
            monto: pago.monto,
            fecha_pago: pago.fecha_pago,
            metodo_pago: pago.metodo_pago,
            referencia: pago.referencia,
            notas: pago.notas,
            fiado: {
                id: pago.fiado.id,
                monto_total: pago.fiado.monto_total,
                estado: pago.fiado.estado,
                tienda: pago.fiado.tienda
            },
            registrado_por: pago.registrador
                ? `${pago.registrador.nombres} ${pago.registrador.apellidos}`
                : 'Sistema'
        }));

        // Calcular total pagado
        const totalPagado = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);

        res.status(200).json({
            msg: 'Historial de pagos obtenido exitosamente.',
            total_pagos: pagosFormateados.length,
            total_pagado: totalPagado,
            pagos: pagosFormateados
        });

    } catch (error) {
        console.error('Error al obtener historial de pagos:', error);
        res.status(500).json({ error: 'Error interno al obtener el historial de pagos.' });
    }
};