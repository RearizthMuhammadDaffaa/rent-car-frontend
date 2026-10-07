import api from "./axios";

const TOKEN_KEY = "token";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const token = response?.data?.data?.token || response?.data?.token;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  return response.data;
};

export const register = async ({ name, email, password }) => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
};

export const logout = async () => {
  localStorage.removeItem(TOKEN_KEY);

  const response = await api.delete("/auth/logout");

  return response.data;
};