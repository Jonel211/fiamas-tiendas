const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const { verificarToken } = require('../middleware/authMiddleware');

// GET /api/backups - Historial de backups
router.get('/', verificarToken, backupController.getBackups);

// GET /api/backups/stats - Estadísticas de backup
router.get('/stats', verificarToken, backupController.getBackupStats);

// POST /api/backups/generar - Generar backup manual
router.post('/generar', verificarToken, backupController.generarBackup);

// GET /api/backups/download/:filename - Descargar archivo de backup
router.get('/download/:filename', verificarToken, backupController.descargarBackup);

// POST /api/backups/restaurar/:filename - Restaurar copia de seguridad
router.post('/restaurar/:filename', verificarToken, backupController.restaurarBackup);

// POST /api/backups/importar - Importar copia de seguridad (.json)
router.post('/importar', verificarToken, backupController.importarBackup);

// DELETE /api/backups/:filename - Eliminar copia de seguridad
router.delete('/:filename', verificarToken, backupController.eliminarBackup);

module.exports = router;
