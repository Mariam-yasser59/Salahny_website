import { API_BASE_URL, STORAGE_KEYS } from '../config/api.js';
import { fallbackBookings, fallbackPackages, fallbackServices, fallbackWorkshops } from '../data/fallbackData.js';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const token = () => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.token);
};

const clearAuth = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEYS.token);
  window.localStorage.removeItem(STORAGE_KEYS.user);
};

const request = async (path, options = {}) => {
  const headers = options.body instanceof FormData
    ? { ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...options.headers }
    : { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...options.headers };

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearAuth();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error(data.message || 'Session expired. Please login again.');
  }

  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const normalizeList = (data, keys = []) => {
  const normalize = (items) => items.map((item) => ({ ...item, id: item.id || item._id }));
  if (Array.isArray(data)) return normalize(data);
  if (Array.isArray(data?.data)) return normalize(data.data);
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return normalize(data[key]);
    if (Array.isArray(data?.data?.[key])) return normalize(data.data[key]);
  }
  return [];
};

const payload = (data) => data?.data ?? data;

const adaptBooking = (booking) => ({
  ...booking,
  id: booking.id || booking._id,
  service: booking.service || booking.serviceId || booking.serviceRef || { name: booking.serviceName || 'Workshop service' },
  workshop: booking.workshop || booking.workshopId || booking.workshopRef,
  driver: booking.driver || booking.customer || booking.user || booking.userId || { name: booking.customerName, phone: booking.customerPhone },
  vehicle: booking.vehicle || booking.vehicleInfo || {},
  status: booking.status || 'pending',
  notes: booking.notes || booking.serviceNotes || booking.issue,
  timeline: booking.timeline || booking.workflowSteps || ['Requested', booking.status || 'Pending'],
  progress: booking.progress ?? (booking.status === 'completed' ? 100 : booking.status === 'in_progress' ? 55 : 20)
});

const withFallback = async (primary, fallback) => {
  try {
    return await primary();
  } catch (_error) {
    return fallback();
  }
};

