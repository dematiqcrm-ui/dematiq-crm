import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import EmpresaForm from "../components/empresas/EmpresaForm";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, ExternalLink, Search, ChevronDown,
  X, Building2, Users, Mail, Clock, Paperclip, MapPin,
} from "lucide-react";
import api from "../services/api";
import { getCuentas } from "../services/cuentaCorreoService";
import { getParques } from "../services/parqueService";
import {
  getEmpresas, createEmpresa, updateEmpresa, deleteEmpresa,
  registrarCorreo,
} from "../services/empresaService";

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.96, y: 16 },
};

const GLOBAL_SELECT_STYLE = `
  select, select option {
    background-color: #131720 !important;
    color: #e2e8f0 !important;
  }
  select:focus { outline: none; }
`;

const s = {
  pageWrap: { fontFamily: "'DM Sans', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 4 },
  newBtn: {
    height: 36, padding: "0 14px", borderRadius: 8,
    background: "#3b5bff", border: "1px solid rgba(99,130,246,0.4)",
    color: "#fff", fontSize: 13, fontWeight: 500,
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer", transition: "background 0.15s", fontFamily: "inherit",
  },
  filtersRow: { display: "flex", gap: 10, marginBottom: 16 },
  selectWrap: { position: "relative", flex: "1.3", minWidth: 0 },
  searchWrap: { position: "relative", flex: 2, minWidth: 0 },
  selectInput: {
    width: "100%", height: 36, background: "#131720", backgroundColor: "#131720",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    color: "#e2e8f0", fontSize: 13, padding: "0 32px 0 12px",
    outline: "none", appearance: "none", WebkitAppearance: "none",
    cursor: "pointer", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s",
  },
  searchInput: {
    width: "100%", height: 36, background: "#131720", backgroundColor: "#131720",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    color: "#e2e8f0", fontSize: 13, padding: "0 12px 0 34px",
    outline: "none", appearance: "none", WebkitAppearance: "none",
    fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.15s, background 0.15s",
  },
  tableWrap: {
    borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden", background: "#0c0f18",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    padding: "9px 12px", textAlign: "left", fontSize: 10, fontWeight: 600,
    color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em",
    background: "rgba(255,255,255,0.02)", whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  td: { padding: "10px 12px", color: "rgba(255,255,255,0.55)", borderTop: "1px solid rgba(255,255,255,0.035)", verticalAlign: "middle" },
  companyName: { fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.88)" },
  companyDomain: { fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 2 },
  actBtn: (variant) => ({
    width: 28, height: 28, borderRadius: 7,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", border: "1px solid rgba(255,255,255,0.07)",
    background: "transparent",
    color: variant === "edit" ? "#fbbf24" : "#f87171",
    transition: "all 0.15s",
  }),
  modalBackdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 50, padding: 16,
  },
  modalBox: {
    background: "#0e1119", border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 14, width: "100%", maxWidth: 640,
    maxHeight: "90vh", overflowY: "auto",
    padding: "24px 28px", boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.01em" },
  modalSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.28)", marginTop: 3 },
  modalCloseBtn: {
    width: 28, height: 28, borderRadius: 7,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", transition: "background 0.15s", flexShrink: 0,
  },
  contactCard: {
    background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 10, padding: "14px 16px", marginBottom: 10,
  },
  contactLabel: {
    fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.22)",
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4,
  },
  contactValue: { fontSize: 13, color: "rgba(255,255,255,0.72)" },
  empty: { padding: "48px 0", textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: 13 },
};

function ChevronIcon({ right = 10 }) {
  return (
    <ChevronDown size={13} style={{
      position: "absolute", right, top: "50%", transform: "translateY(-50%)",
      color: "rgba(255,255,255,0.3)", pointerEvents: "none",
    }} />
  );
}

function SearchIcon() {
  return (
    <Search size={13} style={{
      position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
      color: "rgba(255,255,255,0.25)", pointerEvents: "none",
    }} />
  );
}

function UltimoCorreoBadge({ fecha }) {
  if (!fecha) return <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>—</span>;
  const str = new Date(fecha).toLocaleDateString("es-MX", {
    day: "2-digit", month: "short", year: "numeric",
  });
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, color: "rgba(52,211,153,0.8)", fontWeight: 500,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
      {str}
    </span>
  );
}

