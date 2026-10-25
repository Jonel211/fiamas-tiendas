const { Tendero, Tienda, Cliente, Fiado, FiadoDetalle, Pago, ScoringHistorial, LogSistema, ClienteTienda, Producto, Categoria, Alerta, sequelize } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');

// 0. OBTENER TODOS LOS TENDEROS (PANEL ADMIN)
exports.getTenderosAdmin = async (req, res) => {
    try {
        const tenderos = await Tendero.findAll({
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Tienda, as: 'tiendas', attributes: ['id', 'nombre', 'ruc', 'direccion', 'activo', 'qr_activo'] }],
            order: [['creado_en', 'DESC']]
        });
        res.status(200).json({ msg: 'Listado de tenderos obtenido exitosamente', tenderos });
    } catch (error) {
        console.error('Error al obtener tenderos:', error);
        res.status(500).json({ error: 'Error interno al obtener los tenderos.' });
    }
};

// 0.1 CREAR TENDERO (PANEL ADMIN)
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
            return res.status(400).json({ error: 'El teléfono debe tener exactamente 9 dígitos numéricos (ej. 987654321).' });
        }

        const [existeDni, existeTel] = await Promise.all([
            Tendero.findOne({ where: { dni: dniLimpio } }),
            Tendero.findOne({ where: { telefono: telLimpio } })
        ]);
        if (existeDni) return res.status(400).json({ error: 'Ya existe un tendero registrado con ese DNI.' });
        if (existeTel) return res.status(400).json({ error: 'Ya existe un tendero registrado con ese número de teléfono.' });

        const nuevoTendero = await Tendero.create({
            dni: dniLimpio,
            nombres,
            apellidos,
            telefono: telLimpio,
            foto_perfil_url: foto_perfil_url || null,
            password_hash: password,
            activo: activo !== undefined ? activo : true
        });

        // Crear tienda asociada si se especificó o por defecto
        const nuevaTienda = await Tienda.create({
            tendero_id: nuevoTendero.id,
            nombre: nombre_tienda || `Tienda de ${nombres}`,
            telefono: telLimpio,
            qr_token: crypto.randomUUID(),
            qr_activo: true,
            activo: true
        });

        const tenderoConTiendas = await Tendero.findByPk(nuevoTendero.id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Tienda, as: 'tiendas' }]
        });

        res.status(201).json({
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
        res.status(500).json({ error: error.message || 'Error interno al registrar el tendero.' });
    }
};

// 0.2 ACTUALIZAR TENDERO POR ID (PANEL ADMIN)
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
        if (dni !== undefined) datosActualizacion.dni = dni;
        if (nombres !== undefined) datosActualizacion.nombres = nombres;
        if (apellidos !== undefined) datosActualizacion.apellidos = apellidos;
        if (telefono !== undefined) datosActualizacion.telefono = telefono;
        if (activo !== undefined) datosActualizacion.activo = activo;
        if (foto_perfil_url !== undefined) datosActualizacion.foto_perfil_url = foto_perfil_url;
        if (password && password.trim() !== '') {
            datosActualizacion.password_hash = password;
        }
        datosActualizacion.actualizado_en = new Date();

        await tendero.update(datosActualizacion);

        const tenderoActualizado = await Tendero.findByPk(id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Tienda, as: 'tiendas' }]
        });

        res.status(200).json({
            msg: 'Tendero actualizado exitosamente',
            tendero: tenderoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar tendero:', error);
        res.status(500).json({ error: 'Error interno al actualizar el tendero.' });
    }
};

