import api from "./api";

export const getResumen =
  async () => {
    const res =
      await api.get(
        "/reportes/resumen"
      );

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