const virtualGet = async (path) => {
  if (path === '/public/landing') {
    const [services, packagesData, workshops] = await Promise.all([
      request('/public/landing').then((data) => data.services || data).catch(() => fallbackServices),
      request('/public/landing').then((data) => data.packages || data).catch(() => fallbackPackages),
      request('/public/landing').then((data) => data.workshops || data).catch(() => fallbackWorkshops)
    ]);

    return {
      services: normalizeList(services, ['services']),
      packages: normalizeList(packagesData, ['packages']),
      workshops: normalizeList(workshops, ['workshops']),
      testimonials: []
    };
  }

  if (path === '/driver/dashboard') {
    const [me, vehicles, bookings, workshops, notifications] = await Promise.all([
      request('/driver/profile').catch(() => null),
      request('/driver/vehicles').catch(() => []),
      request('/driver/bookings').catch(() => fallbackBookings),
      request('/driver/workshops').catch(() => fallbackWorkshops),
      request('/notifications').catch(() => [])
    ]);

    const recentBookings = normalizeList(bookings, ['bookings']).map(adaptBooking);

    return {
      user: me?.user || me,
      vehicles: normalizeList(vehicles, ['vehicles']),
      activeBooking: recentBookings.find((booking) => booking.status !== 'completed'),
      recentBookings,
      diagnostics: [],
      nearbyWorkshops: normalizeList(workshops, ['workshops']),
      activity: normalizeList(notifications, ['notifications']).slice(0, 5).map((item, index) => ({
        id: item.id || item._id || index,
        message: item.message || item.title || 'Notification update'
      }))
    };
  }

  if (path === '/driver/vehicles') return normalizeList(await request('/driver/vehicles'), ['vehicles']);
  if (path === '/driver/services') return normalizeList(await request('/driver/services').catch(() => fallbackServices), ['services']);
  if (path === '/driver/workshops') return normalizeList(await request('/driver/workshops').catch(() => fallbackWorkshops), ['workshops']);
  if (path.startsWith('/driver/workshops/')) return request(`/driver/workshops/${path.split('/').pop()}`);
  if (path === '/driver/bookings') return normalizeList(await request('/driver/bookings').catch(() => fallbackBookings), ['bookings']).map(adaptBooking);
  if (path.startsWith('/driver/bookings/')) return adaptBooking(await request(`/driver/bookings/${path.split('/').pop()}`));
  if (path === '/driver/diagnostics') return normalizeList(await request('/driver/diagnostics').catch(() => []), ['diagnostics']);
  if (path === '/driver/profile') return request('/driver/profile').then((data) => data.user || data);
  if (path === '/driver/chat') return normalizeList(await request('/driver/chat'), ['rooms', 'chats', 'messages']);
  if (path === '/driver/notifications') return normalizeList(await request('/notifications'), ['notifications']);

  if (path === '/workshop/dashboard') {
    return withFallback(
      async () => {
        const data = payload(await request('/workshop-portal/dashboard'));
        return {
          workshop: data.profile,
          rating: data.profile?.rating,
          todayJobs: data.stats?.jobsToday || 0,
          pendingRequestCount: data.stats?.pending || 0,
          activeJobCount: data.stats?.active || 0,
          availableSlots: data.stats?.availableSlots || 0,
          revenueSummary: { total: data.stats?.revenue || data.profile?.monthlyRevenue || 0 },
          verificationStatus: data.profile?.verificationStatus || data.profile?.accountStatus,
          recentRequests: normalizeList(data.bookings, ['bookings']).map(adaptBooking)
        };
      },
      async () => {
        const data = await request('/workshop/dashboard');
        return {
          ...data,
          pendingRequestCount: data.pendingRequests?.length || 0,
          activeJobCount: data.activeJobs?.length || 0,
          verificationStatus: data.workshop?.verificationStatus || (data.workshop?.verified ? 'verified' : 'pending'),
          recentRequests: normalizeList(data.recentRequests || []).map(adaptBooking)
        };
      }
    );
  }

  if (path === '/workshop/requests') {
    return withFallback(
      () => request('/workshop-portal/bookings?grouped=true'),
      async () => ({ pending: normalizeList(await request('/workshop/requests'), ['bookings', 'data']).map(adaptBooking), current: [], completed: [], closed: [] })
    );
  }

  if (path === '/workshop/jobs') {
    return withFallback(
      () => request('/workshop-portal/bookings').then((data) => normalizeList(data, ['data']).map(adaptBooking).filter((booking) => ['accepted', 'in_progress', 'diagnostics_ready', 'repair_in_progress'].includes(booking.status))),
      async () => normalizeList(await request('/workshop/active-jobs'), ['bookings', 'data']).map(adaptBooking)
    );
  }

  if (path === '/workshop/services') {
    return withFallback(
      () => request('/workshop-portal/services').then((data) => normalizeList(data, ['services', 'data'])),
      () => request('/workshop/services').then((data) => normalizeList(data, ['services', 'data'])).catch(() => fallbackServices)
    );
  }

  if (path === '/workshop/slots') {
    return withFallback(
      () => request('/workshop-portal/slots').then((data) => (payload(data) || []).map((slot) => ({ id: slot, date: String(slot).slice(0, 10), time: String(slot).slice(11, 16), booked: false }))),
      () => Promise.resolve([])
    );
  }

  if (path === '/workshop/emergency') {
    return withFallback(
      () => request('/emergency/workshop/assigned').then((data) => normalizeList(data, ['requests', 'data'])),
      () => Promise.resolve([])
    );
  }

  if (path === '/workshop/earnings') {
    return withFallback(
      () => request('/workshop-portal/earnings').then((data) => {
        const item = payload(data);
        return { ...item, totalEarnings: item.totalEarnings ?? item.total, paidAmount: item.paidAmount ?? item.paid, recent: item.recent || item.items || [] };
      }),
      () => request('/workshop/earnings').then((data) => ({ totalEarnings: data.monthly, availableBalance: data.monthly - data.weekly, paidAmount: data.weekly, recent: [], ...data }))
    );
  }

  if (path === '/workshop/profile') {
    return withFallback(
      () => request('/workshop-portal/profile').then(payload),
      () => request('/workshop/profile')
    );
  }

  if (path === '/workshop/admin/messages') {
    return withFallback(
      () => request('/workshop-portal/admin/messages').then((data) => normalizeList(data, ['messages', 'data'])),
      () => Promise.resolve([])
    );
  }

  if (path.startsWith('/workshop/chat/')) {
    const bookingId = path.split('/').pop();
    return withFallback(
      async () => ({
        context: payload(await request(`/chat/bookings/${bookingId}/context`)),
        messages: normalizeList(await request(`/chat/bookings/${bookingId}/messages`), ['messages', 'data'])
      }),
      () => Promise.resolve({ context: { bookingId }, messages: [] })
    );
  }

  if (path === '/workshop/notifications') {
    return withFallback(
      () => request('/notifications').then((data) => normalizeList(data, ['notifications', 'data'])),
      () => Promise.resolve([])
    );
  }
  if (path === '/workshop/documents') return request('/documents').then((data) => normalizeList(data, ['documents', 'data']));

  if (path === '/admin/dashboard') return request('/admin/dashboard').catch(() => ({ totalUsers: 128, totalDrivers: 96, totalWorkshops: 18, totalBookings: fallbackBookings.length, revenue: 191900, pendingApprovals: 4, recentActivity: [] }));
  if (path === '/admin/approvals') return normalizeList(await request('/admin/users').catch(() => []), ['users']).filter((item) => ['pending', 'inactive'].includes(item.status));
  if (path === '/admin/drivers') return normalizeList(await request('/admin/users').catch(() => []), ['users']).filter((item) => ['driver', 'user'].includes(String(item.role).toLowerCase()));
  if (path === '/admin/workshops') return normalizeList(await request('/admin/workshops').catch(() => fallbackWorkshops), ['workshops']);
  if (path === '/admin/bookings') return normalizeList(await request('/admin/bookings').catch(() => fallbackBookings), ['bookings']).map(adaptBooking);
  if (path === '/admin/services') return normalizeList(await request('/services').catch(() => fallbackServices), ['services']);
  if (path === '/admin/packages') return normalizeList(await request('/packages').catch(() => fallbackPackages), ['packages']);
  if (path === '/admin/logs') return [];
  if (path === '/admin/settings') return request('/users/me').then((data) => data.user || data);

  return request(path);
};

