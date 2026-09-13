const jwt = require('jsonwebtoken');

exports.verificarToken = (req, res, next) => {
    // Obtener el token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token válido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Guardar los datos del token en la request
        next(); // Continuar al siguiente middleware o controlador
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// Middleware opcional para verificar roles
exports.verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'Acceso denegado. No tienes permisos para esta acción.' });
        }
        next();
    };
};
