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

// ─── Lista completa de estados de la República Mexicana ──────────────────────
const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
  "Yucatán", "Zacatecas",
];

// ─── Helpers de filtrado ───────────────────────────────────────────────────────
const filtrarEmpresas = async (tipo, valor) => {
  if (tipo === "estado" && valor) {
    // Busca los parques que están en ese estado, luego las empresas de esos parques
    const parquesDelEstado = await ParqueIndustrial.find({ estado: valor }).select("_id").lean();
    const parqueIds = parquesDelEstado.map((p) => p._id);
    return await Empresa.find({
      parqueIndustrialId: { $in: parqueIds },
      tipo: { $ne: "proveedor" },
    }).lean();
  }
  if (tipo === "parque" && valor) {
    return await Empresa.find({ parqueIndustrialId: valor }).lean();
  }
  if (tipo === "empresa" && valor) {
    return await Empresa.find({ _id: valor, tipo: "empresa" }).lean();
  }
  if (tipo === "proveedor") {
    if (valor) return await Empresa.find({ _id: valor, tipo: "proveedor" }).lean();
    return await Empresa.find({ tipo: "proveedor" }).lean();
  }
  return await Empresa.find({ tipo: { $ne: "proveedor" } }).lean();
};

const filtrarParques = async (tipo, valor, empresas) => {
  if (tipo === "proveedor") return [];
  if (tipo === "parque" && valor) {
    return await ParqueIndustrial.find({ _id: valor }).lean();
  }
  if (tipo === "todo" || !valor) {
    return await ParqueIndustrial.find().lean();
  }
  const parqueIds = [...new Set(empresas.map((e) => String(e.parqueIndustrialId)))];
  return await ParqueIndustrial.find({ _id: { $in: parqueIds } }).lean();
};

// ─── Health check ─────────────────────────────────────────────────────────────
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Filtros disponibles para el panel de exportación ─────────────────────────
router.get("/export/filtros", protect, async (req, res) => {
  try {
    const parques = await ParqueIndustrial.find().select("nombre estado").lean();
    const empresas = await Empresa.find({ tipo: { $ne: "proveedor" } }).select("empresa").lean();
    const proveedores = await Empresa.find({ tipo: "proveedor" }).select("empresa").lean();

    res.json({ estados: ESTADOS_MEXICO, parques, empresas, proveedores });
  } catch (err) {
    console.error("Error obteniendo filtros:", err);
    res.status(500).json({ error: "Error obteniendo filtros" });
  }
});

// ─── Helper: número(s) de teléfono de un contacto ─────────────────────────────
const telefonosContacto = (contacto) => {
  const lista = [];
  if (contacto.telefono) lista.push(contacto.telefono);
  if (contacto.telefonos?.length) {
    contacto.telefonos.forEach((t) => {
      if (t.numero) lista.push(t.tipo ? `${t.numero} (${t.tipo})` : t.numero);
    });
  }
  return [...new Set(lista)].join(" / ");
};

// ─── Helper: teléfonos adicionales de la EMPRESA (no del contacto) ───────────
const telefonosExtraEmpresa = (emp) => {
  if (!emp.telefonosExtra?.length) return "";
  return emp.telefonosExtra
    .filter((t) => t.numero)
    .map((t) => (t.tipo ? `${t.numero} (${t.tipo})` : t.numero))
    .join(" / ");
};

// ─── Helper: convierte empresas en filas del directorio ──────────────────────
const empresasAFilas = (empresas) => {
  const filas = [];
  for (const emp of empresas) {
    const contactos = emp.contactos?.length ? emp.contactos : [{}];
    contactos.forEach((contacto, idx) => {
      filas.push({
        "NO.":                    idx === 0 ? (emp.numero || "") : "",
        "EMPRESA":                idx === 0 ? (emp.empresa || "") : "",
        "GIRO DE LA EMPRESA":     idx === 0 ? (emp.giroEmpresa || "") : "",
        "DIRECCION":              idx === 0 ? (emp.direccion || "") : "",
        "TELEFONO/FAX":           idx === 0 ? (emp.telefono || "") : "",
        "TELEFONOS ADICIONALES":  idx === 0 ? telefonosExtraEmpresa(emp) : "",
        "CONTACTOS":              contacto.nombre  || "",
        "PUESTO/AREA":            contacto.puesto  || "",
        "TELEFONO CONTACTO":      telefonosContacto(contacto),
        "CORREO-ELECTRONICO":     contacto.correo  || "",
        "NOTAS":                  idx === 0 ? (emp.notas || "") : "",
        "PAGINA WEB":             idx === 0 ? (emp.paginaWeb || "") : "",
      });
    });
  }
  return filas;
};

