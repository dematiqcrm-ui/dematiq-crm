import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import {
  getResumen,
  getEmpresasIncompletas,
  getParquesIncompletos,
  getEmpresasEstado,
  getEmpresasByParque,
} from "../services/reporteService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { ChevronDown, ChevronRight } from "lucide-react";

const COLORS = ["#3b5bff","#22c55e","#f59e0b","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6"];

const GLOBAL_STYLE = `
  select, select option { background-color: #131720 !important; color: #e2e8f0 !important; }
  select:focus { outline: none; }
  .recharts-cartesian-grid line { stroke: rgba(255,255,255,0.05); }
  .recharts-text { fill: rgba(255,255,255,0.28) !important; font-size: 11px !important; }
`;

const s = {
  pageWrap: { fontFamily: "'DM Sans', sans-serif" },
  title: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.92)", letterSpacing: "-0.02em", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.28)", marginBottom: 20 },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 },
  kpiCard: { background: "#0c0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 14px" },
  kpiLabel: { fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 },
  kpiValue: { fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.88)", letterSpacing: "-0.02em", lineHeight: 1 },

  section: { background: "#0c0f18", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, marginBottom: 10, overflow: "hidden" },
  sectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "12px 14px", cursor: "pointer", userSelect: "none",
  },
  sectionTitle: { fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" },
  sectionBody: { padding: "0 14px 14px" },

  tabs: { display: "flex", gap: 4, marginBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 0 },
  tab: (active) => ({
    padding: "6px 12px", fontSize: 11, fontWeight: 500, cursor: "pointer",
    color: active ? "#818cf8" : "rgba(255,255,255,0.3)",
    background: "transparent", border: "none", borderBottom: active ? "2px solid #3b5bff" : "2px solid transparent",
    fontFamily: "inherit", transition: "color 0.15s",
  }),

  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 600,
    color: "rgba(255,255,255,0.18)", textTransform: "uppercase", letterSpacing: "0.08em",
    background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  td: { padding: "9px 10px", color: "rgba(255,255,255,0.55)", borderTop: "1px solid rgba(255,255,255,0.03)", verticalAlign: "middle" },

  badge: (color) => ({
    display: "inline-block", padding: "2px 7px", borderRadius: 5,
    fontSize: 10, fontWeight: 500, cursor: "pointer",
    background: color === "red" ? "rgba(248,113,113,0.08)" : "rgba(59,91,255,0.1)",
    color: color === "red" ? "#f87171" : "#818cf8",
    border: `1px solid ${color === "red" ? "rgba(248,113,113,0.15)" : "rgba(99,130,246,0.15)"}`,
    transition: "background 0.15s",
  }),

  selectInput: {
    height: 32, background: "#131720", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 7, color: "#e2e8f0", fontSize: 12, padding: "0 28px 0 10px",
    outline: "none", appearance: "none", WebkitAppearance: "none",
    cursor: "pointer", fontFamily: "inherit", boxSizing: "border-box",
  },
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0e1119", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "7px 11px", fontSize: 12 }}>
      <div style={{ color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>{label}</div>
      <div style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{payload[0].value} empresas</div>
    </div>
  );
};

function Collapsible({ title, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={s.section}>
      <div style={s.sectionHeader} onClick={() => setOpen((v) => !v)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={s.sectionTitle}>{title}</span>
          {badge > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10,
              background: "rgba(248,113,113,0.12)", color: "#f87171",
              border: "1px solid rgba(248,113,113,0.18)",
            }}>{badge}</span>
          )}
        </div>
        {open
          ? <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
          : <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.25)" }} />}
      </div>
      {open && <div style={s.sectionBody}>{children}</div>}
    </div>
  );
}

