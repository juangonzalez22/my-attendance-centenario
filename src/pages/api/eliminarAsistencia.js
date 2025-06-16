import { google } from "googleapis";
import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { id } = req.body; // Solo usamos el ID, sin fecha

    const credentialsPath = path.join(process.cwd(), "src/lib/google-credentials.json");
    const credentials = JSON.parse(await fs.readFile(credentialsPath, "utf8"));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1I8EFY-UnPjACXY6ONFjnnBcVRM8bPXWVOS0hbjizkFw";
    
    // Obtener los datos actuales de la hoja
    const range = "Asistencias!A:D";
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = response.data.values || [];

    // Buscar todas las apariciones del estudiante y seleccionar la última
    let lastIndex = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i][0] === id) {
        lastIndex = i;
        break;
      }
    }

    if (lastIndex === -1) {
      return res.status(404).json({ error: "Registro no encontrado en Google Sheets" });
    }

    // Borrar la fila encontrada
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ 
          deleteDimension: { 
            range: { 
              sheetId: 0, 
              dimension: "ROWS", 
              startIndex: lastIndex, 
              endIndex: lastIndex + 1 
            } 
          } 
        }],
      },
    });

    res.status(200).json({ message: "Último registro eliminado de Google Sheets" });
  } catch (error) {
    console.error("Error al eliminar asistencia de Google Sheets:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
