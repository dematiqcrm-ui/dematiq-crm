import api from "./api";

export const getParques = async () => {
  const response =
    await api.get("/parques");

  return response.data;
};

export const createParque = async (
  data
) => {
  const response =
    await api.post(
      "/parques",
      data
    );

  return response.data;
};

export const updateParque = async (
  id,
  data
) => {
  const response =
    await api.put(
      `/parques/${id}`,
      data
    );

  return response.data;
};

export const deleteParque = async (
  id
) => {
  const response =
    await api.delete(
      `/parques/${id}`
    );

  return response.data;
};