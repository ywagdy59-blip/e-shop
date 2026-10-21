import api from "./Api";

export const getAllOrders = async () => {
  const response = await api.get("/orders");
  return response.data.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/orders/my");
  return response.data.data;
};

export const createOrder = async (items) => {
  const response = await api.post("/orders", { items });
  return response.data.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/orders/${id}/status`, { status });
  return response.data.data;
};
