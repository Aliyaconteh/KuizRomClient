/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useCallback, useEffect } from "react";
import { apiRequest } from "../../shared/services/api/apiClient";
import { logger } from "../../shared/utils/apiLogger";

const AuthContext = createContext();
const STORAGE_KEY = "kuizroom_host_auth";
const THEME_STORAGE_KEY = "kuizroom_host_theme";
const SUSPENSION_STORAGE_KEY = "kuizroom_account_suspension";
const DEFAULT_SUSPENSION_MESSAGE = "This account has been suspended. Contact officialkuizroom@gmail.com for assistance.";

const getTokenExpiration = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64Payload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, "=");
    const decoded = JSON.parse(atob(paddedPayload));
    return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

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
  const [accountSuspension, setAccountSuspension] = useState(null);
  const [theme, setThemeState] = useState(getStoredTheme);

  useEffect(() => {
    try {
      const suspensionMessage = localStorage.getItem(SUSPENSION_STORAGE_KEY);
      if (suspensionMessage) {
        setAccountSuspension(suspensionMessage);
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const expiresAt = parsed?.token ? getTokenExpiration(parsed.token) : null;
          if (parsed?.token && parsed?.user && expiresAt && expiresAt > Date.now()) {
            const user = parsed.user.email?.trim().toLowerCase() === "officialkuizroom@gmail.com"
              ? { ...parsed.user, role: "super_admin" }
              : { ...parsed.user, role: parsed.user.role || "host" };
            setUser(user);
            setToken(parsed.token);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch (err) {
      logger.warn("AUTH_STORAGE", "Failed to read auth from storage", { error: err.message });
      localStorage.removeItem(STORAGE_KEY);
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
    setAccountSuspension(null);
    localStorage.removeItem(SUSPENSION_STORAGE_KEY);
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

  const markAccountSuspended = useCallback((message) => {
    const suspensionMessage = typeof message === "string" && message.trim()
      ? message
      : DEFAULT_SUSPENSION_MESSAGE;
    setAccountSuspension(suspensionMessage);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.setItem(SUSPENSION_STORAGE_KEY, suspensionMessage);
    localStorage.removeItem(STORAGE_KEY);
    logger.warn("ACCOUNT_SUSPENDED", "Suspended account session was cleared");
  }, []);

  const clearAccountSuspension = useCallback(() => {
    setAccountSuspension(null);
    localStorage.removeItem(SUSPENSION_STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (!token) return undefined;

    const expiresAt = getTokenExpiration(token);
    if (!expiresAt || expiresAt <= Date.now()) {
      logout();
      return undefined;
    }

    const timeoutId = window.setTimeout(logout, expiresAt - Date.now());
    return () => window.clearTimeout(timeoutId);
  }, [logout, token]);

  const authFetch = useCallback(
    async (path, options = {}) => {
      const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      try {
        return await apiRequest(path, {
          ...options,
          headers,
          action: options.action || "AUTH_FETCH"
        });
      } catch (requestError) {
        if (requestError.errorType === "ACCOUNT_SUSPENDED") {
          markAccountSuspended(requestError.message);
        }
        throw requestError;
      }
    },
    [markAccountSuspended, token]
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

      const updatedUser = { ...(user || {}), has_password: true };
      setUser(updatedUser);
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, user: updatedUser, token }));
      return payload.data;
    },
    [authFetch, token, user]
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
    accountSuspension,
    theme,
    setTheme,
    setError,
    login,
    logout,
    markAccountSuspended,
    clearAccountSuspension,
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
