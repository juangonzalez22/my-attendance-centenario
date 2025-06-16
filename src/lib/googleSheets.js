import { google } from "googleapis";
import fs from "fs";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const CREDENTIALS_PATH = path.join(process.cwd(), "lib/google-credentials.json");

// Cargar credenciales desde el archivo JSON
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: "v4", auth });

export async function agregarAsistencia({ id, nombre, grupo, fecha_hora }) {
  const spreadsheetId = "TU_SPREADSHEET_ID_AQUÍ"; // Reemplaza con el ID real
  const values = [[id, nombre, grupo, fecha_hora]];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Asistencias!A:D", // Ajusta el nombre de la hoja
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });
    console.log("✅ Asistencia agregada a Google Sheets");
  } catch (error) {
    console.error("❌ Error al agregar asistencia:", error);
  }
}
