import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getMe,
  googleLogin as googleLoginRequest,
  login as loginRequest,
  signup as signupRequest
} from "../api/auth.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [booting, setBooting] = useState(Boolean(localStorage.getItem("token")));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getMe()
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setBooting(false));
  }, []);

  const saveSession = ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (payload) => {
    const data = await loginRequest(payload);
    saveSession(data);
    return data;
  };

  const signup = async (payload) => {
    const data = await signupRequest(payload);
    saveSession(data);
    return data;
  };

  const googleLogin = async (credential) => {
    const data = await googleLoginRequest(credential);
    saveSession(data);
    return data;
  };

  const updateUser = (nextUser) => {
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      booting,
      isAuthenticated: Boolean(user && localStorage.getItem("token")),
      login,
      signup,
      googleLogin,
      updateUser,
      logout
    }),
    [user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
};
