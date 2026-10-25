const multer = require('multer');

// Usamos memoryStorage para no guardar el archivo en el disco del servidor,
// sino pasarlo directamente a Cloudinary desde la memoria RAM.
const storage = multer.memoryStorage();

// Limitamos el tamaño a 5MB y solo aceptamos imágenes
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

module.exports = upload;