import { API_BASE_URL, STORAGE_KEYS } from '../config/api.js';
import { fallbackBookings, fallbackPackages, fallbackServices, fallbackWorkshops } from '../data/fallbackData.js';

const token = () => localStorage.getItem(STORAGE_KEYS.token);

const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error(data.message || 'Session expired. Please login again.');
  }

  if (!response.ok) throw new Error(data.message || 'Request failed');

  return data;
};

const list = (data, keys = []) => {
  const normalize = (items) => items.map((item) => ({ ...item, id: item.id || item._id }));
  if (Array.isArray(data)) return normalize(data);
  if (Array.isArray(data?.data)) return normalize(data.data);
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return normalize(data[key]);
    if (Array.isArray(data?.data?.[key])) return normalize(data.data[key]);
  }
  return [];
};

const adaptBooking = (booking) => ({
  ...booking,
  id: booking.id || booking._id,
  service: booking.service || booking.serviceId || booking.serviceRef,
  workshop: booking.workshop || booking.workshopId || booking.workshopRef,
  driver: booking.user || booking.driver || booking.userId,
  status: booking.status || 'pending',
  timeline: booking.timeline || ['Requested', booking.status || 'Pending'],
  progress: booking.progress ?? (booking.status === 'completed' ? 100 : booking.status === 'in_progress' ? 55 : 20)
});

const virtualGet = async (path) => {
  if (path === '/public/landing') {
    const [services, packagesData, workshops] = await Promise.all([
      request('/services').catch(() => fallbackServices),
      request('/packages').catch(() => fallbackPackages),
      request('/workshops').catch(() => fallbackWorkshops)
    ]);

    return {
      services: list(services, ['services']),
      packages: list(packagesData, ['packages']),
      workshops: list(workshops, ['workshops']),
      testimonials: []
    };
  }

  if (path === '/driver/dashboard') {
    const [me, vehicles, bookings, workshops, notifications] = await Promise.all([
      request('/users/me').catch(() => null),
      request('/vehicles').catch(() => []),
      request('/bookings').catch(() => fallbackBookings),
      request('/workshops').catch(() => fallbackWorkshops),
      request('/notifications').catch(() => [])
    ]);

    const recentBookings = list(bookings, ['bookings']).map(adaptBooking);

    return {
      user: me?.user || me,
      vehicles: list(vehicles, ['vehicles']),
      activeBooking: recentBookings.find((booking) => booking.status !== 'completed'),
      recentBookings,
      diagnostics: [],
      nearbyWorkshops: list(workshops, ['workshops']),
      activity: list(notifications, ['notifications']).slice(0, 5).map((item, index) => ({
        id: item.id || item._id || index,
        message: item.message || item.title || 'Notification update'
      }))
    };
  }

  if (path === '/driver/vehicles') return list(await request('/vehicles'), ['vehicles']);
  if (path === '/driver/services') return list(await request('/services').catch(() => fallbackServices), ['services']);
  if (path === '/driver/workshops') return list(await request('/workshops').catch(() => fallbackWorkshops), ['workshops']);
  if (path.startsWith('/driver/workshops/')) return request(`/workshops/${path.split('/').pop()}`);
  if (path === '/driver/bookings') return list(await request('/bookings').catch(() => fallbackBookings), ['bookings']).map(adaptBooking);
  if (path.startsWith('/driver/bookings/')) return adaptBooking(await request(`/bookings/${path.split('/').pop()}`));
  if (path === '/driver/diagnostics') return [];
  if (path === '/driver/profile') return request('/users/me').then((data) => data.user || data);
  if (path === '/driver/chat') return list(await request('/chat/rooms'), ['rooms', 'chats']);
  if (path === '/driver/notifications') return list(await request('/notifications'), ['notifications']);

  if (path === '/workshop/dashboard') {
    const [me, bookings] = await Promise.all([
      request('/users/me').catch(() => null),
      request('/bookings').catch(() => fallbackBookings)
    ]);

    const jobs = list(bookings, ['bookings']).map(adaptBooking);

    return {
      workshop: me?.workshop || me?.user || me,
      todayJobs: jobs.length,
      pendingRequests: jobs.filter((job) => job.status === 'pending'),
      activeJobs: jobs.filter((job) => ['accepted', 'in_progress', 'confirmed'].includes(job.status)),
      completedJobs: jobs.filter((job) => job.status === 'completed'),
      revenue: jobs.reduce((sum, job) => sum + Number(job.price || job.total || 0), 0),
      rating: me?.rating || me?.workshop?.rating || 4.8,
      recentRequests: jobs
    };
  }

  if (path === '/workshop/requests') return list(await request('/bookings').catch(() => fallbackBookings), ['bookings']).map(adaptBooking).filter((booking) => booking.status === 'pending');
  if (path.startsWith('/workshop/requests/')) return adaptBooking(await request(`/bookings/${path.split('/')[3]}`));
  if (path === '/workshop/active-jobs') return list(await request('/bookings').catch(() => fallbackBookings), ['bookings']).map(adaptBooking).filter((booking) => booking.status !== 'completed');
  if (path === '/workshop/services') return list(await request('/services').catch(() => fallbackServices), ['services']);
  if (path === '/workshop/earnings') return { daily: 0, weekly: 0, monthly: 0, completedJobs: 0, series: [20, 45, 30, 55, 80, 64, 92] };
  if (path === '/workshop/profile') return request('/users/me').then((data) => data.workshop || data.user || data);

  if (path === '/admin/dashboard') return request('/admin/dashboard').catch(() => ({ totalUsers: 128, totalDrivers: 96, totalWorkshops: 18, totalBookings: fallbackBookings.length, revenue: 191900, pendingApprovals: 4, recentActivity: [] }));
  if (path === '/admin/approvals') return list(await request('/admin/users').catch(() => []), ['users']).filter((item) => ['pending', 'inactive'].includes(item.status));
  if (path === '/admin/drivers') return list(await request('/admin/users').catch(() => []), ['users']).filter((item) => ['driver', 'user'].includes(String(item.role).toLowerCase()));
  if (path === '/admin/workshops') return list(await request('/admin/workshops').catch(() => fallbackWorkshops), ['workshops']);
  if (path === '/admin/bookings') return list(await request('/admin/bookings').catch(() => fallbackBookings), ['bookings']).map(adaptBooking);
  if (path === '/admin/services') return list(await request('/services').catch(() => fallbackServices), ['services']);
  if (path === '/admin/packages') return list(await request('/packages').catch(() => fallbackPackages), ['packages']);
  if (path === '/admin/logs') return [];
  if (path === '/admin/settings') return request('/users/me').then((data) => data.user || data);

  return request(path);
};

export const api = async (path, options = {}) => {
  if (!options.method || options.method === 'GET') return virtualGet(path);

  if (path === '/driver/vehicles') return request('/vehicles', options);
  if (path.startsWith('/driver/vehicles/')) return request(`/vehicles/${path.split('/').pop()}`, options);

  if (path === '/driver/bookings') return request('/bookings', options);
  if (path === '/driver/diagnostics') return request('/obd-prediction', options);

  if (path.startsWith('/workshop/requests/') && path.endsWith('/status')) {
    const id = path.split('/')[3];
    return request(`/bookings/${id}/status`, { ...options, method: 'PUT' });
  }

  if (path.startsWith('/driver/emergency/')) {
    return request(`/${path.split('/').pop()}`, options);
  }

  return request(path, options);
};

export const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });
export const put = (path, body) => api(path, { method: 'PUT', body: JSON.stringify(body) });
export const patch = (path, body) => api(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (path) => api(path, { method: 'DELETE' });