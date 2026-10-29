// Small hand-rolled validation helpers. Each returns { errors } so handlers can
// answer 400 with a per-field map instead of a bare string.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;
export const POSTCODE_RE = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;

export function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function isInt(n) {
  return typeof n === 'number' && Number.isInteger(n);
}

export function fail(res, errors, message = 'Please check the highlighted fields.') {
  return res.status(400).json({ error: message, fields: errors });
}

export function notFound(res, message = 'Not found') {
  return res.status(404).json({ error: message });
}
