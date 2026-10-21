const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');
const soloAdmin = [verificarToken, verificarRol(['admin'])];

// GET /api/backups - Historial de backups
router.get('/', soloAdmin, backupController.getBackups);

// GET /api/backups/stats - Estadísticas de backup
router.get('/stats', soloAdmin, backupController.getBackupStats);

// POST /api/backups/generar - Generar backup manual
router.post('/generar', soloAdmin, backupController.generarBackup);

// GET /api/backups/download/:filename - Descargar archivo de backup
router.get('/download/:filename', soloAdmin, backupController.descargarBackup);

// POST /api/backups/restaurar/:filename - Restaurar copia de seguridad
router.post('/restaurar/:filename', soloAdmin, backupController.restaurarBackup);

// POST /api/backups/importar - Importar copia de seguridad (.json)
router.post('/importar', soloAdmin, backupController.importarBackup);

// DELETE /api/backups/:filename - Eliminar copia de seguridad
router.delete('/:filename', soloAdmin, backupController.eliminarBackup);

module.exports = router;
