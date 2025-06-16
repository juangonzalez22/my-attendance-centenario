// pages/api/enviarCorreo.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { destinatario, asunto, mensaje } = req.body;

  if (!destinatario || !asunto || !mensaje) {
    return res.status(400).json({ error: 'Faltan datos en la petición' });
  }

  // Configurar el transportador SMTP para Gmail
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // smtp.gmail.com
    port: process.env.SMTP_PORT, // 465
    secure: process.env.SMTP_SECURE === 'true', // true para conexiones SSL
    auth: {
      user: process.env.SMTP_USER, // tu_cuenta@gmail.com
      pass: process.env.SMTP_PASS, // la contraseña de aplicación
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM, // "Tu Nombre <tu_cuenta@gmail.com>"
      to: destinatario,
      subject: asunto,
      text: mensaje,
      html: mensaje,
    });
    console.log('Correo enviado:', info);
    return res.status(200).json({ success: true, info });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }
}
