import { useEffect, useState, useCallback } from "react";
import Layout from "../components/layout/Layout";
import ProveedorForm from "../components/proveedores/ProveedorForm";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Search, ChevronDown,
  X, Building2, Users, MapPin, Phone,
} from "lucide-react";
import {
  getProveedores, createProveedor, updateProveedor, deleteProveedor,
} from "../services/proveedorService";

const modalVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.96, y: 16 },
};

export default function Proveedores() {
  const [proveedores,    setProveedores]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [filtroEstado,   setFiltroEstado]   = useState("todos");
  const [showForm,       setShowForm]       = useState(false);
  const [editData,       setEditData]       = useState(null);
  const [detailProveedor, setDetailProveedor] = useState(null);
  const [detailProveedorLive, setDetailProveedorLive] = useState(null);
  const [telefonosProveedor, setTelefonosProveedor] = useState(null);

  useEffect(() => { setDetailProveedorLive(detailProveedor); }, [detailProveedor]);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudieron cargar los proveedores" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // Estados únicos para el filtro
  const estadosUnicos = ["todos", ...new Set(
    proveedores.map((p) => p.estado).filter(Boolean)
  )];

  const proveedoresFiltrados = proveedores
    .filter((p) => {
      const q = search.toLowerCase();
      const coincideBusqueda =
        p.empresa?.toLowerCase().includes(q) ||
        p.giroEmpresa?.toLowerCase().includes(q) ||
        p.telefono?.toLowerCase().includes(q) ||
        p.estado?.toLowerCase().includes(q) ||
        p.telefonosExtra?.some((t) => t.numero?.toLowerCase().includes(q));
      const coincideEstado =
        filtroEstado === "todos" || p.estado === filtroEstado;
      return coincideBusqueda && coincideEstado;
    })
    .sort((a, b) => (a.empresa?.toLowerCase() || "").localeCompare(b.empresa?.toLowerCase() || ""));

  const handleSubmit = async (formData) => {
    try {
      if (editData) {
        await updateProveedor(editData._id, formData);
        Swal.fire({ icon: "success", title: "Proveedor actualizado", timer: 1500, showConfirmButton: false });
      } else {
        await createProveedor(formData);
        Swal.fire({ icon: "success", title: "Proveedor creado", timer: 1500, showConfirmButton: false });
      }
      setShowForm(false);
      setEditData(null);
      cargar();
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo guardar el proveedor" });
    }
  };

  const handleEdit = (p) => {
    setEditData(p);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar proveedor?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, eliminar",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteProveedor(id);
      Swal.fire({ icon: "success", title: "Eliminado", timer: 1200, showConfirmButton: false });
      cargar();
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar el proveedor" });
    }
  };

  const s = {
    page:        { display: "flex", flexDirection: "column", gap: 20, height: "100%", fontFamily: "inherit" },
    header:      { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 },
    title:       { fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 },
    subtitle:    { fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 },
    addBtn:      { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: "#3b5bff", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
    toolbar:     { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
    searchWrap:  { position: "relative", flex: 1, minWidth: 200 },
    searchIcon:  { position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.25)", pointerEvents: "none" },
    searchInput: { width: "100%", paddingLeft: 34, paddingRight: 12, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
    filterWrap:  { position: "relative" },
    filterBtn:   { display: "flex", alignItems: "center", gap: 6, padding: "0 12px", height: 36, borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
    dropdown:    { position: "absolute", top: "calc(100% + 6px)", right: 0, background: "#1a1f2e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, zIndex: 50, minWidth: 160, overflow: "hidden" },
    dropItem:    { padding: "8px 14px", fontSize: 12, cursor: "pointer", color: "rgba(255,255,255,0.6)", fontFamily: "inherit", background: "none", border: "none", width: "100%", textAlign: "left" },
    tableWrap:   { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, overflow: "auto", flex: 1 },
    table:       { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th:          { padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" },
    td:          { padding: "10px 14px", color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.04)", verticalAlign: "middle" },
    actionBtn:   { background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 5, display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" },
    modalBackdrop: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
    modalBox:    { background: "#13171f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 22, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" },
    modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
    modalTitle:  { fontSize: 15, fontWeight: 600, color: "#fff" },
    modalSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 },
    modalCloseBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: 5, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" },
  };

  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);

  return (
    <Layout>
      <div style={s.page}>

        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Proveedores</h1>
            <div style={s.subtitle}>
              {proveedoresFiltrados.length} de {proveedores.length} proveedores
            </div>
          </div>
          <button style={s.addBtn} onClick={() => { setEditData(null); setShowForm(true); }}>
            <Plus size={15} /> Nuevo proveedor
          </button>
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.searchWrap}>
            <Search size={14} style={s.searchIcon} />
            <input
              style={s.searchInput}
              placeholder="Buscar proveedor, giro, teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro por estado */}
          <div style={s.filterWrap}>
            <button style={s.filterBtn} onClick={() => setShowEstadoDropdown((v) => !v)}>
              <MapPin size={13} />
              {filtroEstado === "todos" ? "Todos los estados" : filtroEstado}
              <ChevronDown size={12} />
            </button>
            {showEstadoDropdown && (
              <div style={s.dropdown}>
                {estadosUnicos.map((est) => (
                  <button key={est} style={{
                    ...s.dropItem,
                    color: filtroEstado === est ? "#818cf8" : "rgba(255,255,255,0.6)",
                    background: filtroEstado === est ? "rgba(99,130,246,0.08)" : "none",
                  }}
                    onClick={() => { setFiltroEstado(est); setShowEstadoDropdown(false); }}
                  >
                    {est === "todos" ? "Todos los estados" : est}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div style={s.tableWrap}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Cargando...</div>
          ) : proveedoresFiltrados.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              {search || filtroEstado !== "todos" ? "Sin resultados para esta búsqueda" : "No hay proveedores registrados"}
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {["Empresa", "Giro", "Teléfono", "Estado", "Contactos", "Acciones"].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {proveedoresFiltrados.map((p) => (
                  <tr key={p._id}
                    onMouseEnter={(e) => [...e.currentTarget.children].forEach(td => td.style.background = "rgba(255,255,255,0.018)")}
                    onMouseLeave={(e) => [...e.currentTarget.children].forEach(td => td.style.background = "transparent")}
                  >
                    <td style={{ ...s.td, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <Building2 size={13} style={{ color: "#818cf8", flexShrink: 0 }} />
                        <button onClick={() => setDetailProveedor(p)}
                          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit", padding: 0, textAlign: "left" }}>
                          {p.empresa}
                        </button>
                      </div>
                    </td>
                    <td style={s.td}>{p.giroEmpresa || <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>}</td>
                    <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span>{p.telefono || <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>}</span>
                        {p.telefonosExtra?.length > 0 && (
                          <button onClick={() => setTelefonosProveedor(p)}
                            title="Ver todos los teléfonos"
                            style={{ fontSize: 10, fontWeight: 600, color: "#818cf8", background: "rgba(99,130,246,0.12)", border: "1px solid rgba(99,130,246,0.2)", borderRadius: 20, padding: "1px 6px", cursor: "pointer", fontFamily: "inherit" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(99,130,246,0.22)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(99,130,246,0.12)"}
                          >
                            +{p.telefonosExtra.length}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={s.td}>{p.estado || <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>}</td>
                    <td style={s.td}>
                      {p.contactos?.length > 0 ? (
                        <button onClick={() => setDetailProveedor(p)}
                          style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", padding: 0 }}>
                          <Users size={12} />
                          {p.contactos.length} contacto{p.contactos.length !== 1 ? "s" : ""}
                        </button>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.13)" }}>—</span>
                      )}
                    </td>
                    <td style={{ ...s.td, whiteSpace: "nowrap" }}>
                      <button style={s.actionBtn} title="Editar"
                        onClick={() => handleEdit(p)}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                        <Pencil size={13} style={{ color: "#818cf8" }} />
                      </button>
                      <button style={s.actionBtn} title="Eliminar"
                        onClick={() => handleDelete(p._id)}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}>
                        <Trash2 size={13} style={{ color: "#f87171" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal form */}
        <AnimatePresence>
          {showForm && (
            <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowForm(false); setEditData(null); }}>
              <motion.div style={{ ...s.modalBox, maxWidth: 600 }} variants={modalVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}>
                <div style={s.modalHeader}>
                  <div>
                    <div style={s.modalTitle}>{editData ? "Editar proveedor" : "Nuevo proveedor"}</div>
                    <div style={s.modalSubtitle}>{editData ? editData.empresa : "Completa los datos del proveedor"}</div>
                  </div>
                  <button onClick={() => { setShowForm(false); setEditData(null); }} style={s.modalCloseBtn}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                    <X size={15} />
                  </button>
                </div>
                <ProveedorForm
                    initialData={editData}
                    onSubmit={handleSubmit}
                    onCancel={() => { setShowForm(false); setEditData(null); }}
                  />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal teléfonos */}
        <AnimatePresence>
          {telefonosProveedor && (
            <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setTelefonosProveedor(null)}>
              <motion.div style={{ ...s.modalBox, maxWidth: 380 }} variants={modalVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}>
                <div style={s.modalHeader}>
                  <div>
                    <div style={s.modalTitle}>Teléfonos</div>
                    <div style={s.modalSubtitle}>{telefonosProveedor.empresa}</div>
                  </div>
                  <button onClick={() => setTelefonosProveedor(null)} style={s.modalCloseBtn}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                    <X size={15} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {telefonosProveedor.telefono && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{telefonosProveedor.telefono}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Principal</span>
                    </div>
                  )}
                  {telefonosProveedor.telefonosExtra?.map((tel, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{tel.numero}</span>
                      {tel.tipo && <span style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{tel.tipo}</span>}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal contactos */}
        <AnimatePresence>
          {detailProveedorLive && (
            <motion.div style={s.modalBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDetailProveedor(null)}>
              <motion.div style={{ ...s.modalBox, maxWidth: 480 }} variants={modalVariants}
                initial="hidden" animate="visible" exit="exit"
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}>
                <div style={s.modalHeader}>
                  <div>
                    <div style={s.modalTitle}>Contactos</div>
                    <div style={s.modalSubtitle}>{detailProveedorLive.empresa}</div>
                  </div>
                  <button onClick={() => setDetailProveedor(null)} style={s.modalCloseBtn}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                    <X size={15} />
                  </button>
                </div>
                {detailProveedorLive.contactos?.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                    Sin contactos registrados
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {detailProveedorLive.contactos.map((c, i) => (
                      <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", marginBottom: 4 }}>{c.nombre || "Sin nombre"}</div>
                        {c.puesto && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>{c.puesto}</div>}
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {c.correo && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>✉ {c.correo}</div>}
                          {c.telefonos?.filter(t => t.numero).map((t, j) => (
                            <div key={j} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                              <Phone size={10} style={{ display: "inline", marginRight: 4 }} />
                              {t.tipo ? `${t.tipo}: ` : ""}{t.numero}
                            </div>
                          ))}
                          {c.nota && <div style={{ fontSize: 11, color: "rgba(250,204,21,0.6)", marginTop: 4 }}>✦ {c.nota}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
}