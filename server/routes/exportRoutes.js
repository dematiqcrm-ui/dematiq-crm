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

// ─── Helper: filtra empresas según tipo y valor ───────────────────────────────
// tipo: "todo" | "estado" | "parque" | "empresa"
// valor: string con el valor a filtrar (nombre de estado, ID de parque, ID de empresa)
const filtrarEmpresas = async (tipo, valor) => {
  if (!tipo || tipo === "todo" || !valor || valor === "todos") {
    return Empresa.find().lean();
  }
  if (tipo === "estado") {
    // Buscar parques de ese estado, luego empresas de esos parques
    const parquesDelEstado = await ParqueIndustrial.find({
      estado: { $regex: new RegExp(`^${valor}$`, "i") },
    }).lean();
    const ids = parquesDelEstado.map((p) => String(p._id));
    return Empresa.find({
      parqueIndustrialId: { $in: ids },
    }).lean();
  }
  if (tipo === "parque") {
    return Empresa.find({ parqueIndustrialId: valor }).lean();
  }
  if (tipo === "empresa") {
    return Empresa.find({ _id: valor }).lean();
  }
  return Empresa.find().lean();
};

// ─── Helper: filtra parques según tipo y valor ────────────────────────────────
const filtrarParques = async (tipo, valor, empresas) => {
  if (!tipo || tipo === "todo" || !valor || valor === "todos") {
    return ParqueIndustrial.find().lean();
  }
  if (tipo === "estado") {
    return ParqueIndustrial.find({
      estado: { $regex: new RegExp(`^${valor}$`, "i") },
    }).lean();
  }
  if (tipo === "parque") {
    return ParqueIndustrial.find({ _id: valor }).lean();
  }
  if (tipo === "empresa") {
    // Solo el parque al que pertenece esa empresa
    const emp = empresas[0];
    if (!emp) return [];
    return ParqueIndustrial.find({ _id: emp.parqueIndustrialId }).lean();
  }
  return ParqueIndustrial.find().lean();
};

// ─── GET /api/export/filtros — lista estados, parques y empresas ──────────────
// Usado por el frontend para poblar los selects
router.get("/export/filtros", protect, async (req, res) => {
  try {
    const [parques, empresas] = await Promise.all([
      ParqueIndustrial.find().select("_id nombre estado municipio").lean(),
      Empresa.find().select("_id empresa parqueIndustrialId").lean(),
    ]);

    // Estados únicos (de los parques)
    const estadosSet = new Set(parques.map((p) => p.estado).filter(Boolean));
    const estados = [...estadosSet].sort();

    res.json({ estados, parques, empresas });
  } catch (err) {
    console.error("Error cargando filtros:", err);
    res.status(500).json({ error: "Error cargando filtros" });
  }
});

// ─── EXPORTAR EXCEL ───────────────────────────────────────────────────────────
// Query params: tipo (todo|estado|parque|empresa) y valor (el ID o nombre)
router.get("/export/excel", protect, async (req, res) => {
  try {
    const { tipo = "todo", valor = "" } = req.query;

    const empresas = await filtrarEmpresas(tipo, valor);
    const parques  = await filtrarParques(tipo, valor, empresas);

    const wb = XLSX.utils.book_new();

    for (const parque of parques) {
      const empresasDelParque = empresas.filter(
        (e) => String(e.parqueIndustrialId) === String(parque._id)
      );
      if (empresasDelParque.length === 0) continue;

      const filas = empresasAFilas(empresasDelParque);
      const ws    = XLSX.utils.json_to_sheet(filas);

      ws["!cols"] = [
        { wch: 5  }, { wch: 40 }, { wch: 35 }, { wch: 35 }, { wch: 25 },
        { wch: 25 }, { wch: 25 }, { wch: 30 }, { wch: 25 }, { wch: 30 },
      ];

      const nombreHoja = (parque.nombre || parque._id.toString())
        .replace(/[:\\/?*\[\]]/g, "")
        .slice(0, 31);

      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    }

    // Fallback: si no hay parques (ej. tipo=empresa sin parque asignado)
    if (wb.SheetNames.length === 0 && empresas.length > 0) {
      const filas = empresasAFilas(empresas);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), "Empresas");
    }

    if (wb.SheetNames.length === 0) {
      return res.status(404).json({ error: "No hay datos para exportar con ese filtro" });
    }

    const buffer   = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fechaFile = new Date().toISOString().slice(0, 10);
    const sufijo   = tipo !== "todo" && valor ? `_${tipo}` : "";

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="Directorio_CRM${sufijo}_${fechaFile}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error("Error exportando Excel:", err);
    res.status(500).json({ error: "Error generando Excel" });
  }
});

// ─── EXPORTAR PDF ─────────────────────────────────────────────────────────────
router.get("/export/pdf", protect, async (req, res) => {
  try {
    const { tipo = "todo", valor = "" } = req.query;

    const empresas = await filtrarEmpresas(tipo, valor);
    const parques  = await filtrarParques(tipo, valor, empresas);

    const doc      = new jsPDF({ orientation: "landscape", format: "a3" });
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
          0: { cellWidth: 8  }, 1: { cellWidth: 38 }, 2: { cellWidth: 32 },
          3: { cellWidth: 32 }, 4: { cellWidth: 22 }, 5: { cellWidth: 22 },
          6: { cellWidth: 22 }, 7: { cellWidth: 28 }, 8: { cellWidth: 20 },
          9: { cellWidth: 28 },
        },
        margin: { left: 10, right: 10 },
        didParseCell: (data) => {
          if (data.row.index % 2 === 0 && data.section === "body") {
            data.cell.styles.fillColor = [245, 247, 255];
          }
        },
      });
    }

    // Fallback
    if (primera && empresas.length > 0) {
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
      primera = false;
    }

    if (primera) {
      return res.status(404).json({ error: "No hay datos para exportar con ese filtro" });
    }

    const fechaFile = new Date().toISOString().slice(0, 10);
    const sufijo    = tipo !== "todo" && valor ? `_${tipo}` : "";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Directorio_CRM${sufijo}_${fechaFile}.pdf"`);
    res.send(Buffer.from(doc.output("arraybuffer")));
  } catch (err) {
    console.error("Error exportando PDF:", err);
    res.status(500).json({ error: "Error generando PDF" });
  }
});

// ─── RESPALDO JSON ────────────────────────────────────────────────────────────
router.get("/export/backup", protect, async (req, res) => {
  try {
    const { tipo = "todo", valor = "" } = req.query;

    const empresas = await filtrarEmpresas(tipo, valor);
    const parques  = await filtrarParques(tipo, valor, empresas);

    // Para backup "todo" también incluir usuarios; para filtros parciales no
    const users = (tipo === "todo" || !valor || valor === "todos")
      ? await User.find().select("-password").lean()
      : [];

    const backup = {
      version:  "1.0",
      fecha:    new Date().toISOString(),
      filtro:   { tipo, valor: valor || "todos" },
      resumen: {
        totalEmpresas: empresas.length,
        totalParques:  parques.length,
        totalUsuarios: users.length,
      },
      colecciones: { empresas, parqueIndustrials: parques, ...(users.length ? { users } : {}) },
    };

    const fechaFile = new Date().toISOString().slice(0, 10);
    const sufijo    = tipo !== "todo" && valor ? `_${tipo}` : "";
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="CRM_Backup${sufijo}_${fechaFile}.json"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    console.error("Error en respaldo:", err);
    res.status(500).json({ error: "Error generando respaldo" });
  }
});

export default router;