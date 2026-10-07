import { createContext, useCallback, useEffect, useState } from "react";
import { login as loginApi, logout as logoutApi } from "../api/authApi";
import api from "../api/axios.js";

export const AuthContext = createContext(null);

const extractUserFromResponse = (payload) => {
  if (!payload) return null;

  if (payload.user) return payload.user;
  if (payload.data?.user) return payload.data.user;
  if (payload.data?.data?.user) return payload.data.data.user;

  if (payload.data) return payload.data;
  if (payload.data?.data) return payload.data.data;

  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(extractUserFromResponse(response.data));
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await loginApi(email, password);
    const loggedInUser = extractUserFromResponse(response);

    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

