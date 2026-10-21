import api from "./Api";
export const createCheckoutSession = async (items) => (await api.post("/payments/create-checkout-session", { items })).data;
export const verifyCheckoutSession = async (sessionId) => (await api.get(`/payments/verify/${sessionId}`)).data;
