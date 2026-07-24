import api from "./api";

export const getResumen =
  async () => {
    const res =
      await api.get(
        "/reportes/resumen"
      );

    return res.data;
  };

export const getProveedoresPorEstado = async () => {
  const res = await api.get("/proveedores");
  const proveedores = res.data;
  const agrupado = {};
  for (const p of proveedores) {
    const estado = p.estado?.trim() || "Sin estado";
    if (!agrupado[estado]) agrupado[estado] = { estado, total: 0, empresas: [] };
    agrupado[estado].total += 1;
    agrupado[estado].empresas.push(p.empresa);
  }
  return Object.values(agrupado).sort((a, b) => b.total - a.total);
};

export const getUltimosCorreos = async (desde = null, hasta = null) => {
  const params = {};
  if (desde) params.desde = desde;
  if (hasta) params.hasta = hasta;
  const res = await api.get("/correo/historial-global", { params });
  return res.data;
};

export const getEmpresasIncompletas =
  async () => {
    const res =
      await api.get(
        "/reportes/empresas-incompletas"
      );

    return res.data;
  };

export const getParquesIncompletos =
  async () => {
    const res =
      await api.get(
        "/reportes/parques-incompletos"
      );

    return res.data;
  };

  
export const getEmpresasEstado =
  async () => {
    const res =
      await api.get(
        "/reportes/empresas-estado"
      );

    return res.data;
  };

export const getEmpresasByParque =
  async () => {
    const res =
      await api.get(
        "/reportes/empresas-parque"
      );

    return res.data;
  };