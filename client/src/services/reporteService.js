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
  const conteo = {};
  for (const p of proveedores) {
    const estado = p.estado?.trim() || "Sin estado";
    conteo[estado] = (conteo[estado] || 0) + 1;
  }
  return Object.entries(conteo)
    .map(([estado, total]) => ({ estado, total }))
    .sort((a, b) => b.total - a.total);
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