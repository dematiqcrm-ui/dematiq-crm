import api from "./api";

export const loginRequest = async (
  credentials
) => {
  const response = await api.post(
    "/auth/login",
    credentials
  );

  return response.data;
};

export const updateProfile = async (
  data
) => {
  const token =
    localStorage.getItem("token");

  const response = await api.put(
    "/auth/profile",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const changePassword =
  async (data) => {
    const token =
      localStorage.getItem("token");

    const response = await api.put(
      "/auth/password",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  };