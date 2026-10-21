import api from "./Api";

export const getProducts = async () => {
  const response = await api.get("/clothes");
  return response.data.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/clothes/${id}`);
  return response.data.data;
};

export const createProduct = async (product) => {
  const response = await api.post("/clothes", product);
  return response.data.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`/clothes/${id}`, product);
  return response.data.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/clothes/${id}`);
  return response.data.data;
};

export const getCategories = async () => {
  const response = await api.get("/categories");
  return response.data.data;
};

export const createCategory = async (category) => {
  const response = await api.post("/categories", category);
  return response.data.data;
};

export const updateCategory = async (id, category) => {
  const response = await api.put(`/categories/${id}`, category);
  return response.data.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};