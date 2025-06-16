// src/pages/api/agregarAsistencia.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { id, nombre, grupo, fecha_hora } = req.body;
    const fechaLocal = new Date(fecha_hora).toLocaleString("es-CO", {
      timeZone: "America/Bogota",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // En lugar de fs + jsonfile, parseamos la variable de entorno
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1I8EFY-UnPjACXY6ONFjnnBcVRM8bPXWVOS0hbjizkFw";

    const values = [[id, nombre, grupo, fechaLocal]];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Asistencias!A:D",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.status(200).json({ message: "Asistencia agregada a Google Sheets" });
  } catch (error) {
    console.error("Error al agregar asistencia a Google Sheets:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
