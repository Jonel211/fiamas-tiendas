const { Tendero, Tienda, sequelize } = require('../models');

// ==========================================
// 1. OBTENER PERFIL DEL TENDERO
// ==========================================
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

// ==========================================
// 2. ACTUALIZAR PERFIL DEL TENDERO
// ==========================================
exports.actualizarPerfil = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { nombres, apellidos, email, telefono, direccion, foto_url } = req.body;

        const tendero = await Tendero.findOne({ where: { id: tenderoId, activo: true } });
        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        // Si cambia el email, verificar que no exista en otro tendero
        if (email && email !== tendero.email) {
            const existente = await Tendero.findOne({ where: { email, activo: true } });
            if (existente) {
                return res.status(400).json({ error: 'El email ya está en uso por otro tendero.' });
            }
        }

        // Si cambia el teléfono, verificar que no exista en otro tendero
        if (telefono && telefono !== tendero.telefono) {
            const existente = await Tendero.findOne({ where: { telefono, activo: true } });
            if (existente) {
                return res.status(400).json({ error: 'El teléfono ya está en uso por otro tendero.' });
            }
        }

        const datosActualizacion = {};
        if (nombres !== undefined) datosActualizacion.nombres = nombres;
        if (apellidos !== undefined) datosActualizacion.apellidos = apellidos;
        if (email !== undefined) datosActualizacion.email = email;
        if (telefono !== undefined) datosActualizacion.telefono = telefono;
        if (direccion !== undefined) datosActualizacion.direccion = direccion;
        if (foto_url !== undefined) datosActualizacion.foto_url = foto_url;
        datosActualizacion.actualizado_en = new Date();

        await tendero.update(datosActualizacion);

        res.status(200).json({
            msg: 'Perfil actualizado exitosamente',
            tendero: {
                id: tendero.id,
                dni: tendero.dni,
                nombres: tendero.nombres,
                apellidos: tendero.apellidos,
                email: tendero.email,
                telefono: tendero.telefono
            }
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: 'Error interno al actualizar el perfil.' });
    }
};

// ==========================================
// 3. CAMBIAR CONTRASEÑA
// ==========================================
exports.cambiarPassword = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;
        const { password_actual, password_nuevo } = req.body;

        const tendero = await Tendero.findOne({ where: { id: tenderoId, activo: true } });
        if (!tendero) {
            return res.status(404).json({ error: 'Tendero no encontrado.' });
        }

        // Validar password actual
        const esValida = await tendero.validarPassword(password_actual);
        if (!esValida) {
            return res.status(400).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // Actualizar password (el hook del modelo lo encriptará)
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

// ==========================================
// 4. OBTENER ESTADÍSTICAS DEL TENDERO
// ==========================================
exports.getEstadisticas = async (req, res) => {
    try {
        const tenderoId = req.usuario.id;

        // Obtener la tienda del tendero
        const tienda = await Tienda.findOne({ where: { tendero_id: tenderoId, activo: true } });
        if (!tienda) {
            return res.status(404).json({ error: 'No se encontró una tienda activa para este tendero.' });
        }

        const { Fiado, ClienteTienda, Producto, Alerta } = require('../models');

        // Contar fiados activos
        const totalFiados = await Fiado.count({
            where: { tienda_id: tienda.id, estado: { [require('sequelize').Op.in]: ['pendiente', 'parcial'] } }
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