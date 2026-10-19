const {
    LogSistema, Tendero, Tienda, Administrador,
    Producto, Categoria, Cliente, Fiado, Pago, Alerta, sequelize
} = require('../models');
const path = require('path');
const fs = require('fs');

// Directorio de almacenamiento de backups
const BACKUP_DIR = path.join(__dirname, '../../backups');
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Helper: Formato legible para tamaños en bytes
const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper: Formatear fechas relativas
const formatRelativeDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.floor((now.setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0)) / 86400000);

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
};

// 1. OBTENER HISTORIAL DE BACKUPS REALES
exports.getBackups = async (req, res) => {
    try {
        const { buscar, page = 1, limit = 10 } = req.query;

        // Leer archivos reales de la carpeta de backups
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.json') || f.endsWith('.sql'));

        let backupItems = files.map(filename => {
            const filePath = path.join(BACKUP_DIR, filename);
            const stats = fs.statSync(filePath);
            const date = stats.mtime;

            return {
                id: filename,
                filename,
                date: date.toISOString(),
                dateLabel: formatRelativeDate(date),
                time: date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                size: formatBytes(stats.size),
                sizeBytes: stats.size,
                status: 'success',
                type: filename.includes('auto') ? 'Automático' : 'Manual',
                user: 'Admin',
                description: `Copia de seguridad del sistema (${formatBytes(stats.size)})`
            };
        });

        // Ordenar por fecha descendente
        backupItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Filtro por texto si se especifica
        if (buscar) {
            const query = buscar.toLowerCase();
            backupItems = backupItems.filter(b =>
                b.filename.toLowerCase().includes(query) ||
                b.description.toLowerCase().includes(query) ||
                b.type.toLowerCase().includes(query)
            );
        }

        const total = backupItems.length;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const paginated = backupItems.slice(offset, offset + parseInt(limit));

        res.json({
            backups: paginated,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)) || 1
        });
    } catch (error) {
        console.error('Error al obtener backups:', error);
        res.status(500).json({ error: 'Error al listar los backups del sistema.' });
    }
};

// 2. OBTENER ESTADÍSTICAS REALES DE BACKUPS
exports.getBackupStats = async (req, res) => {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.endsWith('.json') || f.endsWith('.sql'));

        let totalSize = 0;
        let latestDate = null;

        files.forEach(filename => {
            const filePath = path.join(BACKUP_DIR, filename);
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
            if (!latestDate || stats.mtime > latestDate) {
                latestDate = stats.mtime;
            }
        });

        res.json({
            totalBackups: files.length,
            failedThisMonth: 0,
            lastSuccess: latestDate
                ? new Date(latestDate).toLocaleString('es-PE', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                })
                : 'Ninguno registrado',
            storageUsed: formatBytes(totalSize)
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de backup:', error);
        res.status(500).json({ error: 'Error al calcular estadísticas de backup.' });
    }
};

// 3. GENERAR BACKUP MANUAL REAL CON DATOS DE LA BASE DE DATOS
exports.generarBackup = async (req, res) => {
    try {
        const adminId = req.usuario?.id;
        const now = new Date();

        // Extraer datos reales de todas las tablas principales
        const [
            tiendas,
            tenderos,
            productos,
            categorias,
            clientes,
            alertas,
            logs
        ] = await Promise.all([
            Tienda.findAll({ raw: true }).catch(() => []),
            Tendero.findAll({
                attributes: { exclude: ['password'] },
                raw: true
            }).catch(() => []),
            Producto.findAll({ raw: true }).catch(() => []),
            Categoria.findAll({ raw: true }).catch(() => []),
            Cliente.findAll({ raw: true }).catch(() => []),
            Alerta.findAll({ raw: true }).catch(() => []),
            LogSistema.findAll({ limit: 100, order: [['fecha', 'DESC']], raw: true }).catch(() => [])
        ]);

        const backupData = {
            metadata: {
                version: '1.0.0',
                generado_en: now.toISOString(),
                generado_por: adminId || 'admin',
                total_tablas: 7,
                conteos: {
                    tiendas: tiendas.length,
                    tenderos: tenderos.length,
                    productos: productos.length,
                    categorias: categorias.length,
                    clientes: clientes.length,
                    alertas: alertas.length,
                    logs: logs.length
                }
            },
            data: {
                tiendas,
                tenderos,
                productos,
                categorias,
                clientes,
                alertas,
                logs
            }
        };

        // Formato de nombre de archivo limpio y seguro
        const timestampStr = now.toISOString().replace(/[:.]/g, '-');
        const filename = `backup_fiamas_${timestampStr}.json`;
        const filePath = path.join(BACKUP_DIR, filename);

        // Guardar archivo físico en el servidor
        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
        const fileStats = fs.statSync(filePath);

        // Validar si adminId es un UUID válido para PostgreSQL
        const isUuid = typeof adminId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(adminId);

        // Registrar auditoría en logs
        await LogSistema.create({
            usuario_id: isUuid ? adminId : null,
            tipo_usuario: 'admin',
            accion: 'backup_manual_generado',
            tabla_afectada: 'backup',
            descripcion: `Copia de seguridad ${filename} generada con éxito (${formatBytes(fileStats.size)}).`
        }).catch(err => console.error('No se pudo registrar log de backup:', err));

        res.status(201).json({
            msg: 'Copia de seguridad generada y almacenada con éxito.',
            backup: {
                id: filename,
                filename,
                date: now.toISOString(),
                dateLabel: 'Hoy',
                time: now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                size: formatBytes(fileStats.size),
                sizeBytes: fileStats.size,
                status: 'success',
                type: 'Manual',
                user: 'Admin',
                description: `Copia con ${tiendas.length} tiendas y ${tenderos.length} tenderos.`
            }
        });
    } catch (error) {
        console.error('Error al generar backup real:', error);
        res.status(500).json({ error: 'Error interno al generar la copia de seguridad.' });
    }
};

