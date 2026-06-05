import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ParqueForm from "../components/parques/ParqueForm";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, MapPin, X } from "lucide-react";
import api from "../services/api";

import {
  getParques,
  createParque,
  updateParque,
  deleteParque,
} from "../services/parqueService";

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.97, y: 12 },
  visible: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.97, y: 12 },
};

const s = {
  pageWrap: { fontFamily: "'DM Sans', sans-serif" },

  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  title: { fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.9)" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 3 },

  newBtn: {
    height: 34, padding: "0 14px",
    borderRadius: 7,
    background: "#3b82f6",
    border: "none",
    color: "#fff",
    fontSize: 13, fontWeight: 500,
    display: "flex", alignItems: "center", gap: 6,
    cursor: "pointer",
    transition: "background 0.15s",
  },

  searchWrap: { position: "relative", marginBottom: 14 },
  searchInput: {
    width: "100%", height: 36,
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(255,255,255,0.08)",
    borderRadius: 7,
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    padding: "0 10px 0 34px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s, background 0.15s",
  },

  tableWrap: {
    borderRadius: 8,
    border: "0.5px solid rgba(255,255,255,0.07)",
    overflow: "hidden",
    background: "#0c0f18",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    padding: "9px 14px",
    textAlign: "left",
    fontSize: 10, fontWeight: 600,
    color: "rgba(255,255,255,0.22)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    background: "rgba(255,255,255,0.025)",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "11px 14px",
    color: "rgba(255,255,255,0.6)",
    borderTop: "0.5px solid rgba(255,255,255,0.04)",
    verticalAlign: "middle",
    fontSize: 13,
  },

  actBtn: (variant) => ({
    width: 28, height: 28,
    borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    border: "0.5px solid rgba(255,255,255,0.07)",
    background: "transparent",
    color: variant === "edit" ? "#fbbf24" : "#f87171",
    transition: "all 0.15s",
  }),

  modalBackdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.65)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 50, padding: 16,
  },
  modalBox: {
    background: "#0f1117",
    border: "0.5px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    width: "100%", maxWidth: 480,
    maxHeight: "90vh", overflowY: "auto",
    padding: 24,
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  modalTitle: { fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.9)" },

  empty: { padding: "40px 0", textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 },

  /* Highlight para fila encontrada desde búsqueda */
  highlightRow: { background: "rgba(59,91,255,0.06)" },
};

