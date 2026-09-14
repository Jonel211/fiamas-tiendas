const authService = require('../services/authService'); // Importar el servicio de autenticación

// Controlador de inicio de sesion de todos los usuarios
exports.login = async (req, res) => {
    try {
        const { email, password, rol } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Por favor, proporciona email y contraseña' });
        }

        const resultado = await authService.login(email, password, rol);

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            ...resultado
        });
    } catch (error) {
        console.error('Error en el login:', error);
        const code = error.message.includes('inválidas') || error.message.includes('inactivo') || error.message.includes('bloqueado') ? 401 : 500;
        res.status(code).json({ error: error.message || 'Error en el servidor al intentar iniciar sesión' });
    }
};

// Controlador de registro de administradores
exports.registerAdmin = async (req, res) => {
    try {
        const result = await authService.registrarAdministrador(req.body);
        res.status(201).json({ mensaje: 'Administrador registrado con éxito', data: result });
    } catch (error) {
        console.error('Error registrando admin:', error);
        res.status(400).json({ error: error.message });
    }
};

// Controlador de registro de tenderos
exports.registerTendero = async (req, res) => {
    try {
        const result = await authService.registrarTendero(req.body);
        res.status(201).json({ mensaje: 'Tendero registrado con éxito', data: result });
    } catch (error) {
        console.error('Error registrando tendero:', error);
        res.status(400).json({ error: error.message });
    }
};

// Controlador de registro de clientes
exports.registerCliente = async (req, res) => {
    try {
        const result = await authService.registrarCliente(req.body);
        res.status(201).json({ mensaje: 'Cliente registrado con éxito', data: result });
    } catch (error) {
        console.error('Error registrando cliente:', error);
        res.status(400).json({ error: error.message });
    }
};
