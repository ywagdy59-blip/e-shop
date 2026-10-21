import api from "./Api";

export const registerUser = async (userData) => {
  const response = await api.post("/users/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await api.post("/users/login", userData);
  return response.data;
};

export const loginAdminWithGoogle = async (credential) => {
  const response = await api.post("/users/google-admin-login", { credential });
  return response.data;
};

export const requestPasswordReset = async (email) => (await api.post("/users/forgot-password", { email })).data;
export const resetPassword = async (token, password) => (await api.post("/users/reset-password", { token, password })).data;
