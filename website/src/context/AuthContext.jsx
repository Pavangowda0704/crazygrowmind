import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api, { setAccessToken, registerRefreshHandlers } from "../api/axios";

const AuthContext = createContext(null);

// Wrap your app (or just the admin section) with <AuthProvider> in main.jsx / App.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true); // true while we check for an existing session
  const [error, setError] = useState(null);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    // The refresh token itself lives in an httpOnly cookie set by the server —
    // this endpoint reads that cookie and issues a new short-lived access token.
    const { data } = await api.post("/auth/refresh");
    setAccessToken(data.accessToken);
    return data.accessToken;
  }, []);

  useEffect(() => {
    registerRefreshHandlers(refreshAccessToken, clearSession);
  }, [refreshAccessToken, clearSession]);

  // On first load, try to silently restore a session from the refresh cookie
  useEffect(() => {
    (async () => {
      try {
        const token = await refreshAccessToken();
        const { data } = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch {
        clearSession();
      } finally {
        setInitializing(false);
      }
    })();
  }, [refreshAccessToken, clearSession]);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Couldn't sign in. Check your details and try again.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    setError(null);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      setAccessToken(data.accessToken);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.message || "Couldn't create the account. Try again.";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{ user, initializing, error, login, register, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
};
