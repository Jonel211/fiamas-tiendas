const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// 0. OBTENER TODAS LAS TIENDAS (PANEL ADMIN)
router.get('/', verificarToken, verificarRol(['admin']), tiendaController.getTiendasAdmin);

// 1. OBTENER DATOS DE UNA TIENDA (TENDERO LOGUEADO)
router.get('/mi-tienda', verificarToken, verificarRol(['tendero']), tiendaController.getTienda);

//  6. OBTENER TODAS LAS TIENDAS DEL TENDERO (NUEVO ENDPOINT)
router.get('/mis-tiendas', verificarToken, verificarRol(['tendero']), tiendaController.getMisTiendas);

// 2. CREAR TIENDA (ADMIN O TENDERO)
router.post('/', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.crearTiendaAdmin);

// 3. GENERAR/REGENERAR CÓDIGO QR
router.post('/generar-qr/:id?', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.generarQR);

// 4. ACTIVAR/DESACTIVAR CÓDIGO QR
router.put('/toggle-qr/:id?', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.toggleQR);

// 5. ACTIVAR/DESACTIVAR TIENDA (ADMIN)
router.put('/toggle-activo/:id', verificarToken, verificarRol(['admin']), tiendaController.toggleActivoTienda);

// 7. OBTENER RESUMEN/DASHBOARD DE LA TIENDA
router.get('/resumen', verificarToken, verificarRol(['tendero']), tiendaController.getResumenTienda);

// 8. ACTUALIZAR DATOS DE LA TIENDA (ADMIN O TENDERO) - Debe ir DESPUÉS de las rutas específicas
router.put('/:id?', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.actualizarTienda);

// 9. ELIMINAR TIENDA (ADMIN O TENDERO)
router.delete('/:id', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.eliminarTiendaAdmin);

module.exports = router;