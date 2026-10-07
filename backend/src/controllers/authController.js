const authService = require('../services/authService');

// ==========================================
// LOGIN general
// Acepta "identifier" (DNI/teléfono/email) o "email" para compatibilidad
// ==========================================
exports.login = async (req, res) => {
    try {
        const { identifier, email, password, rol } = req.body;
        const id = identifier || email; // compatibilidad con versiones anteriores

        if (!id || !password) {
            return res.status(400).json({
                error: 'Por favor, proporciona tu DNI/teléfono/email y contraseña',
            });
        }

        const resultado = await authService.login(id, password, rol);

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            ...resultado,
        });
    } catch (error) {
        console.error('Error en el login:', error);
        const code =
            error.message.includes('inválidas') ||
                error.message.includes('inactivo') ||
                error.message.includes('bloqueado')
                ? 401
                : 500;
        res.status(code).json({
            error: error.message || 'Error en el servidor al intentar iniciar sesión',
        });
    }
};

// ==========================================
// REGISTRO: Administrador
// ==========================================
exports.registerAdmin = async (req, res) => {
    try {
        const result = await authService.registrarAdministrador(req.body);
        res.status(201).json({
            mensaje: 'Administrador registrado con éxito',
            data: result,
        });
    } catch (error) {
        console.error('Error registrando admin:', error);
        res.status(400).json({ error: error.message });
    }
};

// ==========================================
// REGISTRO: Tendero
// ==========================================
exports.registerTendero = async (req, res) => {
    try {
        const result = await authService.registrarTendero(req.body);
        res.status(201).json({
            mensaje: 'Tendero registrado con éxito',
            data: result,
        });
    } catch (error) {
        console.error('Error registrando tendero:', error);
        res.status(400).json({ error: error.message });
    }
};

// ==========================================
// REGISTRO: Cliente
// ==========================================
exports.registerCliente = async (req, res) => {
    try {
        const result = await authService.registrarCliente(req.body);
        res.status(201).json({
            mensaje: 'Cliente registrado con éxito',
            data: result,
        });
    } catch (error) {
        console.error('Error registrando cliente:', error);
        res.status(400).json({ error: error.message });
    }
};