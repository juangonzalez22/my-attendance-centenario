import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Método no permitido' });
    }

    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ success: false, error: 'URL de imagen no proporcionada' });
        }

        // Extraer el public_id de la URL de Cloudinary
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        const publicId = filename.split('.')[0];

        const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
        const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
        const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;

        if (!cloudinaryApiKey || !cloudinaryApiSecret || !cloudinaryCloudName) {
            return res.status(500).json({ success: false, error: 'Faltan credenciales de Cloudinary' });
        }

        // Generar timestamp
        const timestamp = Math.round(new Date().getTime() / 1000);

        // Crear firma usando la API Secret
        const signatureString = `public_id=${publicId}&timestamp=${timestamp}${cloudinaryApiSecret}`;
        const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

        // Llamar a la API de Cloudinary para eliminar la imagen
        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/destroy`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    public_id: publicId,
                    api_key: cloudinaryApiKey,
                    timestamp,
                    signature,
                }),
            }
        );

        const data = await cloudinaryResponse.json();

        if (data.result !== 'ok') {
            return res.status(500).json({ success: false, error: 'Error al eliminar la imagen en Cloudinary', details: data });
        }

        return res.json({ success: true, message: 'Imagen eliminada correctamente' });
    } catch (error) {
        console.error('Error en la API de eliminación:', error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
}
