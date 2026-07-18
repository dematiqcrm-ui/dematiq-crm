import api from "./api";

export const getProveedores = async () => {
  const { data } = await api.get("/proveedores");
  return data;
};

export const getProveedor = async (id) => {
  const { data } = await api.get(`/proveedores/${id}`);
  return data;
};

export const createProveedor = async (proveedorData) => {
  const { data } = await api.post("/proveedores", proveedorData);
  return data;
};

export const updateProveedor = async (id, proveedorData) => {
  const { data } = await api.put(`/proveedores/${id}`, proveedorData);
  return data;
};

export const deleteProveedor = async (id) => {
  const { data } = await api.delete(`/proveedores/${id}`);
  return data;
};