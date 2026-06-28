export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://salahnybackend-production.up.railway.app/api';

export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const ALTERNATE_API_BASE_URLS = [
  API_BASE_URL,
  'https://salahny-backend-production.up.railway.app/api',
].filter((value, index, list) => value && list.indexOf(value) === index);

export const STORAGE_KEYS = {
  token: 'salahny_token',
  user: 'salahny_user',
  apiBaseUrl: 'salahny_api_base_url'
};
