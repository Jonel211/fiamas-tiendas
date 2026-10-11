const authService = require('../services/authService');

// 1. LOGIN
const login = async (req, res, next) => {
    try {
        const { identificador, email, telefono, password, rol } = req.body;
        const idFinal = identificador || email || telefono;

        const resultado = await authService.login({
            identificador: idFinal,
            password,
            rolRequerido: rol
        });

        res.status(200).json({
            msg: 'Inicio de sesión exitoso',
            ...resultado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor al intentar iniciar sesión.' });
    }
};

// 2. REGISTRO DE ADMINISTRADOR
const registerAdmin = async (req, res, next) => {
    try {
        const resultado = await authService.registrarAdministrador(req.body);

        res.status(201).json({
            msg: 'Administrador registrado exitosamente',
            ...resultado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error al registrar admin:', error);
        res.status(500).json({ error: 'Error al registrar administrador', detalle: error.message });
    }
};

// 3. REGISTRO DE TENDERO
const registerTendero = async (req, res, next) => {
    try {
        const resultado = await authService.registrarTendero(req.body);

        res.status(201).json({
            msg: 'Tendero y tienda registrados exitosamente',
            ...resultado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error al registrar tendero:', error);
        res.status(500).json({ error: 'Error al registrar tendero', detalle: error.message });
    }
};

// 4. REGISTRO DE CLIENTE
const registerCliente = async (req, res, next) => {
    try {
        const resultado = await authService.registrarCliente(req.body);

        res.status(201).json({
            msg: 'Cliente registrado exitosamente. Ahora puede vincularse a una tienda.',
            ...resultado
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ error: error.message });
        }
        console.error('Error al registrar cliente:', error);
        res.status(500).json({ error: 'Error al registrar cliente', detalle: error.message });
    }
};

module.exports = {
    login,
    registerAdmin,
    registerTendero,
    registerCliente
};