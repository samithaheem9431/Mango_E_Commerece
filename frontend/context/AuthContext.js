"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionTimerRef = useRef(null);

  const clearSessionTimer = () => {
    if (sessionTimerRef.current) {
      window.clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  };

  const decodeToken = (token) => {
    try {
      const payload = token.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  };

  const scheduleAutoLogout = (token, shouldToast = false) => {
    clearSessionTimer();
    const decoded = decodeToken(token);
    if (!decoded?.exp) return;

    const msUntilExpiry = decoded.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      logout("Session expired", shouldToast);
      return;
    }

    const id = window.setTimeout(() => {
      logout("Session expired", true);
    }, msUntilExpiry);
    sessionTimerRef.current = id;
  };

  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      scheduleAutoLogout(token);
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem("token");
      clearSessionTimer();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    scheduleAutoLogout(token);
    setUser(userData);
  };

  const logout = (message, shouldToast = false) => {
    localStorage.removeItem("token");
    clearSessionTimer();
    setUser(null);
    if (shouldToast && message) toast.error(message);
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const handleSessionExpired = () => logout("Session expired", true);
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
      clearSessionTimer();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
