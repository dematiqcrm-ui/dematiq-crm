// routes/exportRoutes.js
// npm install xlsx jspdf jspdf-autotable  (en el backend)

import express from "express";
import XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import Empresa from "../models/Empresa.js";
import ParqueIndustrial from "../models/ParqueIndustrial.js";
import User from "../models/User.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Health check ─────────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Helper: convierte empresas en filas del directorio ──────────────────────
// Cada empresa puede tener N contactos → genera N filas (igual que el Excel original)
const empresasAFilas = (empresas) => {
  const filas = [];

  for (const emp of empresas) {
    const contactos = emp.contactos?.length ? emp.contactos : [{}];

    contactos.forEach((contacto, idx) => {
      filas.push({
        "NO.":                 idx === 0 ? (emp.numero || "") : "",
        "EMPRESA":             idx === 0 ? (emp.empresa || "") : "",
        "GIRO DE LA EMPRESA":  idx === 0 ? (emp.giroEmpresa || "") : "",
        "DIRECCION":           idx === 0 ? (emp.direccion || "") : "",
        "TELEFONO/FAX":        idx === 0 ? (emp.telefono || "") : "",
        "CONTACTOS":           contacto.nombre  || "",
        "PUESTO/AREA":         contacto.puesto  || "",
        "CORREO-ELECTRONICO":  contacto.correo  || "",
        "NOTAS":               idx === 0 ? (emp.notas || "") : "",
        "PAGINA WEB":          idx === 0 ? (emp.paginaWeb || "") : "",
      });
    });
  }

  return filas;
};

// ─── EXPORTAR EXCEL ───────────────────────────────────────────────────────────
router.get("/export/excel", protect, async (req, res) => {
  try {
    const parques  = await ParqueIndustrial.find().lean();
    const empresas = await Empresa.find().lean();

    const wb = XLSX.utils.book_new();

    // Una hoja por parque industrial
    for (const parque of parques) {
      const empresasDelParque = empresas.filter(
        (e) => String(e.parqueIndustrialId) === String(parque._id)
      );

      if (empresasDelParque.length === 0) continue;

      const filas = empresasAFilas(empresasDelParque);
      const ws    = XLSX.utils.json_to_sheet(filas);

      // Ancho de columnas
      ws["!cols"] = [
        { wch: 5  }, // NO.
        { wch: 40 }, // EMPRESA
        { wch: 35 }, // GIRO
        { wch: 35 }, // DIRECCION
        { wch: 25 }, // TELEFONO
        { wch: 25 }, // CONTACTOS
        { wch: 25 }, // PUESTO
        { wch: 30 }, // CORREO
        { wch: 25 }, // NOTAS
        { wch: 30 }, // WEB
      ];

      // Nombre de hoja: máx 31 chars, sin caracteres inválidos
      const nombreHoja = (parque.nombre || parque._id.toString())
        .replace(/[:\\/?*\[\]]/g, "")
        .slice(0, 31);

      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    }

    // Si no hay parques, al menos exportar todas las empresas en una hoja
    if (wb.SheetNames.length === 0) {
      const filas = empresasAFilas(empresas);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), "Empresas");
    }

    const buffer    = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fechaFile = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Directorio_CRM_${fechaFile}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error("Error exportando Excel:", err);
    res.status(500).json({ error: "Error generando Excel" });
  }
});

// ─── EXPORTAR PDF ─────────────────────────────────────────────────────────────
router.get("/export/pdf", protect, async (req, res) => {
  try {
    const parques  = await ParqueIndustrial.find().lean();
    const empresas = await Empresa.find().lean();

    const doc     = new jsPDF({ orientation: "landscape", format: "a3" });
    const fechaStr = new Date().toLocaleString("es-MX");
    let   primera  = true;

    const COLS = ["NO.", "EMPRESA", "GIRO DE LA EMPRESA", "DIRECCION",
                  "TELEFONO/FAX", "CONTACTOS", "PUESTO/AREA",
                  "CORREO-ELECTRONICO", "NOTAS", "PAGINA WEB"];

    for (const parque of parques) {
      const empresasDelParque = empresas.filter(
        (e) => String(e.parqueIndustrialId) === String(parque._id)
      );
      if (empresasDelParque.length === 0) continue;

      if (!primera) doc.addPage();
      primera = false;

      const nombreParque = parque.nombre || "Parque Industrial";

      // Cabecera de sección
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text(`Directorio CRM — ${nombreParque}`, 14, 18);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Generado: ${fechaStr}`, 14, 25);

      const filas = empresasAFilas(empresasDelParque);
      const body  = filas.map((f) => COLS.map((c) => f[c] ?? ""));

      autoTable(doc, {
        startY:     30,
        head:       [COLS],
        body,
        styles:     { fontSize: 6, cellPadding: 1.5, overflow: "linebreak" },
        headStyles: { fillColor: [30, 64, 175], fontSize: 6, fontStyle: "bold" },
        columnStyles: {
          0: { cellWidth: 8  },   // NO.
          1: { cellWidth: 38 },   // EMPRESA
          2: { cellWidth: 32 },   // GIRO
          3: { cellWidth: 32 },   // DIRECCION
          4: { cellWidth: 22 },   // TELEFONO
          5: { cellWidth: 22 },   // CONTACTOS
          6: { cellWidth: 22 },   // PUESTO
          7: { cellWidth: 28 },   // CORREO
          8: { cellWidth: 20 },   // NOTAS
          9: { cellWidth: 28 },   // WEB
        },
        margin:     { left: 10, right: 10 },
        // Filas de mismo empresa con fondo ligeramente distinto
        didParseCell: (data) => {
          if (data.row.index % 2 === 0 && data.section === "body") {
            data.cell.styles.fillColor = [245, 247, 255];
          }
        },
      });
    }

    // Fallback si no hay parques
    if (primera) {
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text("Directorio CRM", 14, 18);
      const filas = empresasAFilas(empresas);
      const body  = filas.map((f) => COLS.map((c) => f[c] ?? ""));
      autoTable(doc, {
        startY: 25, head: [COLS], body,
        styles: { fontSize: 6 }, headStyles: { fillColor: [30, 64, 175] },
        margin: { left: 10, right: 10 },
      });
    }

    const fechaFile = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Directorio_CRM_${fechaFile}.pdf"`);
    res.send(Buffer.from(doc.output("arraybuffer")));
  } catch (err) {
    console.error("Error exportando PDF:", err);
    res.status(500).json({ error: "Error generando PDF" });
  }
});

// ─── RESPALDO JSON COMPLETO ───────────────────────────────────────────────────
router.get("/export/backup", protect, async (req, res) => {
  try {
    const [empresas, parques, users] = await Promise.all([
      Empresa.find().lean(),
      ParqueIndustrial.find().lean(),
      User.find().select("-password").lean(),
    ]);

    const backup = {
      version:  "1.0",
      fecha:    new Date().toISOString(),
      resumen:  {
        totalEmpresas: empresas.length,
        totalParques:  parques.length,
        totalUsuarios: users.length,
      },
      colecciones: { empresas, parqueIndustrials: parques, users },
    };

    const fechaFile = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="CRM_Backup_${fechaFile}.json"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    console.error("Error en respaldo:", err);
    res.status(500).json({ error: "Error generando respaldo" });
  }
});

export default router;