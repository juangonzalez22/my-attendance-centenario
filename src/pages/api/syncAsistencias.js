// pages/api/syncAsistencias.js
import { supabase } from '@/lib/supabase';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // 1. Traer todos los registros de asistencias
    const { data: asistencias, error: supaError } = await supabase
      .from('asistencias')
      .select('estudiante_id, nombre, grupo, fecha_hora')
      .order('fecha_hora', { ascending: true });
    if (supaError) throw supaError;

    // 2. Autenticación con Google
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const sheetName = process.env.SHEET_NAME || 'Asistencias';

    // 3. Limpiar solo las filas de datos (de la fila 2 hacia abajo)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A2:D`,
    });

    // 4. Preparar los valores para volcar
    const values = asistencias.map(a => {
      const fechaLocal = new Date(a.fecha_hora).toLocaleString('es-CO', {
        timeZone: 'America/Bogota',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return [
        a.estudiante_id,
        a.nombre,
        a.grupo,
        fechaLocal
      ];
    });

    // 5. Hacer append masivo (Google añadirá debajo de la fila 1)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:D`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return res.status(200).json({
      message: 'Sincronización completa',
      count: values.length
    });
  } catch (error) {
    console.error('Error en syncAsistencias:', error.response?.data || error);
    return res.status(500).json({
      error: 'Error al sincronizar',
      details: error.message || error
    });
  }
}
