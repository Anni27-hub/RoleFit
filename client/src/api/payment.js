import api from "./client.js";

export const getPremiumConfig = async () => {
  const { data } = await api.get("/premium/config");
  return data;
};

export const createPremiumOrder = async () => {
  const { data } = await api.post("/premium/order");
  return data;
};

export const verifyPremiumPayment = async (payload) => {
  const { data } = await api.post("/premium/verify", payload);
  return data;
};

export const getPayments = async () => {
  const { data } = await api.get("/payments");
  return data;
};
