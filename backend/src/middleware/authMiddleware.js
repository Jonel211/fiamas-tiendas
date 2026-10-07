const jwt = require('jsonwebtoken');

// 1. Verifica que el token sea válido y extrae los datos
exports.verificarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_temporal');
        req.usuario = decoded; // { id, nombre, rol, tienda_id (si aplica) }
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

// 3. (NUEVO v6) Evita que un tendero acceda a datos de otra tienda
exports.verificarPropiedadTienda = (req, res, next) => {
    // Si es admin, tiene acceso global
    if (req.usuario.rol === 'admin') return next();

    // Si es tendero, el ID de la tienda en la URL o en el body debe coincidir con el de su token
    const tiendaIdSolicitada = req.params.tienda_id || req.body.tienda_id;

    if (req.usuario.rol === 'tendero' && req.usuario.tienda_id !== tiendaIdSolicitada) {
        return res.status(403).json({ error: 'No tienes permiso para acceder a los datos de esta tienda.' });
    }

    next();
};