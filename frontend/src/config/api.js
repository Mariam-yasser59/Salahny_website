export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5050/api' : 'https://salahnybackend-production.up.railway.app/api');

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const ALTERNATE_API_BASE_URLS = [
  'http://localhost:5050/api',
  API_BASE_URL,
  'https://salahny-backend-production.up.railway.app/api',
].filter((value, index, list) => value && list.indexOf(value) === index);

export const STORAGE_KEYS = {
  token: 'salahny_token',
  user: 'salahny_user',
  apiBaseUrl: 'salahny_api_base_url'
};
