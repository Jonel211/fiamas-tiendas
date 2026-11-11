const { Tendero, Tienda, Cliente, Fiado, FiadoDetalle, Pago, ScoringHistorial, LogSistema, ClienteTienda, Producto, Categoria, Alerta, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { subirImagen } = require('../utils/cloudinaryUpload');

// VERIFICAR DUPLICADOS EN TIEMPO REAL
exports.verificarDuplicado = async (req, res) => {
    try {
        const { dni, telefono } = req.query;

        if (!dni && !telefono) {
            return res.status(400).json({ existe: false, mensaje: 'Debe proporcionar dni o telefono' });
        }

        let existe = false;
        let mensaje = '';

        if (dni) {
            const dniLimpio = String(dni).trim();
            const existeDni = await Tendero.findOne({ where: { dni: dniLimpio } });

            if (existeDni) {
                existe = true;
                mensaje = 'El DNI ya está registrado';
            }
        }

        if (!existe && telefono) {
            const telLimpio = String(telefono).trim();
            const existeTel = await Tendero.findOne({ where: { telefono: telLimpio } });

            if (existeTel) {
                existe = true;
                mensaje = 'El teléfono ya está registrado';
            }
        }

        return res.status(200).json({
            existe,
            mensaje: mensaje || 'No existen duplicados'
        });
    } catch (error) {
        console.error('Error en verificarDuplicado:', error);
        return res.status(500).json({ existe: false, mensaje: 'Error interno al verificar duplicados' });
    }
};

// OBTENER TODOS LOS TENDEROS (PANEL ADMIN)
exports.getTenderosAdmin = async (req, res) => {
    try {
        const tenderos = await Tendero.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Tienda, as: 'tiendas', attributes: ['id', 'nombre', 'ruc', 'direccion', 'activo', 'qr_activo'] }],
            order: [['creado_en', 'DESC']]
        });
        return res.status(200).json({ msg: 'Listado de tenderos obtenido exitosamente', tenderos });
    } catch (error) {
        console.error('Error al obtener tenderos:', error);
        return res.status(500).json({ error: 'Error interno al obtener los tenderos.' });
    }
};

// CREAR TENDERO (PANEL ADMIN O REGISTRO MÓVIL)
exports.crearTenderoAdmin = async (req, res) => {
    try {
        const { dni, nombres, apellidos, telefono, password, activo, nombre_tienda, foto_perfil_url } = req.body;
        if (!dni || !nombres || !apellidos || !telefono || !password) {
            return res.status(400).json({ error: 'DNI, nombres, apellidos, teléfono y contraseña son obligatorios.' });
        }

        const dniLimpio = String(dni).trim();
        if (!/^\d{8}$/.test(dniLimpio)) {
            return res.status(400).json({ error: 'El DNI debe tener exactamente 8 dígitos numéricos.' });
        }

        const telLimpio = String(telefono).trim();
        if (!/^\d{9}$/.test(telLimpio)) {
            return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos numéricos.' });
        }

        if (password.length > 6 || password.length < 4) {
            return res.status(400).json({ error: 'La contraseña debe tener entre 4 y 6 caracteres.' });
        }

        const [existeDni, existeTel] = await Promise.all([
            Tendero.findOne({ where: { dni: dniLimpio } }),
            Tendero.findOne({ where: { telefono: telLimpio } })
        ]);

        if (existeDni) return res.status(400).json({ error: 'Ya existe un tendero registrado con ese DNI.' });
        if (existeTel) return res.status(400).json({ error: 'Ya existe un tendero registrado con ese número de teléfono.' });

        const nuevoTendero = await Tendero.create({
            dni: dniLimpio,
            nombres: nombres.trim(),
            apellidos: apellidos.trim(),
            telefono: telLimpio,
            foto_perfil_url: foto_perfil_url || null,
            password_hash: password,
            activo: activo !== undefined ? activo : true
        });

        const nuevaTienda = await Tienda.create({
            tendero_id: nuevoTendero.id,
            nombre: nombre_tienda ? nombre_tienda.trim() : `Tienda de ${nombres.trim()}`,
            telefono: telLimpio,
            qr_token: crypto.randomUUID(),
            qr_activo: true,
            activo: true
        });

        const tenderoConTiendas = await Tendero.findByPk(nuevoTendero.id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Tienda, as: 'tiendas' }]
        });

        return res.status(201).json({
            msg: 'Tendero registrado exitosamente',
            tendero: tenderoConTiendas,
            tienda: nuevaTienda
        });
    } catch (error) {
        console.error('Error al crear tendero:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'El DNI o teléfono ya se encuentra registrado.' });
        }
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ error: error.errors?.[0]?.message || 'Datos de tendero inválidos.' });
        }
        return res.status(500).json({ error: 'Error interno al registrar el tendero.' });
    }
};

