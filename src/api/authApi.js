import api from "./axios";

export const login = async (email,password) => {
  const response = await api.post('/auth/login', {
    email,
    password
  })
  return response.data
}

export const logout = async () => {
   const response = await api.delete("/auth/logout");

  return response.data;
}