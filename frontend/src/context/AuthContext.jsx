import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

// ── Helpers ────────────────────────────────────────────────────────────────
function loadSession() {
  try {
    const raw = localStorage.getItem('dukan_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(data) {
  localStorage.setItem('dukan_session', JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem('dukan_session');
}

// ── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession());

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password);
    const data = res.data.data; // { userId, name, email, shopName, preferredLanguage, token }
    saveSession(data);
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const res = await authApi.register(formData);
    const data = res.data.data;
    saveSession(data);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const isLoggedIn = Boolean(user?.token);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
