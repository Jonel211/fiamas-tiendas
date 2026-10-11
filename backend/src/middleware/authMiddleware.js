const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fiamas_default_secret_jwt_key_2026';

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

// 3. Evitar que un tendero acceda o modifique datos de otra tienda
exports.verificarPropiedadTienda = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({ error: 'Autenticación requerida.' });
    }

    // El administrador tiene acceso global
    if (req.usuario.rol === 'admin') return next();

    const tiendaIdSolicitada = req.params.tienda_id || req.body.tienda_id || req.query.tienda_id;

    if (tiendaIdSolicitada && req.usuario.rol === 'tendero' && req.usuario.tienda_id !== tiendaIdSolicitada) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a los datos de esta tienda.' });
    }

    next();
};