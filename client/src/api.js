// Thin API client. In dev, Vite proxies /api to the Express server on :4000.
// In production the same origin serves both, so a relative base works everywhere.
const BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields || {};
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new ApiError('We could not reach the kitchen. Check your connection and try again.', 0, {});
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(
      (data && data.error) || `Request failed (${res.status})`,
      res.status,
      (data && data.fields) || {}
    );
  }
  return data;
}

export const api = {
  getCategories: () => request('/api/categories'),

  getMenu: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') qs.set(k, v);
    });
    const s = qs.toString();
    return request(`/api/menu-items${s ? `?${s}` : ''}`);
  },

  getDish: (slug) => request(`/api/menu-items/${encodeURIComponent(slug)}`),

  createOrder: (payload) =>
    request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),

  getOrder: (orderNumber) => request(`/api/orders/${encodeURIComponent(orderNumber)}`),

  sendContact: (payload) =>
    request('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),

  subscribe: (email) =>
    request('/api/contact/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),
};

export const money = (n) => `\u00a3${Number(n || 0).toFixed(2)}`;
export const imageUrl = (file) => `${import.meta.env.BASE_URL || '/'}images/${file}`;
