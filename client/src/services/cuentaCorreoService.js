import api from "./api";

export const getCuentas = async () => {
  const { data } = await api.get("/cuentas-correo");
  return data;
};

export const createCuenta = async (cuenta) => {
  const { data } = await api.post("/cuentas-correo", cuenta);
  return data;
};

export const updateCuenta = async (id, cuenta) => {
  const { data } = await api.put(`/cuentas-correo/${id}`, cuenta);
  return data;
};

export const deleteCuenta = async (id) => {
  const { data } = await api.delete(`/cuentas-correo/${id}`);
  return data;
};

export const testCuenta = async (id) => {
  const { data } = await api.post(`/cuentas-correo/${id}/test`);
  return data;
};