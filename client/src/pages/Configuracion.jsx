import { useState, useEffect, useCallback } from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../hooks/useAuth";
import { getResumen } from "../services/reporteService";
import { getCuentas, createCuenta, deleteCuenta, testCuenta } from "../services/cuentaCorreoService";

import {
  User, Lock, Database, Download,
  FileSpreadsheet, FileText, Wifi, Clock, Tag,
  CheckCircle, AlertCircle, Loader2, ShieldCheck,
  Eye, EyeOff, KeyRound, Mail, Plus, Minus, ChevronDown,
  Type, RotateCcw,
} from "lucide-react";

const PIN_SECRETO = "1234";
const API = "http://localhost:5000/api";

// Límites del escalado de texto
const TEXT_SCALE_MIN = 80;
const TEXT_SCALE_MAX = 150;
const TEXT_SCALE_STEP = 10;

// ─── Formatea bytes a una unidad legible ─────────────────────────────────────
const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return "0 MB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i > 0 && value < 10 ? 2 : 0)} ${units[i]}`;
};

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
  const [pin, setPin]         = useState("");
  const [error, setError]     = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [shake, setShake]     = useState(false);

  const handleChange = (val) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length > 6) return;
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
      <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
        <KeyRound size={28} className="text-yellow-400" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-lg">Área protegida</p>
        <p className="text-slate-400 text-sm mt-1">Ingresa el PIN para acceder</p>
      </div>
      <div className="w-full max-w-xs">
        <div className={`flex items-center gap-2 bg-slate-800 border rounded-xl px-4 py-3
          ${error ? "border-red-500" : "border-slate-700 focus-within:border-yellow-400"} transition-colors`}>
          <input
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            placeholder="••••"
            value={pin}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="flex-1 bg-transparent text-white text-center text-xl tracking-[0.5em] placeholder-slate-600 outline-none"
            autoFocus
          />
          <button onClick={() => setShowPin((v) => !v)} className="text-slate-500 hover:text-slate-300 transition-colors">
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
        className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-8 py-2.5 rounded-xl disabled:opacity-40 active:scale-95 transition-all"
      >
        Verificar
      </button>
    </div>
  );
}

