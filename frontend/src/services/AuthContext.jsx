import { createContext, useContext, useMemo, useState } from 'react';
import { post, uploadDocument } from './api.js';
import { STORAGE_KEYS } from '../config/api.js';

const AuthContext = createContext(null);

const blockedWorkshopStatuses = ['pending', 'rejected', 'suspended', 'deleted'];

const normalizeRole = (role) => {
  const clean = String(role || 'workshop').toLowerCase();
  return clean === 'workshop' ? 'workshop' : clean;
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

  const login = async ({ email, password }) => {
    const data = await post('/auth/login', { email, password, role: 'workshop', expectedRole: 'workshop' });
    const auth = normalizeAuth(data, 'workshop');

    if (auth.user.role !== 'workshop') throw new Error('Only workshop accounts can access this portal.');
    const status = String(auth.user.status || auth.user.verificationStatus || '').toLowerCase();
    if (blockedWorkshopStatuses.includes(status)) {
      throw new Error(`Workshop account is ${auth.user.status || auth.user.verificationStatus}. Admin approval is required before portal access.`);
    }

    writeAuth(auth.token, auth.user);

    setUser(auth.user);
    return auth.user;
  };

  const register = async (_role, payload) => {
    let documentFile = null;
    let documentType = 'commercial_registration';
    let registerPayload = payload;
    if (payload instanceof FormData) {
      documentFile = payload.get('verificationDocument');
      documentType = payload.get('documentType') || documentType;
      registerPayload = Object.fromEntries(payload.entries());
      delete registerPayload.verificationDocument;
    }
    const data = await post('/auth/register', { ...registerPayload, role: 'workshop' });
    const auth = normalizeAuth(data, 'workshop');

    writeAuth(auth.token, auth.user);

    if (typeof File !== 'undefined' && documentFile instanceof File) {
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
