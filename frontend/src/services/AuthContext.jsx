import { createContext, useContext, useMemo, useState } from 'react';
import { post } from './api.js';
import { STORAGE_KEYS } from '../config/api.js';

const AuthContext = createContext(null);

const normalizeRole = (role) => {
  const clean = String(role || 'driver').toLowerCase();
  if (['admin', 'super_admin', 'superadmin'].includes(clean)) return 'admin';
  if (clean === 'workshop') return 'workshop';
  return 'driver';
};

const normalizeAuth = (data, requestedRole) => {
  const payload = data.data || data;

  const token = payload.token || data.token || data.accessToken || data.jwt;
  const sourceUser = payload.user || data.user || {};

  const user = {
    ...sourceUser,
    role: normalizeRole(sourceUser.role || requestedRole)
  };

  return { token, user };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null')
  );

  const login = async ({ email, password, role }) => {
    const data = await post('/auth/login', {
      email,
      password,
      expectedRole: role
    });

    const auth = normalizeAuth(data, role);

    localStorage.setItem(STORAGE_KEYS.token, auth.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(auth.user));

    setUser(auth.user);
    return auth.user;
  };

  const register = async (role, payload) => {
    const data = await post('/auth/register', { ...payload, role });
    const auth = normalizeAuth(data, role);

    localStorage.setItem(STORAGE_KEYS.token, auth.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(auth.user));

    setUser(auth.user);
    return auth.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);