export default function ParquesIndustriales() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [parques, setParques]             = useState([]);
  const [open, setOpen]                   = useState(false);
  const [search, setSearch]               = useState("");
  const [editingParque, setEditingParque] = useState(null);

  const cargarParques = useCallback(async () => {
    try {
      const data = await getParques();
      setParques(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { cargarParques(); }, [cargarParques]);

  /* Lee ?search= al montar y pre-llena el buscador */
  useEffect(() => {
    const searchFromQuery = searchParams.get("search");
    if (searchFromQuery) {
      setSearch(decodeURIComponent(searchFromQuery));
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (data) => {
    try {
      await createParque(data);
      await cargarParques();
      setOpen(false);
      Swal.fire({ icon: "success", title: "Parque creado", timer: 1400, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo crear el parque" });
    }
  };

  const handleUpdate = async (data) => {
  const { value: password } = await Swal.fire({
    title: "Confirmar edición",
    input: "password",
    inputLabel: "Ingresa tu contraseña para continuar",
    inputPlaceholder: "Contraseña",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#475569",
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  if (!password) return;

  try {
    await api.post("/auth/verify-password", { password });
  } catch {
    Swal.fire({ icon: "error", title: "Contraseña incorrecta", timer: 1400, showConfirmButton: false });
    return;
  }

  try {
    await updateParque(editingParque._id, data);
    await cargarParques();
    setEditingParque(null);
    Swal.fire({ icon: "success", title: "Parque actualizado", timer: 1400, showConfirmButton: false });
  } catch {
    Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar" });
  }
};

const handleDelete = async (id) => {
  const { value: password } = await Swal.fire({
    title: "Confirmar eliminación",
    input: "password",
    inputLabel: "Ingresa tu contraseña para continuar",
    inputPlaceholder: "Contraseña",
    showCancelButton: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#475569",
    confirmButtonText: "Eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  if (!password) return;

  try {
    await api.post("/auth/verify-password", { password });
  } catch {
    Swal.fire({ icon: "error", title: "Contraseña incorrecta", timer: 1400, showConfirmButton: false });
    return;
  }

  try {
    await deleteParque(id);
    await cargarParques();
    Swal.fire({ icon: "success", title: "Parque eliminado", timer: 1400, showConfirmButton: false });
  } catch {
    Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar el parque" });
  }
};

  const parquesFiltrados = parques.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nombre?.toLowerCase().includes(q) ||
      p.estado?.toLowerCase().includes(q) ||
      p.municipio?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div style={s.pageWrap}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <div style={s.title}>Parques Industriales</div>
            <div style={s.subtitle}>{parques.length} parques registrados</div>
          </div>
          <button
            onClick={() => setOpen(true)}
            style={s.newBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
          >
            <Plus size={14} />
            Nuevo parque
          </button>
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Buscar por nombre, estado o municipio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={s.searchInput}
            onFocus={(e) => { e.target.style.borderColor = "rgba(59,130,246,0.4)"; e.target.style.background = "rgba(255,255,255,0.06)"; }}
            onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.background = "rgba(255,255,255,0.04)"; }}
          />
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["Nombre", "Estado", "Municipio", "Dirección", "Acciones"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parquesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} style={s.empty}>
                    {search ? "Sin resultados para esa búsqueda" : "No hay parques registrados"}
                  </td>
                </tr>
              ) : (
                parquesFiltrados.map((parque) => (
                  <tr
                    key={parque._id}
                    onMouseEnter={(e) => [...e.currentTarget.children].forEach(td => td.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => [...e.currentTarget.children].forEach(td => td.style.background = "transparent")}
                  >
                    <td style={s.td}>
                      <div style={{ fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
                        {parque.nombre}
                      </div>
                    </td>
                    <td style={s.td}>
                      {parque.estado ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "2px 8px", borderRadius: 5,
                          fontSize: 11, fontWeight: 500,
                          background: "rgba(99,102,241,0.1)", color: "#a5b4fc",
                        }}>
                          <MapPin size={9} />
                          {parque.estado}
                        </span>
                      ) : <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
                    </td>
                    <td style={s.td}>
                      {parque.municipio || <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
                    </td>
                    <td style={{ ...s.td, maxWidth: 200 }}>
                      <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 195 }} title={parque.direccion}>
                        {parque.direccion || <span style={{ color: "rgba(255,255,255,0.15)" }}>—</span>}
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button
                          onClick={() => setEditingParque(parque)}
                          style={s.actBtn("edit")}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(251,191,36,0.08)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          title="Editar"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(parque._id)}
                          style={s.actBtn("delete")}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          title="Eliminar"
                        >
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

        {/* Contador */}
        {parquesFiltrados.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "right" }}>
            {parquesFiltrados.length} {parquesFiltrados.length === 1 ? "parque" : "parques"}
            {search && " encontrados"}
          </div>
        )}
      </div>

      {/* Modal Crear */}
      <AnimatePresence>
        {open && (
          <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={s.modalBox} variants={modalVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.18 }}>
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>Nuevo parque industrial</div>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>
              <ParqueForm onSubmit={handleCreate} onCancel={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Editar */}
      <AnimatePresence>
        {editingParque && (
          <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={s.modalBox} variants={modalVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.18 }}>
              <div style={s.modalHeader}>
                <div style={s.modalTitle}>Editar parque industrial</div>
                <button onClick={() => setEditingParque(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                  <X size={18} />
                </button>
              </div>
              <ParqueForm initialData={editingParque} onSubmit={handleUpdate} onCancel={() => setEditingParque(null)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}