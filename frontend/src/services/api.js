import { API_BASE_URL, STORAGE_KEYS } from '../config/api.js';
import { fallbackBookings, fallbackPackages, fallbackServices, fallbackWorkshops } from '../data/fallbackData.js';

const token = () => localStorage.getItem(STORAGE_KEYS.token);

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
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
};

const list = (data, keys = []) => {
  const normalize = (items) => items.map((item) => ({ ...item, id: item.id || item._id }));
  if (Array.isArray(data)) return normalize(data);
  for (const key of keys) if (Array.isArray(data?.[key])) return normalize(data[key]);
  return [];
};

const userRole = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}')?.role;

const adaptBooking = (booking) => ({
  ...booking,
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
      services: list(services, ['services', 'data']),
      packages: list(packagesData, ['packages', 'data']),
      workshops: list(workshops, ['workshops', 'data']),
      testimonials: []
    };
  }

  if (path === '/driver/dashboard') {
    const [me, bookings, workshops, notifications] = await Promise.all([
      request('/users/me').catch(() => null),
      request('/bookings').catch(() => fallbackBookings),
      request('/workshops').catch(() => fallbackWorkshops),
      request('/notifications').catch(() => [])
    ]);
    const recentBookings = list(bookings, ['bookings', 'data']).map(adaptBooking);
    return {
      user: me?.user || me,
      vehicles: [{ id: 'current', make: 'My', model: 'Vehicle', plate: 'Connected profile', health: 87, obdStatus: 'Ready' }],
      activeBooking: recentBookings.find((booking) => booking.status !== 'completed'),
      recentBookings,
      diagnostics: [],
      nearbyWorkshops: list(workshops, ['workshops', 'data']),
      activity: list(notifications, ['notifications', 'data']).slice(0, 5).map((item, index) => ({ id: item.id || index, message: item.message || item.title || 'Notification update' }))
    };
  }

  if (path === '/driver/vehicles') return [{ id: 'current', make: 'Profile', model: 'Vehicle', year: 2026, plate: 'From mobile app', health: 87, obdStatus: 'Connected', mileage: 0 }];
  if (path === '/driver/services') return list(await request('/services').catch(() => fallbackServices), ['services', 'data']);
  if (path === '/driver/workshops') return list(await request('/workshops').catch(() => fallbackWorkshops), ['workshops', 'data']);
  if (path.startsWith('/driver/workshops/')) return request(`/workshops/${path.split('/').pop()}`);
  if (path === '/driver/bookings') return list(await request('/bookings').catch(() => fallbackBookings), ['bookings', 'data']).map(adaptBooking);
  if (path.startsWith('/driver/bookings/')) return adaptBooking(await request(`/bookings/${path.split('/').pop()}`));
  if (path === '/driver/diagnostics') return [];
  if (path === '/driver/profile') return request('/users/me').then((data) => data.user || data);
  if (path === '/driver/chat') return list(await request('/chat/rooms'), ['rooms', 'chats', 'data']);
  if (path === '/driver/notifications') return list(await request('/notifications'), ['notifications', 'data']);

  if (path === '/workshop/dashboard') {
    const [me, bookings] = await Promise.all([request('/users/me').catch(() => null), request('/bookings').catch(() => fallbackBookings)]);
    const jobs = list(bookings, ['bookings', 'data']).map(adaptBooking);
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
  if (path === '/workshop/requests') return list(await request('/bookings').catch(() => fallbackBookings), ['bookings', 'data']).map(adaptBooking).filter((booking) => booking.status === 'pending');
  if (path.startsWith('/workshop/requests/')) return adaptBooking(await request(`/bookings/${path.split('/')[3]}`));
  if (path === '/workshop/active-jobs') return list(await request('/bookings').catch(() => fallbackBookings), ['bookings', 'data']).map(adaptBooking).filter((booking) => booking.status !== 'completed');
  if (path === '/workshop/services') return list(await request('/services').catch(() => fallbackServices), ['services', 'data']);
  if (path === '/workshop/earnings') return { daily: 0, weekly: 0, monthly: 0, completedJobs: 0, series: [20, 45, 30, 55, 80, 64, 92] };
  if (path === '/workshop/profile') return request('/users/me').then((data) => data.workshop || data.user || data);

  if (path === '/admin/dashboard') return request('/admin/dashboard').catch(() => ({ totalUsers: 128, totalDrivers: 96, totalWorkshops: 18, totalBookings: fallbackBookings.length, revenue: 191900, pendingApprovals: 4, recentActivity: [] }));
  if (path === '/admin/approvals') return list(await request('/admin/users').catch(() => []), ['users', 'data']).filter((item) => ['pending', 'inactive'].includes(item.status));
  if (path === '/admin/drivers') return list(await request('/admin/users').catch(() => []), ['users', 'data']).filter((item) => ['driver', 'user'].includes(String(item.role).toLowerCase()));
  if (path === '/admin/workshops') return list(await request('/admin/workshops').catch(() => fallbackWorkshops), ['workshops', 'data']);
  if (path === '/admin/bookings') return list(await request('/admin/bookings').catch(() => fallbackBookings), ['bookings', 'data']).map(adaptBooking);
  if (path === '/admin/services') return list(await request('/services').catch(() => fallbackServices), ['services', 'data']);
  if (path === '/admin/packages') return list(await request('/packages').catch(() => fallbackPackages), ['packages', 'data']);
  if (path === '/admin/logs') return [];
  if (path === '/admin/settings') return request('/users/me').then((data) => data.user || data);

  return request(path);
};

export const api = async (path, options = {}) => {
  if (!options.method || options.method === 'GET') return virtualGet(path);
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
