import api from "./api";

export const getEmpresas = async (
  parqueIndustrialId
) => {
  const { data } =
    await api.get(
      "/empresas",
      {
        params: {
          parqueIndustrialId,
        },
      }
    );

  return data;
};

export const getEmpresa = async (
  id
) => {
  const { data } =
    await api.get(
      `/empresas/${id}`
    );

  return data;
};

export const createEmpresa =
  async (empresaData) => {
    const { data } =
      await api.post(
        "/empresas",
        empresaData
      );

    return data;
  };

export const updateEmpresa =
  async (
    id,
    empresaData
  ) => {
    const { data } =
      await api.put(
        `/empresas/${id}`,
        empresaData
      );

    return data;
  };

export const deleteEmpresa =
  async (id) => {
    const { data } =
      await api.delete(
        `/empresas/${id}`
      );

    return data;
  };