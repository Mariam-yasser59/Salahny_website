import { ALTERNATE_API_BASE_URLS, API_BASE_URL, STORAGE_KEYS } from '../config/api.js';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const token = () => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.token);
};

const clearAuth = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEYS.token);
  window.localStorage.removeItem(STORAGE_KEYS.user);
  window.localStorage.removeItem(STORAGE_KEYS.apiBaseUrl);
};

const getApiBaseUrl = () => {
  if (!canUseStorage()) return API_BASE_URL;
  return window.localStorage.getItem(STORAGE_KEYS.apiBaseUrl) || API_BASE_URL;
};

const setApiBaseUrl = (baseUrl) => {
  if (!canUseStorage() || !baseUrl) return;
  window.localStorage.setItem(STORAGE_KEYS.apiBaseUrl, baseUrl);
};

const request = async (path, options = {}, baseUrl = getApiBaseUrl()) => {
  const headers = options.body instanceof FormData
    ? { ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...options.headers }
    : { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...options.headers };

  const { skipAuthRedirect, ...fetchOptions } = options;
  const response = await fetch(`${baseUrl}${path}`, { ...fetchOptions, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !skipAuthRedirect) {
    clearAuth();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error(data.message || 'Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.statusCode = response.status;
    throw error;
  }
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

const readJsonBody = (body) => {
  if (!body || body instanceof FormData) return {};
  try {
    return JSON.parse(body);
  } catch (_error) {
    return {};
  }
};

export const authLogin = async (body) => {
  const bases = [getApiBaseUrl(), API_BASE_URL, ...ALTERNATE_API_BASE_URLS].filter((value, index, list) => value && list.indexOf(value) === index);
  let lastError = null;

  for (const baseUrl of bases) {
    try {
      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
        skipAuthRedirect: true,
      }, baseUrl);
      setApiBaseUrl(baseUrl);
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Login failed');
};

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
    try {
      const landing = await request('/public/landing');
      return {
        ...landing,
        services: normalizeList(landing.services, ['services']),
        packages: normalizeList(landing.packages, ['packages']),
        workshops: normalizeList(landing.workshops, ['workshops']),
        testimonials: landing.testimonials || [],
        completedServices: landing.completedServices || 0,
        happyCustomers: landing.happyCustomers || 0,
        emergencyHandled: landing.emergencyHandled || 0
      };
    } catch (_error) {
      const [services, packagesData, workshops] = await Promise.all([
        request('/services').catch(() => []),
        request('/packages').catch(() => []),
        request('/workshops').catch(() => [])
      ]);

      return {
        services: normalizeList(services, ['services']),
        packages: normalizeList(packagesData, ['packages']),
        workshops: normalizeList(workshops, ['workshops']),
        testimonials: [],
        completedServices: 0,
        happyCustomers: 0,
        emergencyHandled: 0
      };
    }
  }

  if (path === '/driver/dashboard') {
    const [me, vehicles, bookings, workshops, notifications] = await Promise.all([
      request('/users/me').catch(() => null),
      request('/vehicles').catch(() => []),
      request('/bookings').catch(() => []),
      request('/workshops').catch(() => []),
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

  if (path === '/driver/vehicles') return normalizeList(await request('/vehicles'), ['vehicles']);
  if (path === '/driver/services') return normalizeList(await request('/services').catch(() => []), ['services']);
  if (path === '/driver/workshops') return normalizeList(await request('/workshops').catch(() => []), ['workshops']);

  if (path === '/vehicles') return normalizeList(await request('/vehicles'), ['vehicles']);
  if (path === '/services') return normalizeList(await request('/services').catch(() => []), ['services']);
  if (path === '/workshops') return normalizeList(await request('/workshops').catch(() => []), ['workshops']);

  if (path.startsWith('/driver/workshops/')) return request(`/workshops/${path.split('/').pop()}`);
  if (path === '/driver/bookings') return normalizeList(await request('/bookings').catch(() => []), ['bookings']).map(adaptBooking);
  if (path.startsWith('/driver/bookings/')) return adaptBooking(await request(`/bookings/${path.split('/').pop()}`));

  if (path === '/driver/diagnostics') return normalizeList(await request('/driver/diagnostics').catch(() => []), ['diagnostics']);
  if (path === '/driver/profile') return request('/users/me').then((data) => data.user || data);
  if (path === '/driver/chat') return normalizeList(await request('/driver/chat').catch(() => []), ['rooms', 'chats', 'messages']);
  if (path === '/driver/notifications') return normalizeList(await request('/notifications').catch(() => []), ['notifications']);

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
      () => request('/workshop/services').then((data) => normalizeList(data, ['services', 'data'])).catch(() => [])
    );
  }

  if (path === '/workshop/slots') {
    return withFallback(
      () => request('/workshop-portal/slots').then((data) => {
        const result = payload(data);
        const slots = Array.isArray(result) ? result : result?.availableSlots || result?.slots || [];
        return slots.map((slot) => ({
          id: slot,
          value: slot,
          date: String(slot).slice(0, 10),
          time: String(slot).slice(11, 16),
          booked: false
        }));
      }),
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

  if (path === '/admin/dashboard') return request('/admin/dashboard').catch(() => ({
    totalUsers: 0,
    totalDrivers: 0,
    totalWorkshops: 0,
    totalBookings: 0,
    revenue: 0,
    pendingApprovals: 0,
    recentActivity: []
  }));

  if (path === '/admin/approvals') {
    const all = await request('/admin/drivers').catch(() => []);
    return normalizeList(all, ['users', 'data']).filter((item) => ['pending', 'inactive'].includes(item.status));
  }
  if (path === '/admin/drivers') {
    const all = await request('/admin/drivers').catch(() => []);
    return normalizeList(all, ['users', 'data']);
  }
  if (path === '/admin/workshops') {
    const all = await request('/admin/workshops').catch(() => []);
    return normalizeList(all, ['workshops', 'data']);
  }
  if (path === '/admin/bookings') return normalizeList(await request('/admin/bookings').catch(() => []), ['bookings']).map(adaptBooking);
  if (path === '/admin/services') return normalizeList(await request('/services').catch(() => []), ['services']);
  if (path === '/admin/packages') return normalizeList(await request('/packages').catch(() => []), ['packages']);
  if (path === '/admin/logs') return [];
  if (path === '/admin/settings') return request('/users/me').then((data) => data.user || data);

  if (path === '/admin/diagnostics') return request('/admin/diagnostics').then((data) => normalizeList(data, ['data']));
  if (path === '/admin/emergency') return request('/admin/emergency').then((data) => normalizeList(data, ['data']));
  if (path === '/admin/chat/workshops') return request('/admin/chat/workshops').then((data) => data?.data || []);
  if (path === '/admin/chat/drivers') return request('/admin/chat/drivers').then((data) => data?.data || []);

  if (path === '/driver/emergency') return request('/driver/emergency').then((data) => normalizeList(data, ['data']));
  if (path === '/driver/direct-messages') return request('/driver/direct-messages').then((data) => normalizeList(data, ['data']));

  if (path.startsWith('/driver/tracking/')) {
    const bookingId = path.split('/').pop();
    return request(`/tracking/${bookingId}`).then((data) => data?.data ? { ...data, updates: data.data } : data).catch(() => ({ updates: [], booking: null }));
  }

  return request(path);
};

export const api = async (path, options = {}) => {
  if (!options.method || options.method === 'GET') return virtualGet(path);

  if (path === '/auth/register') {
    return request('/auth/register', options);
  }

  if (path === '/driver/vehicles') return request('/vehicles', options);
  if (path.startsWith('/driver/vehicles/')) return request(`/vehicles/${path.split('/').pop()}`, options);
  if (path === '/driver/bookings') return request('/bookings', options);
  if (path === '/driver/diagnostics') return request('/driver/diagnostics', options);
  if (path === '/driver/profile') return request('/driver/profile', options);
  if (path === '/driver/emergency') return request('/driver/emergency', options);
  if (path.match(/^\/driver\/emergency\/[^/]+\/cancel$/)) {
    const id = path.split('/')[3];
    return request(`/driver/emergency/${id}/cancel`, options);
  }
  if (path.startsWith('/driver/emergency/') && !path.includes('/cancel')) return request(`/${path.split('/').pop()}`, options);
  if (path === '/driver/direct-messages') return request('/driver/direct-messages', options);
  if (path === '/driver/packages/checkout') return request('/driver/packages/checkout', options);

  if (path === '/vehicles') return request('/vehicles', options);
  if (path.startsWith('/vehicles/')) return request(`/vehicles/${path.split('/').pop()}`, options);
  if (path === '/bookings') return request('/bookings', options);

  if (path === '/workshop/services') return request('/workshop-portal/services', options).then(payload).catch(() => request('/workshop/services', options));

  if (path.startsWith('/workshop/services/')) {
    const id = path.split('/').pop();
    if (options.method === 'DELETE') return request(`/workshop-portal/services/${id}`, options).catch(() => request(`/workshop/services/${id}`, options));
  }

  if (path === '/workshop/slots') {
    return request('/workshop-portal/slots', { ...options, method: 'PUT' }).then((data) => {
      const result = payload(data);
      const slots = Array.isArray(result) ? result : result?.availableSlots || result?.slots || [];
      return slots.map((slot) => ({
        id: slot,
        value: slot,
        date: String(slot).slice(0, 10),
        time: String(slot).slice(11, 16),
        booked: false
      }));
    });
  }

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

  if (path.startsWith('/workshop/diagnostics/') && path.endsWith('/create-repair-task')) {
    const id = path.split('/')[3];
    return request(`/diagnostics/workshop/${id}/create-repair-task`, options).then(payload);
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
    return request('/workshop/profile', options);
  }

  if (path === '/chatbot/message') return request('/chatbot/message', options);

  if (path.match(/^\/admin\/emergency\/[^/]+\/assign-workshop$/)) {
    const id = path.split('/')[3];
    return request(`/admin/emergency/${id}/assign-workshop`, options);
  }

  if (path.match(/^\/admin\/chat\/workshops\/[^/]+$/)) return request(path.replace('/admin/', '/admin/'), options);
  if (path.match(/^\/admin\/chat\/drivers\/[^/]+$/)) return request(path.replace('/admin/', '/admin/'), options);

  if (path === '/ratings') {
    const ratingBody = readJsonBody(options.body);
    if (['workshop_by_customer', 'customer_by_workshop'].includes(ratingBody.ratingType)) {
      const reviewPayload = {
        bookingId: ratingBody.bookingId,
        rating: ratingBody.stars ?? ratingBody.rating,
        comment: ratingBody.comment || ''
      };

      return request('/reviews', {
        ...options,
        body: JSON.stringify(reviewPayload)
      }).then(payload).catch((error) => {
        if (error.statusCode === 404) return request('/ratings', options).then(payload);
        throw error;
      });
    }

    return request('/ratings', options).then(payload);
  }

  return request(path, options);
};

export const get = (path) => api(path);

export const post = (path, body) =>
  api(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) });

export const put = (path, body) =>
  api(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) });

export const patch = (path, body) =>
  api(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) });

export const del = (path) =>
  api(path, { method: 'DELETE' });

export const uploadDocument = async (body) => {
  if (!(body instanceof FormData)) return request('/documents', { method: 'POST', body: JSON.stringify(body) });
  return request('/documents', { method: 'POST', body }).then(payload);
};
