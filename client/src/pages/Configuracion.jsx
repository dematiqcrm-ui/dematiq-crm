import { useState, useEffect, useCallback } from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";
import { getResumen } from "../services/reporteService";

import {
  User, Moon, Sun, Lock, Database, Download,
  FileSpreadsheet, FileText, Wifi, Clock, Tag,
  CheckCircle, AlertCircle, Loader2, ShieldCheck,
  Eye, EyeOff, KeyRound,
} from "lucide-react";

const PIN_SECRETO = "1234";

// ─── Descarga archivo desde el backend ───────────────────────────────────────
const downloadFromBackend = async (url) => {
  const jwt = localStorage.getItem("token");
  if (!jwt) throw new Error("No hay sesión activa. Inicia sesión de nuevo.");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${jwt}` },
  });

  if (res.status === 401) throw new Error("No autorizado (401). Verifica tu sesión.");
  if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition") || "";
  const match = contentDisposition.match(/filename="(.+)"/);
  const filename = match ? match[1] : "export";

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// ─── Botón de exportación ─────────────────────────────────────────────────────
function ExportBtn({ type, icon, label, hoverBorder, spinColor, exporting, onExport }) {
  return (
    <button
      onClick={() => onExport(type)}
      disabled={!!exporting}
      className={`w-full flex items-center justify-between p-4 rounded-xl bg-slate-800
                  border border-slate-700 ${hoverBorder} active:scale-[.98]
                  disabled:opacity-60 transition-all`}
    >
      <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
      {exporting === type
        ? <Loader2 size={18} className={`animate-spin ${spinColor}`} />
        : <Download size={18} />}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5">
      <p className="text-slate-400 text-sm">{label}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}

// ─── Componente PIN ───────────────────────────────────────────────────────────
function PinGuard({ onSuccess }) {
  const [pin, setPin]           = useState("");
  const [error, setError]       = useState(false);
  const [showPin, setShowPin]   = useState(false);
  const [shake, setShake]       = useState(false);

  const handleChange = (val) => {
    if (!/^\d*$/.test(val)) return;       // solo números
    if (val.length > 6) return;           // máximo 6 dígitos
    setPin(val);
    setError(false);
  };

  const handleVerify = () => {
    if (pin === PIN_SECRETO) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-5 py-6
      ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>

      {/* Ícono candado */}
      <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700
                      flex items-center justify-center">
        <KeyRound size={28} className="text-yellow-400" />
      </div>

      <div className="text-center">
        <p className="font-semibold text-lg">Área protegida</p>
        <p className="text-slate-400 text-sm mt-1">Ingresa el PIN para acceder</p>
      </div>

      {/* Input PIN */}
      <div className="w-full max-w-xs">
        <div className={`flex items-center gap-2 bg-slate-800 border rounded-xl px-4 py-3
          ${error ? "border-red-500" : "border-slate-700 focus-within:border-yellow-400"}
          transition-colors`}>
          <input
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            placeholder="••••"
            value={pin}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="flex-1 bg-transparent text-white text-center text-xl tracking-[0.5em]
                       placeholder-slate-600 outline-none"
            autoFocus
          />
          <button
            onClick={() => setShowPin((v) => !v)}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle size={14} />
            <span>PIN incorrecto. Los botones permanecerán ocultos.</span>
          </div>
        )}
      </div>

      <button
        onClick={handleVerify}
        disabled={pin.length < 4}
        className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold
                   px-8 py-2.5 rounded-xl disabled:opacity-40 active:scale-95
                   transition-all"
      >
        Verificar
      </button>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Configuracion() {
  const { user } = useAuth();

  const [stats, setStats]                     = useState({ empresas: 0, parques: 0, contactos: 0 });
  const [theme, setTheme]                     = useState(() => localStorage.getItem("theme") || "dark");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg]         = useState(null);
  const [apiStatus, setApiStatus]             = useState("checking");
  const [exporting, setExporting]             = useState(null);
  const [sistemaDesbloqueado, setSistemaDesbloqueado] = useState(false);

  // ─── Funciones de carga ────────────────────────────────────────────────────
  const cargarResumen = useCallback(async () => {
    try {
      const data = await getResumen();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const checkApiStatus = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:5000/api/health");
      setApiStatus(res.ok ? "online" : "offline");
    } catch {
      setApiStatus("offline");
    }
  }, []);

  // ─── Tema ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.body.style.backgroundColor = "#020617";
    } else {
      document.documentElement.classList.remove("dark");
      document.body.style.backgroundColor = "#f8fafc";
    }
  }, [theme]);

  // ─── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    cargarResumen();
    checkApiStatus();
  }, [cargarResumen, checkApiStatus]);

  // ─── Contraseña ────────────────────────────────────────────────────────────
  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: "error", text: "Completa todos los campos." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Mínimo 6 caracteres." });
      return;
    }
    setPasswordMsg({ type: "success", text: "Contraseña actualizada." });
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  // ─── Exportaciones ─────────────────────────────────────────────────────────
  const handleExport = async (type) => {
    setExporting(type);
    try {
      const endpoints = {
        excel:  "http://localhost:5000/api/export/excel",
        pdf:    "http://localhost:5000/api/export/pdf",
        backup: "http://localhost:5000/api/export/backup",
      };
      await downloadFromBackend(endpoints[type]);
    } catch (err) {
      console.error(`Error exportando ${type}:`, err);
      alert(`No se pudo exportar: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  const lastAccess = new Date().toLocaleDateString("es-MX", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-slate-400 mt-2">Administración del sistema CRM</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* PERFIL */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User size={22} className="text-blue-400" />
            <h2 className="text-xl font-semibold">Perfil</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: "Nombre", value: user?.nombre || "Administrador" },
              { label: "Correo",  value: user?.email  || "" },
              { label: "Rol",     value: user?.rol    || "Administrador" },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-sm text-slate-400 mb-2">{label}</label>
                <input value={value} readOnly
                  className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white" />
              </div>
            ))}
          </div>
        </div>

        {/* APARIENCIA */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Moon size={22} className="text-yellow-400" />
            <h2 className="text-xl font-semibold">Apariencia</h2>
          </div>
          <div className="space-y-4">
            {[
              { value: "dark",  icon: <Moon size={18} />, label: "Tema oscuro" },
              { value: "light", icon: <Sun  size={18} />, label: "Tema claro"  },
            ].map(({ value, icon, label }) => (
              <div key={value} onClick={() => setTheme(value)}
                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
                  ${theme === value
                    ? "bg-blue-600/20 border-blue-500"
                    : "bg-slate-800 border-slate-700 hover:border-slate-500"}`}>
                <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${theme === value ? "border-blue-400" : "border-slate-600"}`}>
                  {theme === value && <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEGURIDAD */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock size={22} className="text-red-400" />
            <h2 className="text-xl font-semibold">Seguridad</h2>
          </div>
          <div className="space-y-4">
            <input type="password" placeholder="Contraseña actual"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500" />
            <input type="password" placeholder="Nueva contraseña"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500" />
            <input type="password" placeholder="Confirmar contraseña"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500" />
            {passwordMsg && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg
                ${passwordMsg.type === "success"
                  ? "bg-green-900/30 border border-green-700 text-green-400"
                  : "bg-red-900/30 border border-red-700 text-red-400"}`}>
                {passwordMsg.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {passwordMsg.text}
              </div>
            )}
            <button onClick={handlePasswordChange}
              className="bg-red-600 hover:bg-red-700 active:scale-95 transition-all px-5 py-3 rounded-lg font-medium">
              Actualizar contraseña
            </button>
          </div>
        </div>

        {/* SISTEMA — protegido con PIN */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Database size={22} className="text-green-400" />
              <h2 className="text-xl font-semibold">Sistema</h2>
            </div>
            {/* Badge de estado */}
            {sistemaDesbloqueado ? (
              <span className="flex items-center gap-1.5 text-xs bg-green-900/30 border
                               border-green-700/50 text-green-400 px-3 py-1 rounded-full font-medium">
                <ShieldCheck size={12} /> Desbloqueado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs bg-yellow-900/30 border
                               border-yellow-700/50 text-yellow-400 px-3 py-1 rounded-full font-medium">
                <Lock size={12} /> Protegido
              </span>
            )}
          </div>

          {/* PIN guard o botones */}
          {!sistemaDesbloqueado ? (
            <PinGuard onSuccess={() => setSistemaDesbloqueado(true)} />
          ) : (
            <div className="space-y-4">
              <ExportBtn type="excel"
                icon={<FileSpreadsheet size={20} className="text-green-400" />}
                label="Exportar Excel — toda la BD"
                hoverBorder="hover:border-green-500" spinColor="text-green-400"
                exporting={exporting} onExport={handleExport} />
              <ExportBtn type="pdf"
                icon={<FileText size={20} className="text-red-400" />}
                label="Exportar PDF — toda la BD"
                hoverBorder="hover:border-red-500" spinColor="text-red-400"
                exporting={exporting} onExport={handleExport} />
              <ExportBtn type="backup"
                icon={<Database size={20} className="text-blue-400" />}
                label="Respaldo JSON — toda la BD"
                hoverBorder="hover:border-blue-500" spinColor="text-blue-400"
                exporting={exporting} onExport={handleExport} />

              {/* Volver a bloquear */}
              <button
                onClick={() => setSistemaDesbloqueado(false)}
                className="w-full flex items-center justify-center gap-2 mt-2 p-3 rounded-xl
                           bg-slate-800 border border-slate-700 hover:border-yellow-500
                           text-slate-400 hover:text-yellow-400 text-sm transition-all"
              >
                <Lock size={14} /> Volver a bloquear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RESUMEN */}
      <div className="mt-8 bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-xl font-semibold mb-6">Resumen del sistema</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard label="Empresas" value={stats.empresas} />
          <StatCard label="Parques"  value={stats.parques} />
          <StatCard label="Usuarios" value={stats.contactos} />

          <div className="bg-slate-800 rounded-xl p-5 col-span-2 xl:col-span-1">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Clock size={14} /><span>Último acceso</span>
            </div>
            <p className="text-sm font-semibold capitalize leading-snug">{lastAccess}</p>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Tag size={14} /><span>Versión CRM</span>
            </div>
            <span className="inline-block bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-bold px-2 py-1 rounded-md">
              v1.0.0
            </span>
          </div>

          <div className="bg-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
              <Wifi size={14} /><span>Estado API</span>
            </div>
            {apiStatus === "checking" ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin" /><span>Verificando…</span>
              </div>
            ) : apiStatus === "online" ? (
              <div className="flex items-center gap-2 text-green-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Conectado
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-red-400" />Sin conexión
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 bg-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database size={18} className="text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Base de datos</p>
              <p className="font-semibold">MongoDB Atlas</p>
            </div>
          </div>
          <span className="text-xs bg-green-900/30 border border-green-700/50 text-green-400 px-3 py-1 rounded-full font-medium">
            Activa
          </span>
        </div>
      </div>
    </Layout>
  );
}