// 4. DESCARGAR ARCHIVO DE BACKUP REAL
exports.descargarBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        const safeFilename = path.basename(filename);
        const filePath = path.join(BACKUP_DIR, safeFilename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'El archivo de copia de seguridad no existe.' });
        }

        res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
        res.setHeader('Content-Type', 'application/json');
        res.download(filePath, safeFilename);
    } catch (error) {
        console.error('Error al descargar backup:', error);
        res.status(500).json({ error: 'Error al procesar la descarga del backup.' });
    }
};

// 5. ELIMINAR ARCHIVO DE BACKUP
exports.eliminarBackup = async (req, res) => {
    try {
        const { filename } = req.params;
        const safeFilename = path.basename(filename);
        const filePath = path.join(BACKUP_DIR, safeFilename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'El archivo de copia de seguridad no existe.' });
        }

        fs.unlinkSync(filePath);

        // Registrar auditoría
        const adminId = req.usuario?.id;
        const isUuid = typeof adminId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(adminId);

        await LogSistema.create({
            usuario_id: isUuid ? adminId : null,
            tipo_usuario: 'admin',
            accion: 'backup_eliminado',
            tabla_afectada: 'backup',
            descripcion: `Copia de seguridad ${safeFilename} eliminada del servidor.`
        }).catch(err => console.error('No se pudo registrar log de eliminación:', err));

        res.json({ msg: 'Copia de seguridad eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar backup:', error);
        res.status(500).json({ error: 'Error al eliminar el archivo de copia de seguridad.' });
    }
};

// 6. RESTAURAR COPIA DE SEGURIDAD
exports.restaurarBackup = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { filename } = req.params;
        const safeFilename = path.basename(filename);
        const filePath = path.join(BACKUP_DIR, safeFilename);

        if (!fs.existsSync(filePath)) {
            await t.rollback();
            return res.status(404).json({ error: 'El archivo de copia de seguridad no existe.' });
        }

        const raw = fs.readFileSync(filePath, 'utf8');
        const backupJson = JSON.parse(raw);

        if (!backupJson.data) {
            await t.rollback();
            return res.status(400).json({ error: 'Estructura de copia de seguridad no válida.' });
        }

        const {
            tenderos = [],
            tiendas = [],
            categorias = [],
            productos = [],
            clientes = []
        } = backupJson.data;

        // 1. Restaurar Categorias
        if (categorias.length > 0) {
            await Categoria.bulkCreate(categorias, {
                updateOnDuplicate: ['nombre', 'descripcion'],
                transaction: t
            });
        }

        // 2. Restaurar Tenderos
        if (tenderos.length > 0) {
            await Tendero.bulkCreate(tenderos, {
                updateOnDuplicate: ['nombres', 'apellidos', 'dni', 'telefono', 'email', 'activo'],
                transaction: t
            });
        }

        // 3. Restaurar Tiendas
        if (tiendas.length > 0) {
            await Tienda.bulkCreate(tiendas, {
                updateOnDuplicate: ['nombre', 'direccion', 'ruc', 'telefono', 'activo', 'tendero_id'],
                transaction: t
            });
        }

        // 4. Restaurar Productos
        if (productos.length > 0) {
            await Producto.bulkCreate(productos, {
                updateOnDuplicate: ['nombre', 'precio_venta', 'precio_compra', 'stock_actual', 'activo'],
                transaction: t
            });
        }

        // 5. Restaurar Clientes
        if (clientes.length > 0) {
            await Cliente.bulkCreate(clientes, {
                updateOnDuplicate: ['nombres', 'apellidos', 'dni', 'telefono'],
                transaction: t
            });
        }

        await t.commit();

        // Registrar auditoría de restauración
        const adminId = req.usuario?.id;
        const isUuid = typeof adminId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(adminId);

        await LogSistema.create({
            usuario_id: isUuid ? adminId : null,
            tipo_usuario: 'admin',
            accion: 'backup_restaurado',
            tabla_afectada: 'backup',
            descripcion: `Restauración ejecutada exitosamente desde ${safeFilename} (${tiendas.length} tiendas, ${tenderos.length} tenderos sincronizados).`
        }).catch(err => console.error('No se pudo registrar log de restauración:', err));

        res.json({
            msg: `Copia de seguridad restaurada correctamente (${tiendas.length} tiendas y ${tenderos.length} tenderos sincronizados).`
        });
    } catch (error) {
        if (!t.finished) await t.rollback();
        console.error('Error al restaurar backup:', error);
        res.status(500).json({ error: 'Error al restaurar la copia de seguridad: ' + error.message });
    }
};

