// DEMO build of the API client.
//
// This is the ONLY file that differs from the real app. The real client talks to
// the Express server over fetch(); this one routes the same calls into the
// in-browser mock (demoApi.js). Every function signature, return shape and error
// type is identical, so no component needs to change.
import { demoRequest } from './demoApi.js';
import { ApiError } from './ApiError.js';

export { ApiError };

async function request(path, options = {}) {
  return demoRequest(path, options);
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