// ACTUALIZAR TENDERO POR ID (PANEL ADMIN)
exports.actualizarTenderoAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { dni, nombres, apellidos, telefono, password, activo, foto_perfil_url } = req.body;

        const tendero = await Tendero.findByPk(id);
        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        if (dni && dni !== tendero.dni) {
            const dniLimpio = String(dni).trim();
            if (!/^\d{8}$/.test(dniLimpio)) {
                return res.status(400).json({ error: 'El DNI debe tener exactamente 8 dígitos numéricos.' });
            }
            const existeDni = await Tendero.findOne({ where: { dni: dniLimpio, id: { [Op.ne]: id } } });
            if (existeDni) {
                return res.status(400).json({ error: 'El DNI ya pertenece a otro tendero.' });
            }
        }

        if (telefono && telefono !== tendero.telefono) {
            const telLimpio = String(telefono).trim();
            if (!/^\d{9}$/.test(telLimpio)) {
                return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos numéricos.' });
            }
            const existeTel = await Tendero.findOne({ where: { telefono: telLimpio, id: { [Op.ne]: id } } });
            if (existeTel) {
                return res.status(400).json({ error: 'El teléfono ya pertenece a otro tendero.' });
            }
        }

        const datosActualizacion = {};
        if (dni !== undefined) datosActualizacion.dni = String(dni).trim();
        if (nombres !== undefined) datosActualizacion.nombres = nombres.trim();
        if (apellidos !== undefined) datosActualizacion.apellidos = apellidos.trim();
        if (telefono !== undefined) datosActualizacion.telefono = String(telefono).trim();
        if (activo !== undefined) datosActualizacion.activo = activo;
        if (foto_perfil_url !== undefined) datosActualizacion.foto_perfil_url = foto_perfil_url;

        if (password && password.trim() !== '') {
            if (password.length > 6 || password.length < 4) {
                return res.status(400).json({ error: 'La contraseña debe tener entre 4 y 6 caracteres.' });
            }
            datosActualizacion.password_hash = password;
        }
        datosActualizacion.actualizado_en = new Date();

        await tendero.update(datosActualizacion);

        const tenderoActualizado = await Tendero.findByPk(id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Tienda, as: 'tiendas' }]
        });

        return res.status(200).json({
            msg: 'Tendero actualizado exitosamente',
            tendero: tenderoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar tendero:', error);
        return res.status(500).json({ error: 'Error interno al actualizar el tendero.' });
    }
};

