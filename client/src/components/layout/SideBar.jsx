import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import {
  FileBarChart,
  Settings,
  Building2,
  Briefcase,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const menuSections = [
  {
    label: "General",
    items: [
       {
        name: "Parques industriales",
        icon: Building2,
        path: "/parques",
      },
      {
        name: "Empresas",
        icon: Briefcase,
        path: "/empresas",
      },
    ],
  },
  {
    label: "Directorio",
    items: [
      {
        name: "Reportes",
        icon: FileBarChart,
        path: "/reportes",
      },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem(
      "sidebarCollapsed"
    ) === "true";
  });

  useEffect(() => {
    localStorage.setItem(
      "sidebarCollapsed",
      String(collapsed)
    );
  }, [collapsed]);

  const getInitials = () => {
    if (!user?.nombre) return "AD";

    return user.nombre
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <aside
      style={{
        width: collapsed ? "72px" : "260px",
        background: "#0f1117",
        borderRight:
          "0.5px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "all 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed
            ? "center"
            : "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2
              size={15}
              color="#fff"
            />
          </div>

          {!collapsed && (
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                Dematiq
              </div>

              <div
                style={{
                  fontSize: 10,
                  color:
                    "rgba(255,255,255,0.3)",
                }}
              >
                CRM Industrial
              </div>
            </div>
          )}
        </div>

        {!collapsed ? (
          <button
            onClick={() =>
              setCollapsed(true)
            }
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <ChevronLeft size={18} />
          </button>
        ) : (
          <button
            onClick={() =>
              setCollapsed(false)
            }
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Menú */}
      <nav
        style={{
          flex: 1,
          padding: "4px 10px",
          overflowY: "auto",
        }}
      >
        {menuSections.map((section) => (
          <div
            key={section.label}
            style={{
              marginTop: 8,
            }}
          >
            {!collapsed && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color:
                    "rgba(255,255,255,0.2)",
                  letterSpacing: "0.08em",
                  textTransform:
                    "uppercase",
                  padding:
                    "8px 8px 4px",
                }}
              >
                {section.label}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;

              const active =
                location.pathname ===
                item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      collapsed
                        ? "center"
                        : "flex-start",
                    gap: 9,
                    padding: "8px 10px",
                    borderRadius: 7,
                    marginBottom: 1,
                    fontSize: 13,
                    color: active
                      ? "#60a5fa"
                      : "rgba(255,255,255,0.45)",
                    background:
                      active
                        ? "rgba(59,130,246,0.12)"
                        : "transparent",
                    textDecoration:
                      "none",
                    transition:
                      "all 0.15s",
                  }}
                >
                  <Icon
                    size={15}
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  {!collapsed && (
                    <span
                      style={{
                        flex: 1,
                      }}
                    >
                      {item.name}
                    </span>
                  )}

                  {active &&
                    !collapsed && (
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius:
                            "50%",
                          background:
                            "#3b82f6",
                        }}
                      />
                    )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Configuración */}
        <div
          style={{
            marginTop: 16,
          }}
        >
          <Link
            to="/configuracion"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                collapsed
                  ? "center"
                  : "flex-start",
              gap: 9,
              padding: "8px 10px",
              borderRadius: 7,
              fontSize: 13,
              color:
                location.pathname ===
                "/configuracion"
                  ? "#60a5fa"
                  : "rgba(255,255,255,0.45)",
              background:
                location.pathname ===
                "/configuracion"
                  ? "rgba(59,130,246,0.12)"
                  : "transparent",
              textDecoration:
                "none",
            }}
          >
            <Settings size={15} />

            {!collapsed && (
              <span>
                Configuración
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* Usuario */}
      <div
        style={{
          padding: "12px 10px",
          borderTop:
            "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "8px 10px",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {getInitials()}
          </div>

          {!collapsed && (
            <>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color:
                      "rgba(255,255,255,0.8)",
                  }}
                >
                  {user?.nombre ||
                    "Administrador"}
                </div>

                <div
                  style={{
                    fontSize: 10,
                    color:
                      "rgba(255,255,255,0.3)",
                  }}
                >
                  {user?.rol ||
                    "Administrador"}
                </div>
              </div>

              <ChevronRight
                size={12}
                style={{
                  color:
                    "rgba(255,255,255,0.2)",
                }}
              />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}