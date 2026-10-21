import api from "./Api";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

export const updateUser = async (id, user) => {
  const response = await api.put(`/users/${id}`, user);
  return response.data.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};