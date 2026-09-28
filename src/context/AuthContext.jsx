import { createContext, useState ,useEffect} from "react";
import {
  login as loginApi,
   logout as logoutApi
} from "../api/authApi";
import api from "../api/axios.js"


export const AuthContext = createContext(null)

export const AuthProvider = ({children}) => {
  const [user,setUser] = useState(null);
  const [loading, setLoading] = useState(true);

   const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me");

      setUser(response.data.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email,password) => {
    const response = await loginApi(email,password)
    console.log("LOGIN RESPONSE:", response);
  console.log("USER:", response.data.user);

    setUser(response.data.user)
  };

   const logout = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        login,
        logout
      }}
    >
        {children}
    </AuthContext.Provider>
  )
};