const COLS = ["NO.", "EMPRESA", "GIRO DE LA EMPRESA", "DIRECCION",
              "TELEFONO/FAX", "TELEFONOS ADICIONALES", "CONTACTOS", "PUESTO/AREA",
              "TELEFONO CONTACTO", "CORREO-ELECTRONICO", "NOTAS", "PAGINA WEB"];

// ─── EXPORTAR EXCEL ───────────────────────────────────────────────────────────
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
  { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 22 }, { wch: 30 }, { wch: 25 }, { wch: 30 },
];
      const nombreHoja = (parque.nombre || parque._id.toString())
        .replace(/[:\\/?*\[\]]/g, "").slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    }

    if (wb.SheetNames.length === 0 && empresas.length > 0) {
      const filas = empresasAFilas(empresas);
      const ws = XLSX.utils.json_to_sheet(filas);
      ws["!cols"] = [
  { wch: 5  }, { wch: 40 }, { wch: 35 }, { wch: 35 }, { wch: 25 },
  { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 22 }, { wch: 30 }, { wch: 25 }, { wch: 30 },
];
      const nombreHoja = tipo === "proveedor" ? "Proveedores" : "Empresas";
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    }

    if (wb.SheetNames.length === 0) {
      return res.status(404).json({ error: "No hay datos para exportar con ese filtro" });
    }

    const buffer   = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fechaFile = new Date().toISOString().slice(0, 10);
    const sufijo   = tipo !== "todo" ? `_${tipo}` : "";

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

    const dibujarTabla = (titulo, filas, startY = 30) => {
      doc.setFontSize(16);
      doc.setTextColor(30, 64, 175);
      doc.text(titulo, 14, 18);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Generado: ${fechaStr}`, 14, 25);

      const body = filas.map((f) => COLS.map((c) => f[c] ?? ""));

      autoTable(doc, {
        startY,
        head: [COLS],
        body,
        styles: { fontSize: 6, cellPadding: 1.5, overflow: "linebreak" },
        headStyles: { fillColor: [30, 64, 175], fontSize: 6, fontStyle: "bold" },
        columnStyles: {
  0: { cellWidth: 8  }, 1: { cellWidth: 30 }, 2: { cellWidth: 26 },
  3: { cellWidth: 26 }, 4: { cellWidth: 18 }, 5: { cellWidth: 20 },
  6: { cellWidth: 18 }, 7: { cellWidth: 18 }, 8: { cellWidth: 22 },
  9: { cellWidth: 24 }, 10: { cellWidth: 16 }, 11: { cellWidth: 22 },
},
        margin: { left: 10, right: 10 },
        didParseCell: (data) => {
          if (data.row.index % 2 === 0 && data.section === "body") {
            data.cell.styles.fillColor = [245, 247, 255];
          }
        },
      });
    };

    if (tipo === "parque" || tipo === "todo") {
      for (const parque of parques) {
        const empresasDelParque = empresas.filter(
          (e) => String(e.parqueIndustrialId) === String(parque._id)
        );
        if (empresasDelParque.length === 0) continue;

        if (!primera) doc.addPage();
        primera = false;

        const nombreParque = parque.nombre || "Parque Industrial";
        dibujarTabla(`Directorio CRM — ${nombreParque}`, empresasAFilas(empresasDelParque));
      }
    }

    if (primera && empresas.length > 0) {
      const titulos = {
        estado: `Directorio CRM — Estado: ${valor}`,
        empresa: "Directorio CRM — Empresa",
        proveedor: valor ? "Directorio CRM — Proveedor" : "Directorio CRM — Proveedores",
        todo: "Directorio CRM",
      };
      dibujarTabla(titulos[tipo] || "Directorio CRM", empresasAFilas(empresas), 25);
      primera = false;
    }

    if (primera) {
      return res.status(404).json({ error: "No hay datos para exportar con ese filtro" });
    }

    const fechaFile = new Date().toISOString().slice(0, 10);
    const sufijo    = tipo !== "todo" ? `_${tipo}` : "";
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
    const sufijo    = tipo !== "todo" ? `_${tipo}` : "";
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="CRM_Backup${sufijo}_${fechaFile}.json"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    console.error("Error en respaldo:", err);
    res.status(500).json({ error: "Error generando respaldo" });
  }
});

export default router;