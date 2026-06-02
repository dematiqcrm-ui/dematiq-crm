import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import EmpresaForm from "../components/empresas/EmpresaForm";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, ExternalLink, Search, ChevronDown, X, Building2, Users } from "lucide-react";

import { getParques } from "../services/parqueService";
import {
  getEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
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
    height: 36, padding: "0 14px",
    borderRadius: 8,
    background: "#3b5bff",
    border: "1px solid rgba(99,130,246,0.4)",
    color: "#fff",
    fontSize: 13, fontWeight: 500,
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer",
    transition: "background 0.15s",
    fontFamily: "inherit",
  },

  filtersRow: { display: "flex", gap: 10, marginBottom: 16 },
  selectWrap: { position: "relative", flex: "1.3", minWidth: 0 },
  searchWrap: { position: "relative", flex: 2, minWidth: 0 },

  selectInput: {
    width: "100%", height: 36,
    background: "#131720", backgroundColor: "#131720",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    color: "#e2e8f0", fontSize: 13, padding: "0 32px 0 12px",
    outline: "none", appearance: "none", WebkitAppearance: "none",
    cursor: "pointer", fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.15s",
  },
  searchInput: {
    width: "100%", height: 36,
    background: "#131720", backgroundColor: "#131720",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
    color: "#e2e8f0", fontSize: 13, padding: "0 12px 0 34px",
    outline: "none", appearance: "none", WebkitAppearance: "none",
    fontFamily: "inherit", boxSizing: "border-box",
    transition: "border-color 0.15s, background 0.15s",
  },

  tableWrap: {
    borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden", background: "#0c0f18",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    padding: "9px 12px", textAlign: "left",
    fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.2)",
    textTransform: "uppercase", letterSpacing: "0.08em",
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

