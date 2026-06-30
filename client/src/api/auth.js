import api from "./client.js";

export const signup = async ({ name, email, password }) => {
  const { data } = await api.post("/auth/signup", { name, email, password });
  return data;
};

export const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};

export const googleLogin = async (credential) => {
  const { data } = await api.post("/auth/google", { credential });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