// 7. IMPORTAR ARCHIVO DE BACKUP EXTERNO (.JSON)
exports.importarBackup = async (req, res) => {
    try {
        const { filename, content, restaurarAhora } = req.body;

        if (!filename || !content) {
            return res.status(400).json({ error: 'Debes proporcionar el nombre del archivo y su contenido JSON válido.' });
        }

        // Validar formato del archivo
        if (!filename.toLowerCase().endsWith('.json')) {
            return res.status(400).json({ error: 'Solo se permiten archivos de copia de seguridad con extensión .json.' });
        }

        // Validar estructura básica
        const isCompatible = Boolean(
            content.data ||
            content.tiendas ||
            content.tenderos ||
            content.productos ||
            (content.metadata && content.metadata.total_tablas) ||
            typeof content === 'object'
        );

        if (!isCompatible) {
            return res.status(400).json({ error: 'El archivo JSON no posee una estructura de respaldo compatible con FIAMAS.' });
        }

        // Sanitizar nombre de archivo para evitar path traversal
        const base = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
        const safeFilename = base.startsWith('backup_') ? base : `backup_${Date.now()}_${base}`;
        const filePath = path.join(BACKUP_DIR, safeFilename);

        // Normalizar estructura si los datos vienen en la raíz o en data
        let normalizedContent = content;
        if (!content.data && (content.tiendas || content.tenderos || content.productos || content.categorias || content.clientes)) {
            normalizedContent = {
                metadata: content.metadata || {
                    version: '1.0.0',
                    generado_en: new Date().toISOString(),
                    generado_por: req.usuario?.id || 'admin',
                    total_tablas: 5
                },
                data: {
                    tiendas: content.tiendas || [],
                    tenderos: content.tenderos || [],
                    productos: content.productos || [],
                    categorias: content.categorias || [],
                    clientes: content.clientes || [],
                    alertas: content.alertas || [],
                    logs: content.logs || []
                }
            };
        } else if (!content.data) {
            normalizedContent = {
                metadata: content.metadata || { version: '1.0.0', generado_en: new Date().toISOString() },
                data: content
            };
        }

        // Guardar archivo físico en el servidor
        fs.writeFileSync(filePath, JSON.stringify(normalizedContent, null, 2), 'utf8');
        const fileStats = fs.statSync(filePath);

        // Registrar auditoría de importación
        const adminId = req.usuario?.id;
        const isUuid = typeof adminId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(adminId);

        await LogSistema.create({
            usuario_id: isUuid ? adminId : null,
            tipo_usuario: 'admin',
            accion: 'backup_importado',
            tabla_afectada: 'backup',
            descripcion: `Copia de seguridad ${safeFilename} importada al servidor (${formatBytes(fileStats.size)}).`
        }).catch(err => console.error('No se pudo registrar log de importación:', err));

        // Si el usuario marcó restaurar de inmediato
        if (restaurarAhora) {
            req.params.filename = safeFilename;
            return exports.restaurarBackup(req, res);
        }

        res.status(201).json({
            msg: `Copia de seguridad "${safeFilename}" importada y registrada exitosamente en el servidor.`,
            filename: safeFilename
        });
    } catch (error) {
        console.error('Error al importar backup:', error);
        res.status(500).json({ error: 'Error interno al procesar el archivo de copia de seguridad: ' + error.message });
    }
};

