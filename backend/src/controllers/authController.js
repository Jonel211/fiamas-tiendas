const jwt = require('jsonwebtoken');
const { Administrador, Tendero, Cliente } = require('../models');

const generarToken = (usuario, rol) => {
    return jwt.sign(
        { id: usuario.id, rol: rol },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

exports.login = async (req, res) => {
    try {
        const { email, password, rol } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Por favor, proporciona email y contraseña' });
        }

        let usuario = null;
        let rolEncontrado = rol;

        // Si se especificó un rol, buscar solo en ese modelo
        if (rol === 'admin') {
            usuario = await Administrador.findOne({ where: { email } });
        } else if (rol === 'tendero') {
            usuario = await Tendero.findOne({ where: { email } });
        } else if (rol === 'cliente') {
            usuario = await Cliente.findOne({ where: { email } });
        } else {
            // Si no se especificó rol, buscar en cascada (Admin -> Tendero -> Cliente)
            usuario = await Administrador.findOne({ where: { email } });
            if (usuario) {
                rolEncontrado = 'admin';
            } else {
                usuario = await Tendero.findOne({ where: { email } });
                if (usuario) {
                    rolEncontrado = 'tendero';
                } else {
                    usuario = await Cliente.findOne({ where: { email } });
                    if (usuario) rolEncontrado = 'cliente';
                }
            }
        }

        // Verificar si el usuario existe
        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar si está activo (los clientes tienen 'activo' y 'bloqueado')
        if (usuario.activo === false) {
            return res.status(403).json({ error: 'Usuario inactivo' });
        }

        if (rolEncontrado === 'cliente' && usuario.bloqueado) {
            return res.status(403).json({ error: 'Usuario bloqueado', motivo: usuario.motivo_bloqueo });
        }

        // Validar contraseña
        const isMatch = await usuario.validarPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Actualizar último acceso (si el modelo lo soporta)
        if (usuario.ultimo_acceso !== undefined) {
            usuario.ultimo_acceso = new Date();
            await usuario.save({ hooks: false });
        }

        // Generar token JWT
        const token = generarToken(usuario, rolEncontrado);

        res.json({
            mensaje: 'Inicio de sesión exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre || usuario.nombres, // Admin tiene 'nombre', Tendero/Cliente tienen 'nombres'
                email: usuario.email,
                rol: rolEncontrado
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error en el servidor al intentar iniciar sesión' });
    }
};
