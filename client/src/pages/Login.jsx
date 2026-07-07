import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { loginRequest } from "../services/authService";
import logo from "../assets/logo.png"; // reemplaza "logo.png" por el nombre real de tu archivo

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("dematiq_remember");
    if (saved) {
      try {
    const { usuario: savedUsuario } = JSON.parse(saved);
    setUsuario(savedUsuario);
    setRememberMe(true);
   } catch {}
  }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginRequest({ usuario, password });

      if (rememberMe) {
        localStorage.setItem("dematiq_remember", JSON.stringify({ usuario }));
      } else {
        localStorage.removeItem("dematiq_remember");
      }

      login(response.user, response.token);
      navigate("/parques");
    } catch {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Ambient background orbs */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      <div style={{ ...styles.card, opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>
        {/* Logo / Brand */}
        <div style={styles.brand}>
          <img src={logo} alt="Dematiq" style={styles.logoMark} />
        </div>

        <h1 style={styles.title}>Bienvenido de vuelta</h1>
        <p style={styles.subtitle}>Ingresa tus credenciales para continuar</p>

        {/* Error message */}
        {error && (
          <div style={styles.errorBox}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.5" />
              <path d="M7 4v3.5M7 9.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email field */}
            <div style={styles.fieldGroup}>
            <label style={styles.label}>Usuario</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="#64748b" strokeWidth="1.25" />
                <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#64748b" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
              <input
                style={styles.input}
                type="text"
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                autoComplete="username"
                onFocus={e => e.target.parentElement.setAttribute("data-focused", "true")}
                onBlur={e => e.target.parentElement.removeAttribute("data-focused")}
              />
            </div>
          </div>

          {/* Password field */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#64748b" strokeWidth="1.25" />
                <path d="M5 7V5a3 3 0 016 0v2" stroke="#64748b" strokeWidth="1.25" strokeLinecap="round" />
                <circle cx="8" cy="10.5" r="1" fill="#64748b" />
              </svg>
              <input
                style={{ ...styles.input, paddingRight: "44px" }}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 10" stroke="#64748b" strokeWidth="1.25" strokeLinecap="round" />
                    <path d="M4.2 4.3C2.9 5.2 1.8 6.5 1 8c1.4 2.8 4 4.5 7 4.5 1.1 0 2.2-.3 3.1-.7M7 3.6c.3 0 .7-.1 1-.1 3 0 5.6 1.7 7 4.5-.5 1-1.2 1.9-2 2.6" stroke="#64748b" strokeWidth="1.25" strokeLinecap="round" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8c1.4-2.8 4-4.5 7-4.5S13.6 5.2 15 8c-1.4 2.8-4 4.5-7 4.5S2.4 10.8 1 8z" stroke="#64748b" strokeWidth="1.25" />
                    <circle cx="8" cy="8" r="2" stroke="#64748b" strokeWidth="1.25" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" style={{ ...styles.submitBtn, opacity: isLoading ? 0.7 : 1 }} disabled={isLoading}>
            {isLoading ? (
              <span style={styles.spinnerWrapper}>
                <span style={styles.spinner} />
                Iniciando sesión…
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Sora:wght@600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        input::placeholder { color: #334155; }
        input:focus { outline: none; }

        /* Focus ring on wrapper via JS attribute */
        [data-focused="true"] { box-shadow: 0 0 0 2px #3b82f6 !important; border-color: #3b82f6 !important; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-orb {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.18; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#020617",
    fontFamily: "'Instrument Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
  },
  orb1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #1d4ed8 0%, transparent 70%)",
    top: "-120px",
    right: "-100px",
    animation: "pulse-orb 8s ease-in-out infinite",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, #0c0f18 0%, #1e3a5f 60%, transparent 100%)",
    bottom: "-80px",
    left: "-60px",
    opacity: 0.3,
    pointerEvents: "none",
  },
  card: {
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "20px",
    padding: "16px 24px 24px",
    width: "100%",
    maxWidth: "380px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0px",
  },
  logoMark: {
    width: "140px",
    height: "140px",
    borderRadius: "18px",
    objectFit: "contain",
  },
  brandName: {
    fontFamily: "'Sora', sans-serif",
    fontWeight: 700,
    fontSize: "18px",
    color: "#f1f5f9",
    letterSpacing: "-0.3px",
  },
  title: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "6px",
    letterSpacing: "-0.4px",
  },
  subtitle: {
    fontSize: "13.5px",
    color: "#64748b",
    marginBottom: "24px",
    lineHeight: 1.5,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#f87171",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "12.5px",
    fontWeight: 500,
    color: "#94a3b8",
    letterSpacing: "0.2px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "rgba(30, 41, 59, 0.8)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "11px",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    pointerEvents: "none",
    flexShrink: 0,
  },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    fontSize: "14px",
    padding: "13px 14px 13px 40px",
    fontFamily: "'Instrument Sans', sans-serif",
  },
  eyeButton: {
    position: "absolute",
    right: "0",
    top: "0",
    height: "100%",
    width: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: "0 11px 11px 0",
    transition: "opacity 0.2s",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "-4px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    userSelect: "none",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    borderRadius: "5px",
    border: "1.5px solid rgba(255,255,255,0.15)",
    background: "rgba(30, 41, 59, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s, border-color 0.2s",
    flexShrink: 0,
  },
  checkboxChecked: {
    background: "#2563eb",
    borderColor: "#2563eb",
  },
  checkboxText: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  forgotLink: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    color: "#3b82f6",
    fontFamily: "'Instrument Sans', sans-serif",
    padding: 0,
    transition: "color 0.2s",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    border: "none",
    borderRadius: "11px",
    color: "white",
    fontSize: "14.5px",
    fontWeight: 600,
    fontFamily: "'Instrument Sans', sans-serif",
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35)",
    marginTop: "4px",
    letterSpacing: "0.1px",
  },
  spinnerWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footer: {
    marginTop: "24px",
    fontSize: "13px",
    color: "#475569",
    textAlign: "center",
  },
  registerLink: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#3b82f6",
    fontFamily: "'Instrument Sans', sans-serif",
    fontSize: "13px",
    padding: 0,
  },
};