const { Tendero, Tienda, Fiado, ClienteTienda, Producto, Alerta } = require('../models');
const { Op } = require('sequelize');

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