// ─── Select estilizado ────────────────────────────────────────────────────────
function StyledSelect({ value, onChange, children, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none bg-slate-700 border border-slate-600 text-white
                   text-sm rounded-lg px-3 py-2.5 pr-8 outline-none cursor-pointer
                   disabled:opacity-40 disabled:cursor-not-allowed
                   focus:border-blue-500 transition-colors"
      >
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ─── Panel de filtros de exportación ─────────────────────────────────────────
function ExportFilterPanel({ exporting, onExport }) {
  const [filtros, setFiltros]     = useState({ estados: [], parques: [], empresas: [] });
  const [loadingF, setLoadingF]   = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState("todo");   // todo | estado | parque | empresa
  const [valorFiltro, setValorFiltro] = useState("");

  // Carga la lista de estados, parques y empresas disponibles
  useEffect(() => {
    const jwt = localStorage.getItem("token");
    fetch(`${API}/export/filtros`, { headers: { Authorization: `Bearer ${jwt}` } })
      .then((r) => r.json())
      .then((data) => setFiltros(data))
      .catch(console.error)
      .finally(() => setLoadingF(false));
  }, []);

  // Al cambiar tipo, resetear el valor seleccionado
  const handleTipoChange = (t) => {
    setTipoFiltro(t);
    setValorFiltro("");
  };

  // Construye los params de query
  const buildParams = () => {
    if (tipoFiltro === "todo" || !valorFiltro) return "tipo=todo";
    return `tipo=${tipoFiltro}&valor=${encodeURIComponent(valorFiltro)}`;
  };

  // Label descriptivo para los botones de export
  const labelFiltro = () => {
    if (tipoFiltro === "todo") return "Todo";
    if (tipoFiltro === "estado") {
      return valorFiltro ? `Estado: ${valorFiltro}` : "Estado (sin seleccionar)";
    }
    if (tipoFiltro === "parque") {
      const p = filtros.parques.find((x) => x._id === valorFiltro);
      return p ? `Parque: ${p.nombre}` : "Parque (sin seleccionar)";
    }
    if (tipoFiltro === "empresa") {
      const e = filtros.empresas.find((x) => x._id === valorFiltro);
      return e ? `Empresa: ${e.empresa}` : "Empresa (sin seleccionar)";
    }
    return "";
  };

  // Verifica si falta seleccionar un valor
  const faltaValor = tipoFiltro !== "todo" && !valorFiltro;

  const handleExport = (type) => {
    onExport(type, buildParams());
  };

  return (
    <div className="space-y-4">

      {/* ── Paso 1: Tipo de filtro ── */}
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
          1 — Filtrar por
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "todo",    label: "Todo" },
            { key: "estado",  label: "Estado" },
            { key: "parque",  label: "Parque industrial" },
            { key: "empresa", label: "Empresa" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTipoChange(key)}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left
                ${tipoFiltro === key
                  ? "bg-blue-600/20 border-blue-500 text-blue-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Paso 2: Seleccionar valor ── */}
      {tipoFiltro !== "todo" && (
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
            2 — Seleccionar {tipoFiltro === "estado" ? "estado" : tipoFiltro === "parque" ? "parque" : "empresa"}
          </p>

          {loadingF ? (
            <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
              <Loader2 size={14} className="animate-spin" /> Cargando opciones…
            </div>
          ) : (
            <>
              {tipoFiltro === "estado" && (
                <StyledSelect value={valorFiltro} onChange={setValorFiltro}>
                  <option value="">— Elige un estado —</option>
                  {filtros.estados.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </StyledSelect>
              )}

              {tipoFiltro === "parque" && (
                <StyledSelect value={valorFiltro} onChange={setValorFiltro}>
                  <option value="">— Elige un parque —</option>
                  {filtros.parques.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nombre}{p.estado ? ` — ${p.estado}` : ""}
                    </option>
                  ))}
                </StyledSelect>
              )}

              {tipoFiltro === "empresa" && (
                <StyledSelect value={valorFiltro} onChange={setValorFiltro}>
                  <option value="">— Elige una empresa —</option>
                  {filtros.empresas.map((e) => (
                    <option key={e._id} value={e._id}>{e.empresa}</option>
                  ))}
                </StyledSelect>
              )}

              {faltaValor && (
                <p className="text-xs text-yellow-500/80 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={11} /> Selecciona una opción para habilitar la exportación
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Separador ── */}
      <div className="border-t border-slate-700/60 pt-1" />

      {/* ── Botones de exportación ── */}
      <div className={`space-y-2 transition-opacity ${faltaValor ? "opacity-40 pointer-events-none" : ""}`}>
        <ExportBtn
          type="excel"
          icon={<FileSpreadsheet size={20} className="text-green-400" />}
          label={`Excel — ${labelFiltro()}`}
          hoverBorder="hover:border-green-500"
          spinColor="text-green-400"
          exporting={exporting}
          onExport={handleExport}
        />
        <ExportBtn
          type="pdf"
          icon={<FileText size={20} className="text-red-400" />}
          label={`PDF — ${labelFiltro()}`}
          hoverBorder="hover:border-red-500"
          spinColor="text-red-400"
          exporting={exporting}
          onExport={handleExport}
        />
        <ExportBtn
          type="backup"
          icon={<Database size={20} className="text-blue-400" />}
          label={`Respaldo JSON — ${labelFiltro()}`}
          hoverBorder="hover:border-blue-500"
          spinColor="text-blue-400"
          exporting={exporting}
          onExport={handleExport}
        />
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Configuracion() {
  const { user } = useAuth();

  const [stats, setStats]                     = useState({ empresas: 0, parques: 0, contactos: 0 });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg]         = useState(null);
  const [apiStatus, setApiStatus]             = useState("checking");
  const [exporting, setExporting]             = useState(null);
  const [sistemaDesbloqueado, setSistemaDesbloqueado] = useState(false);
  const [cuentas, setCuentas]                 = useState([]);
  const [cuentaForm, setCuentaForm]           = useState({ nombre: "", email: "", password: "", servicio: "gmail" });
  const [mostrarFormCuenta, setMostrarFormCuenta] = useState(false);
  const [testingCuenta, setTestingCuenta]     = useState(null);
  const [dbStats, setDbStats]                 = useState(null);
  const [dbStatsLoading, setDbStatsLoading]   = useState(true);

  // ─── Tamaño de texto (aplica a toda la app vía font-size del <html>) ───────
  const [textScale, setTextScale] = useState(() => {
    const saved = parseInt(localStorage.getItem("textScale"), 10);
    return Number.isFinite(saved) ? saved : 100;
  });

  useEffect(() => {
    localStorage.setItem("textScale", String(textScale));
    document.documentElement.style.zoom = `${textScale}%`;
  }, [textScale]);

  const ajustarTexto = (delta) => {
    setTextScale((prev) => Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, prev + delta)));
  };

  // ─── Funciones de carga ────────────────────────────────────────────────────
  const cargarResumen = useCallback(async () => {
    try {
      const data = await getResumen();
      setStats(data);
    } catch (err) { console.error(err); }
  }, []);

  const checkApiStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/health`);
      setApiStatus(res.ok ? "online" : "offline");
    } catch { setApiStatus("offline"); }
  }, []);

  const cargarCuentas = useCallback(async () => {
    try {
      const data = await getCuentas();
      setCuentas(data);
    } catch (err) { console.error(err); }
  }, []);

  // Peso de la base de datos (requiere el endpoint GET /api/system/db-stats)
  const cargarDbStats = useCallback(async () => {
    setDbStatsLoading(true);
    try {
      const jwt = localStorage.getItem("token");
      const res = await fetch(`${API}/system/db-stats`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setDbStats(data);
    } catch (err) {
      console.error("Error al obtener el peso de la BD:", err);
      setDbStats(null);
    } finally {
      setDbStatsLoading(false);
    }
  }, []);

  const handleCreateCuenta = async () => {
    if (!cuentaForm.nombre || !cuentaForm.email || !cuentaForm.password) {
      alert("Completa todos los campos"); return;
    }
    try {
      await createCuenta(cuentaForm);
      await cargarCuentas();
      setCuentaForm({ nombre: "", email: "", password: "", servicio: "gmail" });
      setMostrarFormCuenta(false);
    } catch { alert("No se pudo guardar la cuenta"); }
  };

  const handleDeleteCuenta = async (id) => {
    if (!confirm("¿Eliminar esta cuenta?")) return;
    try { await deleteCuenta(id); await cargarCuentas(); }
    catch { alert("No se pudo eliminar la cuenta"); }
  };

  const handleTestCuenta = async (id) => {
    setTestingCuenta(id);
    try { await testCuenta(id); alert("Correo de prueba enviado correctamente"); }
    catch { alert("No se pudo conectar con esta cuenta"); }
    finally { setTestingCuenta(null); }
  };

  useEffect(() => {
    cargarResumen();
    checkApiStatus();
    cargarCuentas();
    cargarDbStats();
  }, [cargarResumen, checkApiStatus, cargarCuentas, cargarDbStats]);

  // ─── Contraseña ────────────────────────────────────────────────────────────
  const handlePasswordChange = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMsg({ type: "error", text: "Completa todos los campos." }); return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Las contraseñas no coinciden." }); return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Mínimo 6 caracteres." }); return;
    }
    setPasswordMsg({ type: "success", text: "Contraseña actualizada." });
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  // ─── Exportaciones ─────────────────────────────────────────────────────────
  // queryParams viene ya construido desde ExportFilterPanel
  const handleExport = async (type, queryParams = "tipo=todo") => {
    setExporting(type);
    try {
      const endpoints = {
        excel:  `${API}/export/excel?${queryParams}`,
        pdf:    `${API}/export/pdf?${queryParams}`,
        backup: `${API}/export/backup?${queryParams}`,
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

        {/* TAMAÑO DE TEXTO */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Type size={22} className="text-yellow-400" />
            <h2 className="text-xl font-semibold">Tamaño de texto</h2>
          </div>
          <p className="text-slate-400 text-sm mb-5">
            Ajusta el tamaño del texto en todas las vistas del sistema.
          </p>

          <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-4">
            <button
              onClick={() => ajustarTexto(-TEXT_SCALE_STEP)}
              disabled={textScale <= TEXT_SCALE_MIN}
              className="w-11 h-11 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center
                         hover:border-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Reducir texto"
            >
              <Minus size={18} />
            </button>

            <div className="text-center">
              <p className="text-2xl font-bold">{textScale}%</p>
              <p className="text-xs text-slate-500 mt-0.5">Tamaño actual</p>
            </div>

            <button
              onClick={() => ajustarTexto(TEXT_SCALE_STEP)}
              disabled={textScale >= TEXT_SCALE_MAX}
              className="w-11 h-11 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center
                         hover:border-yellow-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              title="Aumentar texto"
            >
              <Plus size={18} />
            </button>
          </div>

          {textScale !== 100 && (
            <button
              onClick={() => setTextScale(100)}
              className="w-full flex items-center justify-center gap-2 mt-3 p-2.5 rounded-lg
                         bg-slate-800 border border-slate-700 hover:border-yellow-500
                         text-slate-400 hover:text-yellow-400 text-xs transition-all"
            >
              <RotateCcw size={13} /> Restablecer tamaño
            </button>
          )}
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
            {sistemaDesbloqueado ? (
              <span className="flex items-center gap-1.5 text-xs bg-green-900/30 border border-green-700/50 text-green-400 px-3 py-1 rounded-full font-medium">
                <ShieldCheck size={12} /> Desbloqueado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 px-3 py-1 rounded-full font-medium">
                <Lock size={12} /> Protegido
              </span>
            )}
          </div>

          {!sistemaDesbloqueado ? (
            <PinGuard onSuccess={() => setSistemaDesbloqueado(true)} />
          ) : (
            <div className="space-y-4">
              {/* Panel de filtros granulares */}
              <ExportFilterPanel exporting={exporting} onExport={handleExport} />

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

      {/* CUENTAS DE CORREO */}
      <div className="mt-6 bg-slate-900 rounded-2xl border border-slate-800 p-6 xl:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Mail size={22} className="text-purple-400" />
            <h2 className="text-xl font-semibold">Cuentas de correo</h2>
          </div>
          <button
            onClick={() => setMostrarFormCuenta((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 text-sm font-medium hover:bg-purple-600/30 transition-all"
          >
            <Plus size={14} /> Agregar cuenta
          </button>
        </div>

        {mostrarFormCuenta && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre</label>
              <input type="text" placeholder="Ej. Ventas" value={cuentaForm.nombre}
                onChange={(e) => setCuentaForm({ ...cuentaForm, nombre: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Servicio</label>
              <select value={cuentaForm.servicio}
                onChange={(e) => setCuentaForm({ ...cuentaForm, servicio: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm">
                <option value="gmail">Gmail</option>
                <option value="hotmail">Outlook/Hotmail</option>
                <option value="yahoo">Yahoo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Correo</label>
              <input type="email" placeholder="correo@gmail.com" value={cuentaForm.email}
                onChange={(e) => setCuentaForm({ ...cuentaForm, email: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm placeholder-slate-500" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Contraseña de app</label>
              <input type="password" placeholder="••••••••••••••••" value={cuentaForm.password}
                onChange={(e) => setCuentaForm({ ...cuentaForm, password: e.target.value })}
                className="w-full p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm placeholder-slate-500" />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button onClick={() => setMostrarFormCuenta(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 text-slate-300 text-sm hover:bg-slate-600 transition-all">
                Cancelar
              </button>
              <button onClick={handleCreateCuenta}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-all">
                Guardar cuenta
              </button>
            </div>
          </div>
        )}

        {cuentas.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No hay cuentas configuradas</div>
        ) : (
          <div className="space-y-3">
            {cuentas.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                    <Mail size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{c.nombre}</div>
                    <div className="text-xs text-slate-400">{c.email} — {c.servicio}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleTestCuenta(c._id)} disabled={testingCuenta === c._id}
                    className="px-3 py-1.5 rounded-lg bg-green-600/15 border border-green-600/30 text-green-400 text-xs font-medium hover:bg-green-600/25 transition-all disabled:opacity-50">
                    {testingCuenta === c._id ? "Probando..." : "Probar"}
                  </button>
                  <button onClick={() => handleDeleteCuenta(c._id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/15 border border-red-600/30 text-red-400 text-xs font-medium hover:bg-red-600/25 transition-all">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESUMEN */}
      <div className="mt-6 bg-slate-900 rounded-2xl border border-slate-800 p-6">
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

        <div className="mt-4 bg-slate-800 rounded-xl p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Database size={18} className="text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Base de datos</p>
              <p className="font-semibold">MongoDB Atlas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dbStatsLoading ? (
              <span className="flex items-center gap-2 text-slate-400 text-xs px-3 py-1">
                <Loader2 size={12} className="animate-spin" /> Calculando peso…
              </span>
            ) : dbStats ? (
              <span
                className="text-xs bg-blue-900/30 border border-blue-700/50 text-blue-300 px-3 py-1 rounded-full font-medium"
                title="Tamaño de datos + índices"
              >
                Peso: {formatBytes(dbStats.totalSize ?? dbStats.dataSize)}
              </span>
            ) : (
              <span className="text-xs bg-red-900/30 border border-red-700/50 text-red-400 px-3 py-1 rounded-full font-medium">
                Peso no disponible
              </span>
            )}
            <span className="text-xs bg-green-900/30 border border-green-700/50 text-green-400 px-3 py-1 rounded-full font-medium">
              Activa
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}