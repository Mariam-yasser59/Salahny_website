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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null')
  );

  const login = async ({ email, password }) => {
    const data = await post('/auth/login', { email, password, role: 'workshop', expectedRole: 'workshop' });
    const auth = normalizeAuth(data, 'workshop');

    if (auth.user.role !== 'workshop') throw new Error('Only workshop accounts can access this portal.');
    const status = String(auth.user.status || auth.user.verificationStatus || '').toLowerCase();
    if (blockedWorkshopStatuses.includes(status)) {
      throw new Error(`Workshop account is ${auth.user.status || auth.user.verificationStatus}. Admin approval is required before portal access.`);
    }

    localStorage.setItem(STORAGE_KEYS.token, auth.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(auth.user));

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

    localStorage.setItem(STORAGE_KEYS.token, auth.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(auth.user));

    if (documentFile instanceof File) {
      const documentPayload = new FormData();
      documentPayload.append('kind', documentType);
      documentPayload.append('file', documentFile);
      await uploadDocument(documentPayload);
    }

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