function IncompletesDrilldown({ empresasIncompletas, parquesIncompletos, navigate, parqueSel, setParqueSel }) {
  const [tab, setTab] = useState("empresas");

  const parquesUnicos = [...new Map(
  empresasIncompletas
    .filter((e) => (e.parqueId || e.parque) && e.parque)
    .map((e) => [e.parqueId || e.parque, { id: e.parqueId || e.parque, nombre: e.parque }])
).values()];

  const empresasFiltradas = parqueSel && parqueSel !== "todos"
    ? empresasIncompletas.filter((e) => (e.parqueId || e.parque) === parqueSel)
    : empresasIncompletas;

  const badgeBtn = {
    ...s.badge("red"),
    cursor: "pointer",
    fontFamily: "inherit",
    background: "rgba(248,113,113,0.08)",
  };

  return (
    <div>
      <div style={s.tabs}>
        {[["empresas", "Empresas"], ["parques", "Parques"]].map(([key, label]) => (
          <button key={key} style={s.tab(tab === key)} onClick={() => { setTab(key); setParqueSel("todos"); }}>{label}</button>
        ))}
      </div>

      {tab === "empresas" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>Parque:</span>
            <div style={{ position: "relative", minWidth: 200 }}>
              <select value={parqueSel} onChange={(e) => setParqueSel(e.target.value)} style={s.selectInput}>
                <option value="todos">Todos los parques</option>
                {parquesUnicos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <ChevronDown size={11} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
            </div>
          </div>

          <table style={s.table}>
            <thead>
              <tr>{["Empresa", "Campos incompletos"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {empresasFiltradas.length === 0 ? (
                <tr><td colSpan={2} style={{ ...s.td, textAlign: "center", color: "rgba(255,255,255,0.15)", padding: "28px 0" }}>Sin empresas incompletas</td></tr>
              ) : empresasFiltradas.map((emp) => (
                <tr key={emp._id}
                  onMouseEnter={(e) => [...e.currentTarget.children].forEach(td => td.style.background = "rgba(255,255,255,0.018)")}
                  onMouseLeave={(e) => [...e.currentTarget.children].forEach(td => td.style.background = "transparent")}
                >
                  <td style={{ ...s.td, fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{emp.empresa}</td>
                  <td style={s.td}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {emp.faltantes.map((f) => (
                        <button
                          key={f}
                          onClick={() => navigate(`/empresas?parque=${emp.parqueId || ""}&search=${encodeURIComponent(emp.empresa)}`)}
                          style={badgeBtn}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.18)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                          title="Ir a editar esta empresa"
                        >{f}</button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === "parques" && (
        <table style={s.table}>
          <thead>
            <tr>{["Parque", "Estado", "Municipio", "Campos incompletos"].map((h) => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {parquesIncompletos.length === 0 ? (
              <tr><td colSpan={4} style={{ ...s.td, textAlign: "center", color: "rgba(255,255,255,0.15)", padding: "28px 0" }}>Sin registros incompletos</td></tr>
            ) : parquesIncompletos.map((p) => (
              <tr key={p._id}
                onMouseEnter={(e) => [...e.currentTarget.children].forEach(td => td.style.background = "rgba(255,255,255,0.018)")}
                onMouseLeave={(e) => [...e.currentTarget.children].forEach(td => td.style.background = "transparent")}
              >
                <td style={{ ...s.td, fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{p.nombre}</td>
                <td style={s.td}>{p.estado}</td>
                <td style={s.td}>{p.municipio}</td>
                <td style={s.td}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {p.faltantes.map((f) => (
                      <button
                        key={f}
                        onClick={() => navigate(`/parques?search=${encodeURIComponent(p.nombre)}`)}
                        style={badgeBtn}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.18)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
                        title="Ir a editar este parque"
                      >{f}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function GraficaPorParque({ data }) {
  const chartHeight = Math.max(220, data.length * 32);

  if (!data.length) return (
    <div style={{ padding: "32px 0", textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 12 }}>
      Sin datos disponibles
    </div>
  );

  return (
    <div style={{ width: "100%", overflowY: "auto" }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 40, left: 4, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.28)" }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="parque"
            width={160}
            tick={{ fontSize: 11, fill: "rgba(255,255,255,0.45)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => v.length > 22 ? v.slice(0, 21) + "…" : v}
          />
          <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Reportes() {
  const navigate = useNavigate();
  const [resumen, setResumen] = useState({ empresas: 0, parques: 0, contactos: 0 });
  const [empresasIncompletas, setEmpresasIncompletas] = useState([]);
  const [parquesIncompletos, setParquesIncompletos] = useState([]);
  const [empresasEstado, setEmpresasEstado] = useState([]);
  const [empresasByParque, setEmpresasByParque] = useState([]);
  const [chartTab, setChartTab] = useState("estado");
  const [parqueSel, setParqueSel] = useState("todos");

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      const [resumenData, empresasData, parquesData, estadosData, parqueData] = await Promise.all([
        getResumen(),
        getEmpresasIncompletas(),
        getParquesIncompletos(),
        getEmpresasEstado(),
        getEmpresasByParque(),
      ]);
      setResumen(resumenData);
      setEmpresasIncompletas(empresasData);
      setParquesIncompletos(parquesData);
      setEmpresasEstado(estadosData);
      setEmpresasByParque(parqueData);
    } catch (error) { console.error(error); }
  };

const totalIncompletos = parqueSel === "todos"
  ? empresasIncompletas.length + parquesIncompletos.length
  : empresasIncompletas.filter((e) => (e.parqueId || e.parque) === parqueSel).length;

  return (
    <Layout>
      <style>{GLOBAL_STYLE}</style>
      <div style={s.pageWrap}>
        <div style={s.title}>Reportes</div>
        <div style={s.subtitle}>Estadísticas generales del CRM</div>

        {/* KPIs */}
        <div style={s.kpiGrid}>
          {[
            { label: "Empresas", value: resumen.empresas },
            { label: "Parques", value: resumen.parques },
            { label: "Contactos", value: resumen.contactos },
          ].map(({ label, value }) => (
            <div key={label} style={s.kpiCard}>
              <div style={s.kpiLabel}>{label}</div>
              <div style={s.kpiValue}>{(value ?? 0).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Distribución */}
        <Collapsible title="Distribución" defaultOpen={true}>
          <div style={s.tabs}>
            {[["estado", "Por Estado"], ["parque", "Por Parque"]].map(([key, label]) => (
              <button key={key} style={s.tab(chartTab === key)} onClick={() => setChartTab(key)}>{label}</button>
            ))}
          </div>

          {chartTab === "estado" && (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={empresasEstado} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="estado" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.28)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.28)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="total" fill="#3b5bff" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartTab === "parque" && (
            <GraficaPorParque data={empresasByParque} />
          )}
        </Collapsible>

        {/* Incompletos */}
        <Collapsible title="Datos incompletos" badge={totalIncompletos} defaultOpen={true}>
          <IncompletesDrilldown
          empresasIncompletas={empresasIncompletas}
          parquesIncompletos={parquesIncompletos}
          navigate={navigate}
          parqueSel={parqueSel}
          setParqueSel={setParqueSel}
        />
        </Collapsible>
      </div>
    </Layout>
  );
}