export const api = async (path, options = {}) => {
  if (!options.method || options.method === 'GET') return virtualGet(path);

  if (path === '/auth/register') {
    if (!(options.body instanceof FormData)) {
      const body = JSON.parse(options.body || '{}');
      return request(`/auth/register/${body.role || 'driver'}`, options);
    }
    return request('/auth/register/workshop', options).catch(() => {
      const json = Object.fromEntries(options.body.entries());
      json.verificationDocumentName = json.verificationDocument?.name;
      delete json.verificationDocument;
      return request('/auth/register/workshop', { ...options, body: JSON.stringify(json) });
    });
  }

  if (path === '/driver/vehicles') return request('/driver/vehicles', options);
  if (path.startsWith('/driver/vehicles/')) return request(`/driver/vehicles/${path.split('/').pop()}`, options);
  if (path === '/driver/bookings') return request('/driver/bookings', options);
  if (path === '/driver/diagnostics') return request('/driver/diagnostics', options);
  if (path.startsWith('/driver/emergency/')) return request(`/${path.split('/').pop()}`, options);

  if (path === '/workshop/services') return request('/workshop-portal/services', options).then(payload).catch(() => request('/workshop/services', options));
  if (path.startsWith('/workshop/services/')) {
    const id = path.split('/').pop();
    if (options.method === 'DELETE') return request(`/workshop-portal/services/${id}`, options).catch(() => request(`/workshop/services/${id}`, options));
  }
  if (path === '/workshop/slots') return request('/workshop-portal/slots', { ...options, method: 'PUT' }).then((data) => (payload(data) || []).map((slot) => ({ id: slot, date: String(slot).slice(0, 10), time: String(slot).slice(11, 16), booked: false })));
  if (path.startsWith('/workshop/bookings/') && path.endsWith('/status')) {
    const id = path.split('/')[3];
    return request(`/workshop-portal/bookings/${id}/status`, options).then(payload).catch(() => request(`/workshop/requests/${id}/status`, options));
  }
  if (path.startsWith('/workshop/diagnostics/') && path.endsWith('/run')) {
    const id = path.split('/')[3];
    return request(`/diagnostics/workshop/${id}/run`, options).then(payload);
  }
  if (path.startsWith('/workshop/diagnostics/') && path.endsWith('/upload-obd')) {
    const id = path.split('/')[3];
    return request(`/diagnostics/workshop/${id}/upload-obd`, options).then(payload);
  }
  if (path.startsWith('/workshop/diagnostics/') && path.endsWith('/share')) {
    const id = path.split('/')[3];
    return request(`/chat/bookings/${id}/share-diagnostic`, options).then(payload);
  }
  if (path.startsWith('/workshop/chat/') && path.endsWith('/messages')) {
    const id = path.split('/')[3];
    return request(`/chat/bookings/${id}/messages`, options).then(payload);
  }
  if (path === '/workshop/admin/messages') return request('/workshop-portal/admin/messages', options).then(payload);
  if (path.startsWith('/workshop/emergency/')) {
    const [, , , id, action] = path.split('/');
    if (action === 'accept' || action === 'reject') return request(`/emergency/${id}/${action}`, options).then(payload);
    return request(`/emergency/${id}/status`, options).then(payload);
  }
  if (path.startsWith('/workshop/tracking/')) {
    const id = path.split('/').pop();
    return request(`/tracking/${id}`, options).then(payload);
  }
  if (path === '/workshop/profile') {
    const body = JSON.parse(options.body || '{}');
    const id = body.id || body._id || 'me';
    return request(`/workshops/${id}`, options).catch(() => request('/workshop/profile', options));
  }

  return request(path, options);
};

export const post = (path, body) => api(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });
export const put = (path, body) => api(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) });
export const patch = (path, body) => api(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) });
export const del = (path) => api(path, { method: 'DELETE' });
export const uploadDocument = async (body) => {
  if (!(body instanceof FormData)) return request('/documents', { method: 'POST', body: JSON.stringify(body) });
  const file = body.get('file') || body.get('verificationDocument');
  const metadata = {
    kind: body.get('kind') || body.get('documentType') || 'commercial_registration',
    fileName: file?.name || body.get('fileName') || 'verification-document',
    mimeType: file?.type || 'application/octet-stream',
    size: file?.size || 0
  };
  return request('/documents', { method: 'POST', body: JSON.stringify(metadata) }).then(payload);
};
