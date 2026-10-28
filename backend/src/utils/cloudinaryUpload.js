const cloudinary = require('../config/cloudinary');

async function subirImagen(file, folder) {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const resultado = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'image'
    });
    return resultado.secure_url;
}

module.exports = { subirImagen };