// ALTERNAR ESTADO ACTIVO TENDERO (PANEL ADMIN)
exports.toggleActivoTenderoAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const tendero = await Tendero.findByPk(id);

        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        const nuevoEstado = !tendero.activo;
        await tendero.update({
            activo: nuevoEstado,
            actualizado_en: new Date()
        });

        return res.status(200).json({
            msg: `Tendero ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
            activo: nuevoEstado
        });
    } catch (error) {
        console.error('Error al cambiar estado del tendero:', error);
        return res.status(500).json({ error: 'Error interno al cambiar estado del tendero.' });
    }
};

// ACTUALIZAR ESTADO PREMIUM (PANEL ADMIN)
exports.actualizarPremium = async (req, res) => {
    let t;
    try {
        const { es_premium } = req.body || {};
        if (typeof es_premium !== 'boolean') {
            return res.status(400).json({ error: 'El campo es_premium debe ser true o false.' });
        }

        t = await sequelize.transaction();
        const tendero = await Tendero.findByPk(req.params.id, {
            attributes: ['id', 'nombres', 'apellidos', 'telefono', 'es_premium'],
            transaction: t
        });

        if (!tendero) {
            await t.rollback();
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        await tendero.update({ es_premium, actualizado_en: new Date() }, { transaction: t });

        await LogSistema.create({
            usuario_id: req.usuario.id,
            tipo_usuario: 'admin',
            accion: 'tendero_premium_actualizado',
            tabla_afectada: 'tenderos',
            descripcion: `Premium ${es_premium ? 'activado' : 'desactivado'} para el tendero ${tendero.nombres} ${tendero.apellidos}.`
        }, { transaction: t });

        await t.commit();

        return res.status(200).json({
            msg: 'Estado premium del tendero actualizado exitosamente.',
            tendero
        });
    } catch (error) {
        if (t && !t.finished) await t.rollback();
        console.error('Error al actualizar estado premium del tendero:', error);
        return res.status(500).json({ error: 'Error interno al actualizar el estado premium del tendero.' });
    }
};

// ELIMINAR TENDERO (PANEL ADMIN)
exports.eliminarTenderoAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const tendero = await Tendero.findByPk(id);

        if (!tendero) {
            await t.rollback();
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        const tiendas = await Tienda.findAll({ where: { tendero_id: id }, attributes: ['id'], transaction: t });
        const tiendaIds = tiendas.map(ti => ti.id);

        if (tiendaIds.length > 0) {
            const fiados = await Fiado.findAll({ where: { tienda_id: { [Op.in]: tiendaIds } }, attributes: ['id'], transaction: t });
            const fiadosIds = fiados.map(f => f.id);

            if (fiadosIds.length > 0) {
                await FiadoDetalle.destroy({ where: { fiado_id: { [Op.in]: fiadosIds } }, transaction: t });
                await Pago.destroy({ where: { fiado_id: { [Op.in]: fiadosIds } }, transaction: t });
            }
            await Pago.destroy({ where: { tienda_id: { [Op.in]: tiendaIds } }, transaction: t });
            await Fiado.destroy({ where: { tienda_id: { [Op.in]: tiendaIds } }, transaction: t });
            await Alerta.destroy({ where: { tienda_id: { [Op.in]: tiendaIds } }, transaction: t });
            await ScoringHistorial.destroy({ where: { tienda_id: { [Op.in]: tiendaIds } }, transaction: t });
            await LogSistema.destroy({ where: { tienda_id: { [Op.in]: tiendaIds } }, transaction: t });
            await ClienteTienda.destroy({ where: { tienda_id: { [Op.in]: tiendaIds } }, transaction: t });
            await Producto.destroy({ where: { tienda_id: { [Op.in]: tiendaIds } }, transaction: t });
            await Categoria.destroy({ where: { tienda_id: { [Op.in]: tiendaIds } }, transaction: t });
            await Tienda.destroy({ where: { id: { [Op.in]: tiendaIds } }, transaction: t });
        }

        const fiadosResiduales = await Fiado.findAll({ where: { tendero_id: id }, attributes: ['id'], transaction: t });
        const fiadosResidualesIds = fiadosResiduales.map(f => f.id);
        if (fiadosResidualesIds.length > 0) {
            await FiadoDetalle.destroy({ where: { fiado_id: { [Op.in]: fiadosResidualesIds } }, transaction: t });
            await Pago.destroy({ where: { fiado_id: { [Op.in]: fiadosResidualesIds } }, transaction: t });
        }
        await Pago.destroy({ where: { registrado_por: id }, transaction: t });
        await Fiado.destroy({ where: { tendero_id: id }, transaction: t });

        await tendero.destroy({ transaction: t });

        await t.commit();
        return res.status(200).json({ msg: 'Tendero eliminado exitosamente', id });
    } catch (error) {
        await t.rollback();
        console.error('Error al eliminar tendero:', error);
        return res.status(500).json({ error: 'Error interno al eliminar el tendero.' });
    }
};

// OBTENER PERFIL DEL TENDERO
exports.getPerfil = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;

        const tendero = await Tendero.findOne({
            where: { id: tenderoId, activo: true },
            attributes: { exclude: ['password_hash'] },
            include: [
                {
                    model: Tienda,
                    as: 'tiendas',
                    where: { activo: true },
                    required: false
                }
            ]
        });

        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        return res.status(200).json({
            msg: 'Perfil del tendero',
            tendero
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        return res.status(500).json({ error: 'Error interno al obtener el perfil.' });
    }
};

// SUBIR FOTO DE PERFIL
exports.subirFotoPerfil = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
        }

        const tendero = await Tendero.findOne({
            where: { id: req.usuario.id, activo: true }
        });

        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        const url = await subirImagen(req.file, 'fiamas_app/tenderos');
        await tendero.update({ foto_perfil_url: url, actualizado_en: new Date() });

        return res.status(200).json({
            msg: 'Foto de perfil actualizada',
            foto_perfil_url: url
        });
    } catch (error) {
        console.error('Error al subir foto de perfil:', error);
        return res.status(500).json({ error: 'Error interno al subir la foto.' });
    }
};

// ACTUALIZAR PERFIL DEL TENDERO
exports.actualizarPerfil = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { nombres, apellidos, telefono, foto_perfil_url } = req.body;

        const tendero = await Tendero.findOne({ where: { id: tenderoId, activo: true } });
        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        if (telefono && telefono !== tendero.telefono) {
            const existente = await Tendero.findOne({ where: { telefono, activo: true, id: { [Op.ne]: tenderoId } } });
            if (existente) {
                return res.status(400).json({ error: 'El teléfono ya está en uso por otro tendero.' });
            }
        }

        const datosActualizacion = {};
        if (nombres !== undefined) datosActualizacion.nombres = nombres.trim();
        if (apellidos !== undefined) datosActualizacion.apellidos = apellidos.trim();
        if (telefono !== undefined) datosActualizacion.telefono = String(telefono).trim();
        if (foto_perfil_url !== undefined) datosActualizacion.foto_perfil_url = foto_perfil_url;
        datosActualizacion.actualizado_en = new Date();

        await tendero.update(datosActualizacion);

        return res.status(200).json({
            msg: 'Perfil actualizado exitosamente',
            tendero: {
                id: tendero.id,
                dni: tendero.dni,
                nombres: tendero.nombres,
                apellidos: tendero.apellidos,
                telefono: tendero.telefono,
                foto_perfil_url: tendero.foto_perfil_url
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        return res.status(500).json({ error: 'Error interno al actualizar el perfil.' });
    }
};

// CAMBIAR CONTRASEÑA
exports.cambiarPassword = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { password_actual, password_nuevo } = req.body;

        if (!password_actual || !password_nuevo) {
            return res.status(400).json({ error: 'Se requiere la contraseña actual y la nueva.' });
        }

        if (password_nuevo.length > 6 || password_nuevo.length < 4) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener entre 4 y 6 caracteres.' });
        }

        const tendero = await Tendero.findOne({ where: { id: tenderoId, activo: true } });
        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        const esValida = await tendero.validarPassword(password_actual);
        if (!esValida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }

        await tendero.update({
            password_hash: password_nuevo,
            actualizado_en: new Date()
        });

        if (tendero.telefono) {
            try {
                const clienteVinculado = await Cliente.findOne({ where: { telefono: tendero.telefono, activo: true } });
                if (clienteVinculado) {
                    await clienteVinculado.update({
                        password_hash: password_nuevo,
                        actualizado_en: new Date()
                    });
                }
            } catch (_) { }
        }

        return res.status(200).json({ msg: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return res.status(500).json({ error: 'Error interno al cambiar la contraseña.' });
    }
};

// OBTENER ESTADÍSTICAS DEL TENDERO
exports.getEstadisticas = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;

        const tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        const [totalFiados, totalClientes, totalProductos, alertasPendientes] = await Promise.all([
            Fiado.count({
                where: { tienda_id: tienda.id, estado: { [Op.in]: ['pendiente', 'parcial'] } }
            }),
            ClienteTienda.count({
                where: { tienda_id: tienda.id, activo: true }
            }),
            Producto.count({
                where: { tienda_id: tienda.id, activo: true }
            }),
            Alerta.count({
                where: { tienda_id: tienda.id, estado: 'pendiente' }
            })
        ]);

        return res.status(200).json({
            msg: 'Estadísticas del tendero',
            estadisticas: {
                tienda_id: tienda.id,
                tienda_nombre: tienda.nombre,
                total_fiados_activos: totalFiados,
                total_clientes: totalClientes,
                total_productos: totalProductos,
                alertas_pendientes: alertasPendientes
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return res.status(500).json({ error: 'Error interno al obtener estadísticas.' });
    }
};