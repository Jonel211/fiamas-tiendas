const multer = require('multer');

// memoryStorage: el archivo no se guarda en disco, pasa directo a Cloudinary.
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// Igual que upload.single(campo), pero responde 400/413 con JSON
// en vez de dejar que Express devuelva un 500 en HTML.
upload.imagen = (campo) => (req, res, next) => {
    upload.single(campo)(req, res, (err) => {
        if (!err) return next();
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'La imagen supera el máximo de 5 MB.' });
        }
        return res.status(400).json({ error: err.message || 'Archivo inválido.' });
    });
};

module.exports = upload;