export default function Empresas() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [parques, setParques]                       = useState([]);
  const [parqueSeleccionado, setParqueSeleccionado] = useState("");
  const [empresas, setEmpresas]                     = useState([]);
  const [search, setSearch]                         = useState("");
  const [open, setOpen]                             = useState(false);
  const [editingEmpresa, setEditingEmpresa]         = useState(null);
  const [detailEmpresa, setDetailEmpresa]           = useState(null);

  /* ─── Carga parques, aplica ?parque= y ?search= del query string ─── */
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
    /* Solo limpiar la búsqueda si el cambio de parque fue manual (no desde query string) */
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
    const result = await Swal.fire({
      title: "¿Eliminar empresa?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626", cancelButtonColor: "#475569",
      confirmButtonText: "Sí, eliminar", cancelButtonText: "Cancelar",
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;
    try {
      await deleteEmpresa(id);
      await cargarEmpresas();
      Swal.fire({ icon: "success", title: "Empresa eliminada", timer: 1400, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar la empresa" });
    }
  };

  const empresasFiltradas = empresas.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.empresa?.toLowerCase().includes(q) ||
      e.giroEmpresa?.toLowerCase().includes(q) ||
      e.numero?.toLowerCase().includes(q) ||
      e.telefono?.toLowerCase().includes(q)
    );
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
          <button
            onClick={() => setOpen(true)}
            disabled={!parqueSeleccionado}
            style={{ ...s.newBtn, opacity: parqueSeleccionado ? 1 : 0.4, cursor: parqueSeleccionado ? "pointer" : "not-allowed" }}
            onMouseEnter={(e) => { if (parqueSeleccionado) e.currentTarget.style.background = "#2e4ee0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#3b5bff"; }}
          >
            <Plus size={14} />
            Nueva empresa
          </button>
        </div>

        {/* Filtros */}
        <div style={s.filtersRow}>
          <div style={s.selectWrap}>
            <select
              value={parqueSeleccionado}
              onChange={(e) => setParqueSeleccionado(e.target.value)}
              style={s.selectInput}
              onFocus={(e) => { e.target.style.borderColor = "rgba(99,130,246,0.5)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              {parques.length === 0 && <option value="">Sin parques</option>}
              {parques.map((p) => (
                <option key={p._id} value={p._id} style={{ background: "#131720", color: "#e2e8f0" }}>{p.nombre}</option>
              ))}
            </select>
            <ChevronIcon />
          </div>

          <div style={s.searchWrap}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar empresa, giro, teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={s.searchInput}
              onFocus={(e) => { e.target.style.borderColor = "rgba(99,130,246,0.5)"; e.target.style.background = "#16192a"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.background = "#131720"; }}
            />
          </div>
        </div>

        {/* Tabla */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["#", "Empresa", "Giro", "Dirección", "Teléfono", "Página web", "Contactos", "Acciones"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!parqueSeleccionado ? (
                <tr>
                  <td colSpan={8} style={s.empty}>
                    <Building2 size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.2 }} />
                    Selecciona un parque industrial
                  </td>
                </tr>
              ) : empresasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} style={s.empty}>
                    <Building2 size={28} style={{ margin: "0 auto 8px", display: "block", opacity: 0.2 }} />
                    Sin empresas en este parque
                  </td>
                </tr>
              ) : (
                empresasFiltradas.map((empresa) => (
                  <tr
                    key={empresa._id}
                    style={{ transition: "background 0.1s" }}
                    onMouseEnter={(e) => { [...e.currentTarget.children].forEach(td => td.style.background = "rgba(255,255,255,0.018)"); }}
                    onMouseLeave={(e) => { [...e.currentTarget.children].forEach(td => td.style.background = "transparent"); }}
                  >
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
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 155 }} title={empresa.direccion}>
                        {empresa.direccion || <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>}
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
                        <button
                          onClick={() => setDetailEmpresa(empresa)}
                          style={{
                            background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)",
                            color: "#34d399", fontSize: 11, fontWeight: 500,
                            cursor: "pointer", padding: "3px 9px", borderRadius: 6, fontFamily: "inherit",
                            display: "flex", alignItems: "center", gap: 4, transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(52,211,153,0.14)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(52,211,153,0.08)"}
                        >
                          <Users size={10} />
                          {empresa.contactos.length} {empresa.contactos.length === 1 ? "contacto" : "contactos"}
                        </button>
                      ) : <span style={{ color: "rgba(255,255,255,0.13)", fontSize: 12 }}>—</span>}
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 5 }}>
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
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                  <X size={15} />
                </button>
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
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                  <X size={15} />
                </button>
              </div>
              <EmpresaForm initialData={editingEmpresa} parqueIndustrialId={parqueSeleccionado} onSubmit={handleUpdate} onCancel={() => setEditingEmpresa(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Contactos */}
      <AnimatePresence>
        {detailEmpresa && (
          <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailEmpresa(null)}>
            <motion.div style={{ ...s.modalBox, maxWidth: 480 }} variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <div>
                  <div style={s.modalTitle}>Contactos</div>
                  <div style={s.modalSubtitle}>{detailEmpresa.empresa}</div>
                </div>
                <button onClick={() => setDetailEmpresa(null)} style={s.modalCloseBtn}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                  <X size={15} />
                </button>
              </div>
              <div>
                {detailEmpresa.contactos.map((c, i) => (
                  <div key={i} style={s.contactCard}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "rgba(99,130,246,0.12)", border: "1px solid rgba(99,130,246,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 600, color: "#818cf8", flexShrink: 0,
                      }}>
                        {c.nombre ? c.nombre.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
                          {c.nombre || <span style={{ color: "rgba(255,255,255,0.2)" }}>Sin nombre</span>}
                        </div>
                        {c.puesto && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{c.puesto}</div>}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                      {[
                        { label: "Correo", value: c.correo ? <a href={`mailto:${c.correo}`} style={{ color: "#60a5fa", textDecoration: "none", fontSize: 12 }}>{c.correo}</a> : null },
                        { label: "Teléfono", value: c.telefono },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <div style={s.contactLabel}>{label}</div>
                          <div style={s.contactValue}>{value || <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 12 }}>—</span>}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}