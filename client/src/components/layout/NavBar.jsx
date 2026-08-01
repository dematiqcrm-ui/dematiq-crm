import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Bell, LogOut, X, CheckCheck, Eye, Loader2,
  History, FileSpreadsheet, FileText, Database,
} from "lucide-react";
import { useAccesibilidad } from "../../context/AccesibilidadContext";

const routeNames = {
  "/clientes": "Clientes",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
  "/parques": "Parques industriales",
  "/empresas": "Empresas",
  "/proveedores": "Proveedores",
};

// Ajusta esto a tu configuración real (o importa tu instancia de axios si ya tienes una)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const authHeaders = () => {
  const token = localStorage.getItem("token"); // ajusta si guardas el token distinto
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Convierte una fecha ISO a "Hace X min / horas / días"
const tiempoRelativo = (fecha) => {
  const diffMs = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Ahora mismo";
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} ${horas === 1 ? "hora" : "horas"}`;
  const dias = Math.floor(horas / 24);
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;
  return new Date(fecha).toLocaleDateString("es-MX");
};

// Ícono según el formato exportado
const iconoFormato = (formato) => {
  if (formato === "excel") return <FileSpreadsheet size={14} color="#22c55e" />;
  if (formato === "pdf") return <FileText size={14} color="#ef4444" />;
  if (formato === "backup") return <Database size={14} color="#3b82f6" />;
  return <FileText size={14} color="rgba(255,255,255,0.4)" />;
};

const etiquetaFormato = (formato) => {
  if (formato === "excel") return "Excel";
  if (formato === "pdf") return "PDF";
  if (formato === "backup") return "Backup";
  return formato;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { altoContraste, toggleAltoContraste } = useAccesibilidad();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const notifRef = useRef(null);

  // ─── Auditoría de exportaciones ───────────────────────────────────────────
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const pageName = routeNames[location.pathname] ?? "Página";
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // ─── Cargar notificaciones desde la API ──────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("No se pudieron cargar las notificaciones");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    } finally {
      setLoadingNotif(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Refresca cada 60s para simular notificaciones "en vivo"
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ─── Cargar auditoría de exportaciones (solo al abrir el modal) ──────────
  const fetchAuditLogs = useCallback(async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch(`${API_URL}/api/export/auditoria`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("No se pudo cargar la auditoría");
      const data = await res.json();
      setAuditLogs(data);
    } catch (err) {
      console.error("Error cargando auditoría de exportaciones:", err);
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  const openAudit = () => {
    setAuditOpen(true);
    fetchAuditLogs();
  };

  // Cerrar modal de auditoría con Escape
  useEffect(() => {
    if (!auditOpen) return;
    const handler = (e) => {
      if (e.key === "Escape") setAuditOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [auditOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const styleId = "alto-contraste-style";
    let existing = document.getElementById(styleId);

    if (altoContraste) {
      if (!existing) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `
          * { color: #ffffff !important; }
          a { color: #60a5fa !important; }
          input, textarea, select { color: #ffffff !important; background-color: #1a1f2e !important; }
          [style*="background"] { background-color: inherit; }
        `;
        document.head.appendChild(style);
      }
    } else {
      if (existing) existing.remove();
    }

    document.body.style.filter = "";
  }, [altoContraste]);

  // ─── Marcar todas como leídas ─────────────────────────────────────────────
  const markAllRead = async () => {
    const prev = notifications;
    setNotifications((p) => p.map((n) => ({ ...n, read: true }))); // optimista
    try {
      const res = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      console.error("Error marcando todas como leídas:", err);
      setNotifications(prev); // revertir si falla
    }
  };

  // ─── Descartar una notificación ────────────────────────────────────────────
  const dismissNotif = async (id) => {
    const prev = notifications;
    setNotifications((p) => p.filter((n) => n._id !== id)); // optimista
    try {
      const res = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
    } catch (err) {
      console.error("Error descartando notificación:", err);
      setNotifications(prev); // revertir si falla
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header style={s.header}>
      {/* Izquierda */}
      <div>
        <div style={s.greeting}>
          {getGreeting()}
          {user?.nombre ? `, ${user.nombre}` : ""}
        </div>
        <div style={s.pageName}>{pageName}</div>
      </div>

      {/* Derecha */}
      <div style={s.right}>
        {/* Alto contraste */}
        <button
          onClick={toggleAltoContraste}
          title="Alto contraste"
          style={{
            ...s.iconBtn,
            background: altoContraste ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
            borderColor: altoContraste ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.08)",
          }}
        >
          <Eye size={14} color={altoContraste ? "#fff" : "rgba(255,255,255,0.55)"} />
        </button>

        {/* Auditoría de exportaciones */}
        <button
          onClick={openAudit}
          title="Auditoría de exportaciones"
          style={{
            ...s.iconBtn,
            background: auditOpen ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
            borderColor: auditOpen ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.08)",
          }}
          aria-label="Auditoría de exportaciones"
        >
          <History size={14} color="rgba(255,255,255,0.55)" />
        </button>

        {/* Notificaciones */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            style={{
              ...s.iconBtn,
              background: notifOpen ? "rgba(59,130,246,0.12)" : "rgba(255,255,255,0.04)",
              borderColor: notifOpen ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.08)",
            }}
            aria-label="Notificaciones"
          >
            <Bell size={14} color="rgba(255,255,255,0.55)" />
          </button>

          {/* Badge */}
          {unreadCount > 0 && (
            <div style={s.badge}>{unreadCount > 9 ? "9+" : unreadCount}</div>
          )}

          {/* Panel dropdown */}
          {notifOpen && (
            <div style={s.panel}>
              {/* Header del panel */}
              <div style={s.panelHeader}>
                <span style={s.panelTitle}>Notificaciones</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={s.markAllBtn}>
                    <CheckCheck size={12} />
                    Marcar todas
                  </button>
                )}
              </div>

              {/* Lista */}
              <div style={s.notifList}>
                {loadingNotif ? (
                  <div style={s.empty}>
                    <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={s.empty}>Sin notificaciones nuevas</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        ...s.notifItem,
                        background: n.read ? "transparent" : "rgba(59,130,246,0.05)",
                      }}
                    >
                      {/* Dot */}
                      <div style={{ ...s.dot, opacity: n.read ? 0 : 1 }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.notifTitle}>{n.title}</div>
                        {n.description && <div style={s.notifDesc}>{n.description}</div>}
                        <div style={s.notifTime}>{tiempoRelativo(n.createdAt)}</div>
                      </div>

                      <button
                        onClick={() => dismissNotif(n._id)}
                        style={s.dismissBtn}
                        aria-label="Descartar"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Nombre usuario */}
        <span style={s.userName}>{user?.nombre}</span>

        {/* Salir */}
        <button onClick={handleLogout} style={s.logoutBtn}>
          <LogOut size={13} />
          Salir
        </button>
      </div>

      {/* ─── Modal de auditoría de exportaciones ─────────────────────────── */}
      {auditOpen && (
        <div style={s.overlay} onClick={() => setAuditOpen(false)}>
          <div style={s.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <History size={16} color="#3b82f6" />
                <span style={s.panelTitle}>Auditoría de exportaciones</span>
              </div>
              <button onClick={() => setAuditOpen(false)} style={s.modalCloseBtn} aria-label="Cerrar">
                <X size={14} />
              </button>
            </div>

            <div style={s.auditList}>
              {loadingAudit ? (
                <div style={s.empty}>
                  <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={s.empty}>Sin exportaciones registradas</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log._id} style={s.auditItem}>
                    <div style={s.auditIconWrap}>{iconoFormato(log.formato)}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={s.notifTitle}>
                        Exportación {etiquetaFormato(log.formato)}
                        {log.usuarioNombre ? ` — ${log.usuarioNombre}` : ""}
                      </div>
                      <div style={s.notifDesc}>
                        {log.filtroTipo === "todo" || !log.filtroValor
                          ? "Todos los registros"
                          : `${log.filtroTipo}: ${log.filtroValor}`}
                        {" · "}
                        {log.totalRegistros} registro{log.totalRegistros === 1 ? "" : "s"}
                      </div>
                      <div style={s.notifTime}>{tiempoRelativo(log.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const s = {
  header: {
    height: 60,
    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
    background: "#0c0f18",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    flexShrink: 0,
    position: "relative",
    zIndex: 100,
  },
  greeting: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
  },
  pageName: {
    fontSize: 18,
    fontWeight: 600,
    color: "#fff",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    background: "#3b82f6",
    color: "#fff",
    fontSize: 9,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 3px",
    pointerEvents: "none",
    border: "2px solid #0c0f18",
  },
  panel: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    width: 320,
    background: "#0c0f18",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
    overflow: "hidden",
    zIndex: 200,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#f1f5f9",
  },
  markAllBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "transparent",
    border: "none",
    color: "#3b82f6",
    fontSize: 11,
    cursor: "pointer",
    padding: 0,
  },
  notifList: {
    maxHeight: 320,
    overflowY: "auto",
  },
  empty: {
    padding: "28px 16px",
    display: "flex",
    justifyContent: "center",
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.25)",
  },
  notifItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    transition: "background 0.15s",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#3b82f6",
    flexShrink: 0,
    marginTop: 5,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#e2e8f0",
    marginBottom: 2,
  },
  notifDesc: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 1.5,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 10,
    color: "rgba(255,255,255,0.25)",
  },
  dismissBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.25)",
    cursor: "pointer",
    padding: 2,
    display: "flex",
    alignItems: "center",
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 2,
    transition: "color 0.15s",
  },
  userName: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
  },
  logoutBtn: {
    height: 34,
    padding: "0 12px",
    borderRadius: 8,
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "rgba(239,68,68,0.8)",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },

  // ─── Modal de auditoría ────────────────────────────────────────────────
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 500,
  },
  modalCard: {
    width: 420,
    maxWidth: "90vw",
    maxHeight: "80vh",
    background: "#0c0f18",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    flexShrink: 0,
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
    borderRadius: 4,
  },
  auditList: {
    overflowY: "auto",
  },
  auditItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  auditIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: "rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
};