export default function Empresas() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [historial, setHistorial]           = useState([]);
  const [verHistorial, setVerHistorial]     = useState(false);
  const [correoContacto, setCorreoContacto] = useState(null);
  const [correoForm, setCorreoForm]         = useState({ asunto: "", mensaje: "", adjuntos: [] });
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [parques, setParques]               = useState([]);
  const [parqueSeleccionado, setParqueSeleccionado] = useState("");
  const [empresas, setEmpresas]             = useState([]);
  const [search, setSearch]                 = useState("");
  const [open, setOpen]                     = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [detailEmpresa, setDetailEmpresa]   = useState(null);
  const [sortAsc, setSortAsc]               = useState(true);
  const [cuentas, setCuentas]               = useState([]);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState("");
  const [detailEmpresaLive, setDetailEmpresaLive] = useState(null);

  useEffect(() => { setDetailEmpresaLive(detailEmpresa); }, [detailEmpresa]);

  /* ─── Carga parques ────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchParques = async () => {
      try {
        const data = await getParques();
        const lista = Array.isArray(data) ? data : [];
        setParques(lista);

        const parqueFromQuery = searchParams.get("parque");
        if (parqueFromQuery && lista.find((p) => p._id === parqueFromQuery)) {
          setParqueSeleccionado(parqueFromQuery);
        } else if (lista.length > 0) {
          setParqueSeleccionado(lista[0]._id);
        }

        const searchFromQuery = searchParams.get("search");
        if (searchFromQuery) {
          setSearch(decodeURIComponent(searchFromQuery));
          setSearchParams({});
        }
      } catch (err) {
        console.error(err);
        setParques([]);
      }
    };
    fetchParques();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ─── Carga cuentas de correo ──────────────────────────────────────────── */
  useEffect(() => {
    const cargarCuentas = async () => {
      try {
        const data = await getCuentas();
        setCuentas(data);
        if (data.length > 0) setCuentaSeleccionada(data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };
    cargarCuentas();
  }, []);

  /* ─── Enviar correo ────────────────────────────────────────────────────── */
  const handleEnviarCorreo = async () => {
    if (!correoForm.asunto || !correoForm.mensaje) {
      Swal.fire({ icon: "warning", title: "Completa todos los campos", timer: 1400, showConfirmButton: false });
      return;
    }
    if (!cuentaSeleccionada) {
      Swal.fire({ icon: "warning", title: "Selecciona una cuenta remitente", timer: 1400, showConfirmButton: false });
      return;
    }
    setEnviandoCorreo(true);
    try {
      const formData = new FormData();
      formData.append("destinatario",   correoContacto.correo);
      formData.append("asunto",         correoForm.asunto);
      formData.append("mensaje",        correoForm.mensaje);
      formData.append("empresaId",      detailEmpresaLive._id);
      formData.append("contactoNombre", correoContacto.nombre);
      formData.append("cuentaId",       cuentaSeleccionada);
      correoForm.adjuntos.forEach((file) => formData.append("adjuntos", file));

      await api.post("/correo/enviar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Registrar fecha de último correo en el contacto
      await registrarCorreo(detailEmpresaLive._id, correoContacto.correo);

      // Actualizar empresa en memoria
      const empresaActualizada = await api.get(`/empresas/${detailEmpresaLive._id}`);
      const empresaData = empresaActualizada.data;
      setEmpresas((prev) => prev.map((e) => e._id === empresaData._id ? empresaData : e));
      setDetailEmpresaLive(empresaData);

      setCorreoForm({ asunto: "", mensaje: "", adjuntos: [] });
      await Swal.fire({ icon: "success", title: "Correo enviado", timer: 1400, showConfirmButton: false });
      setCorreoContacto(null);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo enviar el correo" });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const handleVerHistorial = async (empresa) => {
    try {
      const { data } = await api.get(`/correo/historial/${empresa._id}`);
      setHistorial(data);
      setVerHistorial(empresa);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar el historial" });
    }
  };

  const cargarEmpresas = useCallback(async () => {
    if (!parqueSeleccionado) return;
    try {
      const data = await getEmpresas(parqueSeleccionado);
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEmpresas([]);
    }
  }, [parqueSeleccionado]);

  const isFirstParqueLoad = useState(true);
  useEffect(() => {
    cargarEmpresas();
    if (!isFirstParqueLoad[0]) setSearch("");
    isFirstParqueLoad[0] = false;
  }, [cargarEmpresas]);

  const handleCreate = async (data) => {
    try {
      await createEmpresa({ ...data, parqueIndustrialId: parqueSeleccionado });
      await cargarEmpresas();
      setOpen(false);
      Swal.fire({ icon: "success", title: "Empresa creada", timer: 1400, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo crear la empresa" });
    }
  };

  const handleUpdate = async (data) => {
    const { value: password } = await Swal.fire({
      title: "Confirmar edición", input: "password",
      inputLabel: "Ingresa tu contraseña para continuar",
      inputPlaceholder: "Contraseña", showCancelButton: true,
      confirmButtonColor: "#3b5bff", cancelButtonColor: "#475569",
      confirmButtonText: "Confirmar", cancelButtonText: "Cancelar", reverseButtons: true,
    });
    if (!password) return;
    try {
      await api.post("/auth/verify-password", { password });
    } catch {
      Swal.fire({ icon: "error", title: "Contraseña incorrecta", timer: 1400, showConfirmButton: false });
      return;
    }
    try {
      await updateEmpresa(editingEmpresa._id, data);
      await cargarEmpresas();
      setEditingEmpresa(null);
      Swal.fire({ icon: "success", title: "Empresa actualizada", timer: 1400, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar la empresa" });
    }
  };

  const handleDelete = async (id) => {
    const { value: password } = await Swal.fire({
      title: "Confirmar eliminación", input: "password",
      inputLabel: "Ingresa tu contraseña para continuar",
      inputPlaceholder: "Contraseña", showCancelButton: true,
      confirmButtonColor: "#dc2626", cancelButtonColor: "#475569",
      confirmButtonText: "Eliminar", cancelButtonText: "Cancelar", reverseButtons: true,
    });
    if (!password) return;
    try {
      await api.post("/auth/verify-password", { password });
    } catch {
      Swal.fire({ icon: "error", title: "Contraseña incorrecta", timer: 1400, showConfirmButton: false });
      return;
    }
    try {
      await deleteEmpresa(id);
      await cargarEmpresas();
      Swal.fire({ icon: "success", title: "Empresa eliminada", timer: 1400, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar la empresa" });
    }
  };

  const empresasFiltradas = empresas
    .filter((e) => {
      const q = search.toLowerCase();
      return (
        e.empresa?.toLowerCase().includes(q) ||
        e.giroEmpresa?.toLowerCase().includes(q) ||
        e.numero?.toLowerCase().includes(q) ||
        e.telefono?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const nameA = a.empresa?.toLowerCase() || "";
      const nameB = b.empresa?.toLowerCase() || "";
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

  const parqueActual = parques.find((p) => p._id === parqueSeleccionado);

  return (
    <Layout>
      <style>{GLOBAL_SELECT_STYLE}</style>
      <div style={s.pageWrap}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.title}>Empresas</div>
            {parqueActual && (
              <div style={s.subtitle}>
                {parqueActual.nombre} — {parqueActual.municipio || "Querétaro"}, {parqueActual.estado}
              </div>
            )}
          </div>
          <button onClick={() => setOpen(true)} disabled={!parqueSeleccionado}
            style={{ ...s.newBtn, opacity: parqueSeleccionado ? 1 : 0.4, cursor: parqueSeleccionado ? "pointer" : "not-allowed" }}
            onMouseEnter={(e) => { if (parqueSeleccionado) e.currentTarget.style.background = "#2e4ee0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#3b5bff"; }}>
            <Plus size={14} />Nueva empresa
          </button>
        </div>

        {/* Filtros */}
        <div style={s.filtersRow}>
          <div style={s.selectWrap}>
            <select value={parqueSeleccionado} onChange={(e) => setParqueSeleccionado(e.target.value)}
              style={s.selectInput}
              onFocus={(e) => { e.target.style.borderColor = "rgba(99,130,246,0.5)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}>
              {parques.length === 0 && <option value="">Sin parques</option>}
              {parques.map((p) => (
                <option key={p._id} value={p._id} style={{ background: "#131720", color: "#e2e8f0" }}>{p.nombre}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>
          <div style={s.searchWrap}>
            <SearchIcon />
            <input type="text" placeholder="Buscar empresa, giro, teléfono..."
              value={search} onChange={(e) => setSearch(e.target.value)} style={s.searchInput}
              onFocus={(e) => { e.target.style.borderColor = "rgba(99,130,246,0.5)"; e.target.style.background = "#16192a"; }}
              onBlur={(e)  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "#131720"; }} />
          </div>
        </div>

        {/* Tabla */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["#", "Empresa", "Giro", "Dirección", "Teléfono", "Página web", "Contactos", "Acciones"].map((h) => (
                  h === "Empresa" ? (
                    <th key={h} style={{ ...s.th, cursor: "pointer", userSelect: "none" }} onClick={() => setSortAsc(!sortAsc)}>
                      Empresa {sortAsc ? "↑" : "↓"}
                    </th>
                  ) : <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!parqueSeleccionado ? (
                <tr><td colSpan={8} style={s.empty}>
                  <Building2 size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.2 }} />
                  Selecciona un parque industrial
                </td></tr>
              ) : empresasFiltradas.length === 0 ? (
                <tr><td colSpan={8} style={s.empty}>
                  <Building2 size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.2 }} />
                  Sin empresas en este parque
                </td></tr>
              ) : (
                empresasFiltradas.map((empresa) => (
                  <tr key={empresa._id} style={{ transition: "background 0.1s" }}
                    onMouseEnter={(e) => { [...e.currentTarget.children].forEach(td => td.style.background = "rgba(255,255,255,0.018)"); }}
                    onMouseLeave={(e) => { [...e.currentTarget.children].forEach(td => td.style.background = "transparent"); }}>
                    <td style={{ ...s.td, color: "rgba(255,255,255,0.18)", fontSize: 11, width: 40 }}>{empresa.numero || "—"}</td>
                    <td style={s.td}>
                      <div style={s.companyName}>{empresa.empresa}</div>
                      {empresa.paginaWeb && (
                        <div style={s.companyDomain}>{empresa.paginaWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}</div>
                      )}
                    </td>
                    <td style={s.td}>
                      {empresa.giroEmpresa ? (
                        <span style={{
                          display: "inline-block", padding: "2px 9px", borderRadius: 6,
                          fontSize: 10, fontWeight: 500,
                          background: "rgba(59,91,255,0.1)", color: "#818cf8",
                          border: "1px solid rgba(99,130,246,0.15)", whiteSpace: "nowrap",
                        }}>
                          {empresa.giroEmpresa.length > 28 ? empresa.giroEmpresa.slice(0, 28) + "…" : empresa.giroEmpresa}
                        </span>
                      ) : <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>}
                    </td>
                    <td style={{ ...s.td, maxWidth: 160 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }} title={empresa.direccion}>
                          {empresa.direccion || <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>}
                        </div>
                        {empresa.direccion && (
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(empresa.direccion)}`}
                            target="_blank" rel="noopener noreferrer" title="Ver en Google Maps"
                            style={{ color: "#60a5fa", flexShrink: 0, display: "flex", alignItems: "center" }}>
                            <MapPin size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                      {empresa.telefono || <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>}
                    </td>
                    <td style={s.td}>
                      {empresa.paginaWeb ? (
                        <a href={empresa.paginaWeb} target="_blank" rel="noopener noreferrer"
                          style={{ color: "#60a5fa", fontSize: 11, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                          <ExternalLink size={11} />Ver sitio
                        </a>
                      ) : <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>}
                    </td>
                    <td style={s.td}>
                      {empresa.contactos?.length > 0 ? (
                        <button onClick={() => setDetailEmpresa(empresa)}
                          style={{
                            background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)",
                            color: "#34d399", fontSize: 11, fontWeight: 500,
                            cursor: "pointer", padding: "3px 9px", borderRadius: 6, fontFamily: "inherit",
                            display: "flex", alignItems: "center", gap: 4, transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(52,211,153,0.14)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(52,211,153,0.08)"}>
                          <Users size={10} />
                          {empresa.contactos.length} {empresa.contactos.length === 1 ? "contacto" : "contactos"}
                        </button>
                      ) : <span style={{ color: "rgba(255,255,255,0.13)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => handleVerHistorial(empresa)} style={{ ...s.actBtn("hist"), color: "#34d399" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(52,211,153,0.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} title="Historial">
                          <Clock size={12} />
                        </button>
                        <button onClick={() => setEditingEmpresa(empresa)} style={s.actBtn("edit")}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(251,191,36,0.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} title="Editar">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDelete(empresa._id)} style={s.actBtn("delete")}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"} title="Eliminar">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {empresasFiltradas.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.18)", textAlign: "right" }}>
            {empresasFiltradas.length} {empresasFiltradas.length === 1 ? "empresa" : "empresas"}{search && " encontradas"}
          </div>
        )}
      </div>

      {/* Modal Crear */}
      <AnimatePresence>
        {open && (
          <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div style={s.modalBox} variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <div>
                  <div style={s.modalTitle}>Nueva empresa</div>
                  <div style={s.modalSubtitle}>Completa los datos de la empresa</div>
                </div>
                <button onClick={() => setOpen(false)} style={s.modalCloseBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}><X size={15} /></button>
              </div>
              <EmpresaForm parqueIndustrialId={parqueSeleccionado} onSubmit={handleCreate} onCancel={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Editar */}
      <AnimatePresence>
        {editingEmpresa && (
          <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingEmpresa(null)}>
            <motion.div style={s.modalBox} variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <div>
                  <div style={s.modalTitle}>Editar empresa</div>
                  <div style={s.modalSubtitle}>{editingEmpresa.empresa}</div>
                </div>
                <button onClick={() => setEditingEmpresa(null)} style={s.modalCloseBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}><X size={15} /></button>
              </div>
              <EmpresaForm initialData={editingEmpresa} parqueIndustrialId={parqueSeleccionado} onSubmit={handleUpdate} onCancel={() => setEditingEmpresa(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Contactos */}
      <AnimatePresence>
        {detailEmpresaLive && (
          <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailEmpresa(null)}>
            <motion.div style={{ ...s.modalBox, maxWidth: 480 }} variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <div>
                  <div style={s.modalTitle}>Contactos</div>
                  <div style={s.modalSubtitle}>{detailEmpresaLive.empresa}</div>
                </div>
                <button onClick={() => setDetailEmpresa(null)} style={s.modalCloseBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}><X size={15} /></button>
              </div>
              <div>
                {detailEmpresaLive.contactos.map((c, i) => (
                  <div key={i} style={s.contactCard}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "rgba(99,130,246,0.12)", border: "1px solid rgba(99,130,246,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 600, color: "#818cf8", flexShrink: 0,
                      }}>
                        {c.nombre ? c.nombre.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
                          {c.nombre || <span style={{ color: "rgba(255,255,255,0.2)" }}>Sin nombre</span>}
                        </div>
                        {c.puesto && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{c.puesto}</div>}
                      </div>
                      {c.correo && (
                        <button
                          onClick={() => { setCorreoContacto(c); setCorreoForm({ asunto: "", mensaje: "", adjuntos: [] }); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "4px 10px", borderRadius: 6,
                            background: "rgba(59,91,255,0.1)", border: "1px solid rgba(99,130,246,0.2)",
                            color: "#818cf8", fontSize: 11, fontWeight: 500,
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(59,91,255,0.18)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(59,91,255,0.1)"}>
                          <Mail size={11} /> Enviar correo
                        </button>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 8 }}>
                      <div>
                        <div style={s.contactLabel}>Correo</div>
                        <div style={s.contactValue}>
                          {c.correo
                            ? <a href={`mailto:${c.correo}`} style={{ color: "#60a5fa", textDecoration: "none", fontSize: 12 }}>{c.correo}</a>
                            : <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>—</span>}
                        </div>
                      </div>
                      <div>
                        <div style={s.contactLabel}>Teléfono</div>
                        <div style={s.contactValue}>{c.telefono || <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>—</span>}</div>
                      </div>
                      {c.telefonos?.filter(t => t.numero).map((tel, i) => (
                        <div key={i}>
                          <div style={s.contactLabel}>{tel.tipo || `Teléfono ${i + 1}`}</div>
                          <div style={s.contactValue}>{tel.numero}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: c.nota ? 8 : 0 }}>
                      <div style={s.contactLabel}>Último correo enviado</div>
                      <UltimoCorreoBadge fecha={c.fechaUltimoCorreo} />
                    </div>

                    {c.nota && (
                      <div style={{
                        marginTop: 8, padding: "8px 10px", borderRadius: 7,
                        background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.12)",
                      }}>
                        <div style={{ ...s.contactLabel, color: "rgba(250,204,21,0.5)", marginBottom: 4 }}>
                          Nota de seguimiento
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{c.nota}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Enviar Correo */}
      <AnimatePresence>
        {correoContacto && (
          <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCorreoContacto(null)}>
            <motion.div style={{ ...s.modalBox, maxWidth: 480 }} variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <div>
                  <div style={s.modalTitle}>Enviar correo</div>
                  <div style={s.modalSubtitle}>Para: {correoContacto.correo}</div>
                </div>
                <button onClick={() => setCorreoContacto(null)} style={s.modalCloseBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}><X size={15} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={s.contactLabel}>Remitente</div>
                  <select value={cuentaSeleccionada} onChange={(e) => setCuentaSeleccionada(e.target.value)}
                    style={{
                      width: "100%", height: 36, marginTop: 6,
                      background: "#131720", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, color: "#e2e8f0", fontSize: 13,
                      padding: "0 12px", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                    }}>
                    {cuentas.length === 0 && <option value="">Sin cuentas configuradas</option>}
                    {cuentas.map((c) => (
                      <option key={c._id} value={c._id}>{c.nombre} — {c.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <div style={s.contactLabel}>Asunto</div>
                  <input type="text" placeholder="Asunto del correo"
                    value={correoForm.asunto} onChange={(e) => setCorreoForm({ ...correoForm, asunto: e.target.value })}
                    style={{ ...s.searchInput, padding: "0 12px", width: "100%", boxSizing: "border-box", marginTop: 6 }}
                    onFocus={(e) => e.target.style.borderColor = "rgba(99,130,246,0.5)"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
                <div>
                  <div style={s.contactLabel}>Mensaje</div>
                  <textarea placeholder="Escribe tu mensaje aquí..."
                    value={correoForm.mensaje} onChange={(e) => setCorreoForm({ ...correoForm, mensaje: e.target.value })}
                    rows={6}
                    style={{
                      width: "100%", marginTop: 6, padding: "10px 12px",
                      background: "#131720", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, color: "#e2e8f0", fontSize: 13,
                      fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", outline: "none",
                    }}
                    onFocus={(e) => e.target.style.borderColor = "rgba(99,130,246,0.5)"}
                    onBlur={(e)  => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
                <div>
                  <div style={s.contactLabel}>Adjuntos</div>
                  <label style={{
                    display: "flex", alignItems: "center", gap: 8, marginTop: 6,
                    padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                    border: "1px dashed rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)",
                    fontSize: 12, transition: "border-color 0.15s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(99,130,246,0.4)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}>
                    <Paperclip size={13} />Seleccionar archivos
                    <input type="file" multiple style={{ display: "none" }}
                      onChange={(e) => setCorreoForm({ ...correoForm, adjuntos: [...correoForm.adjuntos, ...Array.from(e.target.files)] })} />
                  </label>
                  {correoForm.adjuntos.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                      {correoForm.adjuntos.map((file, i) => (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "5px 10px", borderRadius: 6,
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                        }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {file.name}
                          </span>
                          <button onClick={() => setCorreoForm({ ...correoForm, adjuntos: correoForm.adjuntos.filter((_, j) => j !== i) })}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", padding: "0 4px", fontSize: 14, lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" onClick={handleEnviarCorreo} disabled={enviandoCorreo}
                  style={{
                    height: 38, borderRadius: 8,
                    background: enviandoCorreo ? "rgba(59,91,255,0.4)" : "#3b5bff",
                    border: "none", color: "#fff", fontSize: 13, fontWeight: 500,
                    cursor: enviandoCorreo ? "not-allowed" : "pointer",
                    fontFamily: "inherit", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 6, transition: "background 0.15s",
                  }}>
                  <Mail size={14} />
                  {enviandoCorreo ? "Enviando..." : "Enviar correo"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Historial */}
      <AnimatePresence>
        {verHistorial && (
          <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setVerHistorial(false)}>
            <motion.div style={{ ...s.modalBox, maxWidth: 520 }} variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <div>
                  <div style={s.modalTitle}>Historial de contactos</div>
                  <div style={s.modalSubtitle}>{verHistorial.empresa}</div>
                </div>
                <button onClick={() => setVerHistorial(false)} style={s.modalCloseBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}><X size={15} /></button>
              </div>
              <div>
                {historial.length === 0 ? (
                  <div style={s.empty}>Sin correos enviados aún</div>
                ) : (
                  historial.map((h, i) => (
                    <div key={i} style={{ ...s.contactCard, marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{h.asunto}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap", marginLeft: 10 }}>
                          {new Date(h.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                        Para: {h.contactoNombre} — {h.contactoCorreo}
                      </div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                        {h.mensaje.length > 120 ? h.mensaje.slice(0, 120) + "…" : h.mensaje}
                      </div>
                      {h.enviadoPor && (
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>
                          Enviado por: {h.enviadoPor.nombre}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}