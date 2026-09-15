/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback, useEffect } from "react";
import { apiRequest } from "../services/api/apiClient";
import { logger } from "../utils/apiLogger";

const AuthContext = createContext();
const STORAGE_KEY = "kuizroom_host_auth";
const THEME_STORAGE_KEY = "kuizroom_host_theme";

const getStoredTheme = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(THEME_STORAGE_KEY) || "dark";
};

const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("light", theme === "light");
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setThemeState] = useState(getStoredTheme);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.user) {
          setUser(parsed.user);
          setToken(parsed.token);
          setIsAuthenticated(true);
        }
      }
    } catch (err) {
      logger.warn("AUTH_STORAGE", "Failed to read auth from storage", { error: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const persistAuth = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    setError(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: authToken }));
    logger.info("AUTH_PERSIST", `User session authenticated for ${userData?.email || userData?.username || "user"}`);
  }, []);

  const login = useCallback((userData, authToken) => {
    persistAuth(userData, authToken);
  }, [persistAuth]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
    logger.info("AUTH_LOGOUT", "User logged out successfully");
  }, []);

  const authFetch = useCallback(
    async (path, options = {}) => {
      const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      return apiRequest(path, {
        ...options,
        headers,
        action: options.action || "AUTH_FETCH"
      });
    },
    [token]
  );

  const updateProfile = useCallback(
    async (username) => {
      const payload = await authFetch("/auth/profile", {
        method: "PUT",
        action: "UPDATE_PROFILE",
        body: JSON.stringify({ username })
      });

      if (!payload?.success) {
        throw new Error(payload?.message || "Unable to update profile");
      }

      const updatedUser = { ...(user || {}), ...payload.data.user };
      setUser(updatedUser);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, user: updatedUser, token }));
      return updatedUser;
    },
    [authFetch, token, user]
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword) => {
      const payload = await authFetch("/auth/password", {
        method: "PUT",
        action: "CHANGE_PASSWORD",
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (!payload?.success) {
        throw new Error(payload?.message || "Unable to change password");
      }

      return payload.data;
    },
    [authFetch]
  );

  const setTheme = useCallback((nextTheme) => {
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    theme,
    setTheme,
    setError,
    login,
    logout,
    authFetch,
    updateProfile,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
