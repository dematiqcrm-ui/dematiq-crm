// utils/logExport.js
import ExportLog from "../models/ExportLog.js";

/**
 * Registra una exportación en la colección de auditoría.
 * Nunca lanza error: si falla el log, no debe afectar la descarga del archivo.
 */
export const logExport = async ({ formato, filtroTipo = "todo", filtroValor = "", totalRegistros = 0, req }) => {
  try {
    await ExportLog.create({
      formato,
      filtroTipo,
      filtroValor,
      totalRegistros,
      usuario: req.user?.id || null,
      usuarioNombre: req.user?.nombre || "",
      ip: req.ip,
    });
  } catch (err) {
    console.error("Error registrando auditoría de exportación:", err);
  }
};