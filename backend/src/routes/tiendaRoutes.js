const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// 0. OBTENER TODAS LAS TIENDAS (PANEL ADMIN)
router.get('/', verificarToken, verificarRol(['admin']), tiendaController.getTiendasAdmin);

// 1. OBTENER DATOS DE UNA TIENDA (TENDERO LOGUEADO)  ?tienda_id=xxx (opcional)
router.get('/mi-tienda', verificarToken, verificarRol(['tendero']), tiendaController.getTienda);

// 6. OBTENER TODAS LAS TIENDAS DEL TENDERO
router.get('/mis-tiendas', verificarToken, verificarRol(['tendero']), tiendaController.getMisTiendas);

// 2. CREAR TIENDA (ADMIN O TENDERO)
router.post('/', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.crearTiendaAdmin);

// 3. GENERAR/REGENERAR CÓDIGO QR  (el :id ahora es obligatorio en el controlador)
router.post('/generar-qr/:id?', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.generarQR);

// 4. ACTIVAR/DESACTIVAR CÓDIGO QR
router.put('/toggle-qr/:id?', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.toggleQR);

// 5. ACTIVAR/DESACTIVAR TIENDA (ADMIN)
router.put('/toggle-activo/:id', verificarToken, verificarRol(['admin']), tiendaController.toggleActivoTienda);

// 7. RESUMEN/DASHBOARD DE LA TIENDA  ?tienda_id=xxx (obligatorio)
router.get('/resumen', verificarToken, verificarRol(['tendero']), tiendaController.getResumenTienda);

// 7.1 SUBIR LOGO DE LA TIENDA (campo multipart: "foto")
router.patch(
    '/:id/logo',
    verificarToken,
    verificarRol(['tendero']),
    upload.imagen('foto'),
    tiendaController.subirLogo
);

// 8. ACTUALIZAR TIENDA - debe ir DESPUÉS de las rutas específicas
router.put('/:id?', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.actualizarTienda);

// 9. ELIMINAR TIENDA (ADMIN O TENDERO)
router.delete('/:id', verificarToken, verificarRol(['admin', 'tendero']), tiendaController.eliminarTiendaAdmin);

module.exports = router;