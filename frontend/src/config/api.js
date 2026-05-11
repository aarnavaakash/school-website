const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const API_ORIGIN = rawApiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
