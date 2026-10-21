const { Alerta, Tendero, Administrador } = require('../models');
const { Op } = require('sequelize');

// Canales válidos estrictamente permitidos
const CANALES_PERMITIDOS = ['whatsapp', 'sms', 'aplicacion'];

// 1. OBTENER AVISOS (HISTORIAL)
exports.getAvisos = async (req, res) => {
    try {
        const { buscar, prioridad, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {
            emisor_tipo: 'admin',
            tipo_alerta: 'aviso_admin'
        };

        if (prioridad && prioridad !== 'todos') {
            where.prioridad = prioridad;
        }

        if (buscar) {
            where[Op.or] = [
                { titulo: { [Op.iLike]: `%${buscar}%` } },
                { mensaje: { [Op.iLike]: `%${buscar}%` } }
            ];
        }

        const { count, rows } = await Alerta.findAndCountAll({
            where,
            include: [{
                model: Tendero,
                as: 'destinatarioTendero',
                attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono'],
                required: false
            }],
            order: [['fecha_creacion', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        // Tenderos activos, una sola vez, para calcular quién leyó cada difusión
        const tenderosActivos = await Tendero.findAll({
            where: { activo: true },
            attributes: ['id', 'nombres', 'apellidos']
        });

        const avisos = rows.map(a => {
            const rawChannels = a.canal ? a.canal.split(',') : ['aplicacion'];
            // Filtrar únicamente los canales permitidos
            const channels = rawChannels.filter(c => CANALES_PERMITIDOS.includes(c));

            const destinatarioLabel = a.destinatario_tipo === 'todos' || !a.destinatario_id
                ? 'Todos los tenderos'
                : (a.destinatarioTendero
                    ? `${a.destinatarioTendero.nombres} ${a.destinatarioTendero.apellidos}`
                    : 'Tendero específico');

            // Lecturas: difusión (leida_por) o aviso dirigido (estado)
            let lecturas;
            if (a.destinatario_tipo === 'todos') {
                const leyeron = tenderosActivos.filter(t => (a.leida_por || []).includes(t.id));
                lecturas = {
                    leidos: leyeron.length,
                    total: tenderosActivos.length,
                    tenderos: leyeron.map(t => `${t.nombres} ${t.apellidos}`)
                };
            } else {
                lecturas = {
                    leidos: a.estado === 'leida' ? 1 : 0,
                    total: 1,
                    tenderos: a.estado === 'leida' && a.destinatarioTendero
                        ? [`${a.destinatarioTendero.nombres} ${a.destinatarioTendero.apellidos}`]
                        : []
                };
            }

            return {
                id: a.id,
                titulo: a.titulo,
                message: a.mensaje,
                priority: a.prioridad,
                channels: channels.length > 0 ? channels : ['aplicacion'],
                destinatario: {
                    tipo: a.destinatario_tipo || 'todos',
                    id: a.destinatario_id,
                    label: destinatarioLabel,
                    dni: a.destinatarioTendero?.dni || null,
                    telefono: a.destinatarioTendero?.telefono || null
                },
                date: new Date(a.fecha_creacion).toLocaleString('es-PE', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                }),
                estado: a.estado,
                lecturas
            };
        });

        res.json({
            avisos,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit)) || 1
        });
    } catch (error) {
        console.error('Error al obtener avisos:', error);
        res.status(500).json({ error: 'Error interno al obtener los avisos.' });
    }
};

// 2. CREAR AVISO
exports.crearAviso = async (req, res) => {
    try {
        const adminId = req.usuario?.id;
        const { titulo, mensaje, prioridad = 'media', canales = ['aplicacion'], tendero_id } = req.body;

        if (!titulo || !titulo.trim()) {
            return res.status(400).json({ error: 'El título del aviso es obligatorio.' });
        }
        if (!mensaje || !mensaje.trim()) {
            return res.status(400).json({ error: 'El mensaje del aviso es obligatorio.' });
        }
        if (mensaje.trim().length < 5) {
            return res.status(400).json({ error: 'El mensaje debe tener al menos 5 caracteres.' });
        }
        if (!['baja', 'media', 'alta', 'urgente'].includes(prioridad)) {
            return res.status(400).json({ error: 'La prioridad especificada no es válida.' });
        }

        // Validar canales permitidos
        const canalesArray = Array.isArray(canales) ? canales : [canales];
        const canalesValidos = canalesArray.filter(c => CANALES_PERMITIDOS.includes(c));

        if (canalesValidos.length === 0) {
            return res.status(400).json({ error: 'Debes seleccionar al menos un canal válido (WhatsApp, SMS o Aplicación).' });
        }

        // Determinar destinatario
        const esParaTodos = !tendero_id || tendero_id === 'todos';
        let destinatarioTendero = null;

        if (!esParaTodos) {
            destinatarioTendero = await Tendero.findByPk(tendero_id, {
                attributes: ['id', 'nombres', 'apellidos', 'dni', 'telefono']
            });
            if (!destinatarioTendero) {
                return res.status(404).json({ error: 'El tendero seleccionado no existe.' });
            }
        }

        const isUuid = typeof adminId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(adminId);

        const aviso = await Alerta.create({
            emisor_tipo: 'admin',
            emisor_id: isUuid ? adminId : null,
            destinatario_tipo: esParaTodos ? 'todos' : 'tendero',
            destinatario_id: esParaTodos ? null : tendero_id,
            tipo_alerta: 'aviso_admin',
            prioridad,
            titulo: titulo.trim(),
            mensaje: mensaje.trim(),
            canal: canalesValidos.join(','),
            estado: 'pendiente'
        });

        res.status(201).json({
            msg: 'Aviso emitido correctamente.',
            aviso: {
                id: aviso.id,
                titulo: aviso.titulo,
                message: aviso.mensaje,
                priority: aviso.prioridad,
                channels: canalesValidos,
                destinatario: {
                    tipo: esParaTodos ? 'todos' : 'tendero',
                    id: esParaTodos ? null : tendero_id,
                    label: esParaTodos ? 'Todos los tenderos' : `${destinatarioTendero.nombres} ${destinatarioTendero.apellidos}`,
                    dni: destinatarioTendero?.dni || null,
                    telefono: destinatarioTendero?.telefono || null
                },
                date: new Date(aviso.fecha_creacion).toLocaleString('es-PE', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit'
                }),
                estado: aviso.estado,
                lecturas: {
                    leidos: 0,
                    total: esParaTodos ? await Tendero.count({ where: { activo: true } }) : 1,
                    tenderos: []
                }
            }
        });
    } catch (error) {
        console.error('Error al crear aviso:', error);
        res.status(500).json({ error: 'Error interno al crear el aviso.' });
    }
};

// 3. ELIMINAR AVISO
exports.eliminarAviso = async (req, res) => {
    try {
        const { id } = req.params;
        const aviso = await Alerta.findByPk(id);
        if (!aviso) return res.status(404).json({ error: 'Aviso no encontrado.' });

        await aviso.destroy();
        res.json({ msg: 'Aviso eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar aviso:', error);
        res.status(500).json({ error: 'Error interno al eliminar el aviso.' });
    }
};