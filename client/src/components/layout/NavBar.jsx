import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Bell, LogOut, X, CheckCheck } from "lucide-react";

const routeNames = {
  "/clientes": "Clientes",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
  "/parques": "Parques industriales",
  "/empresas": "Empresas",
};

// Mock de notificaciones — reemplaza con tu API real
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Nuevo cliente registrado",
    description: "Empresa Logística del Norte fue agregada.",
    time: "Hace 5 min",
    read: false,
  },
  {
    id: 2,
    title: "Reporte listo",
    description: "El reporte mensual de abril ya está disponible.",
    time: "Hace 1 hora",
    read: false,
  },
  {
    id: 3,
    title: "Parque actualizado",
    description: "Parque Industrial Querétaro modificó su información.",
    time: "Ayer",
    read: true,
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const notifRef = useRef(null);

  const pageName = routeNames[location.pathname] ?? "Página";
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  };

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

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismissNotif = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const handleLogout = () => {
    logout();          // limpia el estado / token
    navigate("/login", { replace: true }); // redirige inmediatamente
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

        {/* Notificaciones */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            style={{
              ...s.iconBtn,
              background: notifOpen
                ? "rgba(59,130,246,0.12)"
                : "rgba(255,255,255,0.04)",
              borderColor: notifOpen
                ? "rgba(59,130,246,0.35)"
                : "rgba(255,255,255,0.08)",
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
                {notifications.length === 0 ? (
                  <div style={s.empty}>Sin notificaciones nuevas</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} style={{ ...s.notifItem, background: n.read ? "transparent" : "rgba(59,130,246,0.05)" }}>
                      {/* Dot */}
                      <div style={{ ...s.dot, opacity: n.read ? 0 : 1 }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.notifTitle}>{n.title}</div>
                        <div style={s.notifDesc}>{n.description}</div>
                        <div style={s.notifTime}>{n.time}</div>
                      </div>

                      <button
                        onClick={() => dismissNotif(n.id)}
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
    background: "#0f172a",
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
};