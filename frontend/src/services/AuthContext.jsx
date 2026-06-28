import { createContext, useContext, useMemo, useState } from 'react';
import { authLogin, post, uploadDocument } from './api.js';
import { STORAGE_KEYS } from '../config/api.js';

const AuthContext = createContext(null);

const blockedWorkshopStatuses = ['pending', 'rejected', 'suspended', 'deleted'];

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
  const user = { ...sourceUser, role: normalizeRole(sourceUser.role || requestedRole) };

  return { token, user };
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readStoredUser = () => {
  if (!canUseStorage()) return null;

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEYS.user) || 'null');
  } catch (_error) {
    window.localStorage.removeItem(STORAGE_KEYS.token);
    window.localStorage.removeItem(STORAGE_KEYS.user);
    return null;
  }
};

const writeAuth = (token, user) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.token, token);
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
};

const clearStoredAuth = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEYS.token);
  window.localStorage.removeItem(STORAGE_KEYS.user);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  const login = async ({ email, password, role }) => {
    const requestedRole = normalizeRole(role);
    const data = await authLogin({ email, password, role: requestedRole, expectedRole: requestedRole });
    const auth = normalizeAuth(data, requestedRole);

    if (!auth.token) throw new Error('Login succeeded but no session token was returned.');
    if (auth.user.role !== requestedRole) throw new Error(`Only ${requestedRole} accounts can access this portal.`);
    const status = String(auth.user.status || auth.user.verificationStatus || '').toLowerCase();
    if (auth.user.role === 'workshop' && blockedWorkshopStatuses.includes(status)) {
      throw new Error(`Workshop account is ${auth.user.status || auth.user.verificationStatus}. Admin approval is required before portal access.`);
    }

    writeAuth(auth.token, auth.user);

    setUser(auth.user);
    return auth.user;
  };

  const register = async (role, payload) => {
    const requestedRole = normalizeRole(role);
    let documentFile = null;
    let documentType = 'commercial_registration';
    let registerPayload = payload;
    if (payload instanceof FormData) {
      documentFile = payload.get('verificationDocument') || payload.get('driverLicense');
      documentType = payload.get('documentType') || (requestedRole === 'driver' ? 'driver_license' : documentType);
      registerPayload = Object.fromEntries(payload.entries());
      delete registerPayload.verificationDocument;
      delete registerPayload.driverLicense;
    }
    const data = await post('/auth/register', { ...registerPayload, role: requestedRole });
    const auth = normalizeAuth(data, requestedRole);

    writeAuth(auth.token, auth.user);

    if (['driver', 'workshop'].includes(requestedRole) && typeof File !== 'undefined' && documentFile instanceof File) {
      const documentPayload = new FormData();
      documentPayload.append('kind', documentType);
      documentPayload.append('file', documentFile);
      await uploadDocument(documentPayload);
    }

    setUser(auth.user);
    return auth.user;
  };

  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