// 0.3 ALTERNAR ESTADO ACTIVO TENDERO (PANEL ADMIN)
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

        res.status(200).json({
            msg: `Tendero ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
            activo: nuevoEstado
        });
    } catch (error) {
        console.error('Error al cambiar estado del tendero:', error);
        res.status(500).json({ error: 'Error interno al cambiar estado del tendero.' });
    }
};

// 0.4 ELIMINAR TENDERO (PANEL ADMIN)
exports.eliminarTenderoAdmin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { id } = req.params;
        const tendero = await Tendero.findByPk(id);

        if (!tendero) {
            await t.rollback();
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        // Buscar todas las tiendas asociadas al tendero
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

        // Limpiar cualquier fiado o pago residual registrado por este tendero
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
        res.status(200).json({ msg: 'Tendero eliminado exitosamente', id });
    } catch (error) {
        await t.rollback();
        console.error('Error al eliminar tendero:', error);
        res.status(500).json({ error: 'Error interno al eliminar el tendero.' });
    }
};

// 1. OBTENER PERFIL DEL TENDERO
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

        res.status(200).json({
            msg: 'Perfil del tendero',
            tendero
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ error: 'Error interno al obtener el perfil.' });
    }
};

// 2. ACTUALIZAR PERFIL DEL TENDERO
// Según el esquema de la BD (scripts/base-datos.md), los campos editables son nombres, apellidos y teléfono.
exports.actualizarPerfil = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { nombres, apellidos, telefono, foto_perfil_url } = req.body;

        const tendero = await Tendero.findOne({ where: { id: tenderoId, activo: true } });
        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        // Si cambia el teléfono, verificar que no exista en otro tendero
        if (telefono && telefono !== tendero.telefono) {
            const existente = await Tendero.findOne({ where: { telefono, activo: true, id: { [Op.ne]: tenderoId } } });
            if (existente) {
                return res.status(400).json({ error: 'El teléfono ya está en uso por otro tendero.' });
            }
        }

        const datosActualizacion = {};
        if (nombres !== undefined) datosActualizacion.nombres = nombres;
        if (apellidos !== undefined) datosActualizacion.apellidos = apellidos;
        if (telefono !== undefined) datosActualizacion.telefono = telefono;
        if (foto_perfil_url !== undefined) datosActualizacion.foto_perfil_url = foto_perfil_url;
        datosActualizacion.actualizado_en = new Date();

        await tendero.update(datosActualizacion);

        res.status(200).json({
            msg: 'Perfil actualizado exitosamente',
            tendero: {
                id: tendero.id,
                dni: tendero.dni,
                nombres: tendero.nombres,
                apellidos: tendero.apellidos,
                telefono: tendero.telefono
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno al actualizar el perfil.' });
    }
};

// 3. CAMBIAR CONTRASEÑA
exports.cambiarPassword = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { password_actual, password_nuevo } = req.body;

        if (!password_actual || !password_nuevo) {
            return res.status(400).json({ error: 'Se requiere la contraseña actual y la nueva.' });
        }

        const tendero = await Tendero.findOne({ where: { id: tenderoId, activo: true } });
        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        // Validar password actual
        const esValida = await tendero.validarPassword(password_actual);
        if (!esValida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // Actualizar password (el hook del modelo lo encriptará con bcrypt)
        await tendero.update({
            password_hash: password_nuevo,
            actualizado_en: new Date()
        });

        // Sincronizar contraseña con cuenta cliente vinculada al mismo teléfono (si existe)
        if (tendero.telefono) {
            try {
                const clienteVinculado = await Cliente.findOne({ where: { telefono: tendero.telefono, activo: true } });
                if (clienteVinculado) {
                    await clienteVinculado.update({
                        password_hash: password_nuevo,
                        actualizado_en: new Date()
                    });
                }
            } catch (_) {}
        }

        res.status(200).json({ msg: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error interno al cambiar la contraseña.' });
    }
};

// 4. OBTENER ESTADÍSTICAS DEL TENDERO
exports.getEstadisticas = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;

        // Obtener la tienda del tendero
        const tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        // Contar fiados activos
        const totalFiados = await Fiado.count({
            where: { tienda_id: tienda.id, estado: { [Op.in]: ['pendiente', 'parcial'] } }
        });

        // Contar clientes vinculados
        const totalClientes = await ClienteTienda.count({
            where: { tienda_id: tienda.id, activo: true }
        });

        // Contar productos activos
        const totalProductos = await Producto.count({
            where: { tienda_id: tienda.id, activo: true }
        });

        // Contar alertas pendientes
        const alertasPendientes = await Alerta.count({
            where: { tienda_id: tienda.id, estado: 'pendiente' }
        });

        res.status(200).json({
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
        res.status(500).json({ error: 'Error interno al obtener estadísticas.' });
    }
};