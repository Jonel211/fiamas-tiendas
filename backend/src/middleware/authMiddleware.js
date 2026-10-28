const jwt = require('jsonwebtoken');
const { Tienda } = require('../models');

// Sin valor por defecto: si falta la variable, el servidor no arranca.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Falta la variable de entorno JWT_SECRET.');
}

// 1. Verifica que el token sea válido y extrae los datos
exports.verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// 2. Verifica que el rol del usuario esté permitido en la ruta
exports.verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                error: `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
            });
        }
        next();
    };
};

// 3. Verifica que la tienda pedida pertenezca al usuario (multi-tienda).
//    Consulta la base de datos (no el tienda_id del token, que es una sola
//    tienda) y deja la tienda en req.tienda para el controlador.
exports.verificarPropiedadTienda = async (req, res, next) => {
    try {
        if (!req.usuario) {
            return res.status(401).json({ error: 'Autenticación requerida.' });
        }

        const tiendaId = req.params.tienda_id || req.query.tienda_id || req.body?.tienda_id;
        if (!tiendaId) {
            return res.status(400).json({ error: 'El tienda_id es obligatorio.' });
        }

        const where = req.usuario.rol === 'admin'
            ? { id: tiendaId }
            : { id: tiendaId, tendero_id: req.usuario.id, activo: true };

        let tienda;
        try {
            tienda = await Tienda.findOne({ where });
        } catch (error) {
            if (error.name === 'SequelizeDatabaseError') {
                return res.status(400).json({ error: 'El tienda_id no es válido.' });
            }
            throw error;
        }

        if (!tienda) {
            return res.status(403).json({ error: 'No tienes permiso para acceder a esta tienda.' });
        }

        req.tienda = tienda;
        next();
    } catch (error) {
        next(error);
    }
};