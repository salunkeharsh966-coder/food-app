// ============================================================================
//  DEMO API — an in-browser mirror of the real Express + SQLite backend.
//
//  Only ONE layer is swapped for the static demo: the HTTP client. Every page,
//  component, style and piece of state is the real app, untouched.
//
//  The routing table below maps 1:1 onto server/routes/*.js:
//      GET  /api/categories           -> categories.js  router.get('/')
//      GET  /api/menu-items           -> menu.js        router.get('/')
//      GET  /api/menu-items/:slug     -> menu.js        router.get('/:slug')
//      POST /api/orders               -> orders.js      router.post('/')
//      GET  /api/orders/:orderNumber  -> orders.js      router.get('/:orderNumber')
//      GET  /api/orders               -> orders.js      router.get('/')
//      POST /api/contact              -> contact.js     router.post('/')
//      POST /api/contact/newsletter   -> contact.js     router.post('/newsletter')
//      GET  /api/contact              -> contact.js     router.get('/')
//
//  JSON field names, validation messages, status codes and the {error, fields}
//  envelope are copied from the real controllers, so the frontend renders
//  exactly what the real API would return.
// ============================================================================

import seed from './seed-data.json';
import { ApiError } from './ApiError.js';

const STORAGE_KEY = 'saffron-demo-db-v1';
const DELIVERY_FEE = 49;
const FREE_DELIVERY_OVER = 10000; // matches the cart's free-delivery threshold
const TAX_RATE = 0.05;
const MAX_QTY = 20;

function freshDb() {
  return { orders: [], contacts: [], subscribers: [], nextOrderId: 1, nextMsgId: 1 };
}

// localStorage is the demo's "database". Guarded so a blocked store degrades to
// in-memory rather than throwing.
let memoryDb = null;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshDb();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.orders)) return freshDb();
    return { ...freshDb(), ...parsed };
  } catch {
    return memoryDb || freshDb();
  }
}

function persist(db) {
  memoryDb = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage blocked — keep working in memory for this session */
  }
}

// ---------------------------------------------------------------------------
// helpers mirroring server/validate.js
// ---------------------------------------------------------------------------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;
const POSTCODE_RE = /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

function badRequest(fields, message = 'Please check the highlighted fields.') {
  return { status: 400, body: { error: message, fields } };
}

function notFound(message) {
  return { status: 404, body: { error: message } };
}

function orderNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'SS-';
  for (let i = 0; i < 8; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

const SORTS = {
  recommended: (a, b) => b.isSignature - a.isSignature || b.rating - a.rating,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  newest: (a, b) => a.id - b.id,
};

// ---------------------------------------------------------------------------
// handlers
// ---------------------------------------------------------------------------

function getCategories() {
  return { status: 200, body: { categories: seed.categories, total: seed.total } };
}

function getMenuItems(q) {
  const category = q.get('category');
  const search = q.get('search');
  const diet = q.get('diet');
  const spice = q.get('spice');
  const sort = q.get('sort') || 'recommended';
  const limit = Math.min(Math.max(parseInt(q.get('limit'), 10) || 100, 1), 100);

  let items = seed.items.slice();

  if (category && category !== 'all') items = items.filter((i) => i.category === category);
  if (search) {
    const needle = search.trim().toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(needle) ||
        i.description.toLowerCase().includes(needle) ||
        i.allergens.some((a) => a.toLowerCase().includes(needle))
    );
  }
  if (diet === 'veg') items = items.filter((i) => i.isVeg);
  if (diet === 'non-veg') items = items.filter((i) => !i.isVeg);
  if (spice === 'mild') items = items.filter((i) => i.spiceLevel <= 1);
  if (spice === 'spicy') items = items.filter((i) => i.spiceLevel >= 2);

  items.sort(SORTS[sort] || SORTS.recommended).slice(0, limit);

  return { status: 200, body: { count: items.length, items: items.slice(0, limit) } };
}

function getMenuItem(slug) {
  const item = seed.items.find((i) => i.slug === slug);
  if (!item) return notFound(`No dish called "${slug}".`);

  const category = seed.categories.find((c) => c.slug === item.category) ?? null;
  const related = seed.items
    .filter((i) => i.category === item.category && i.slug !== item.slug)
    .slice(0, 3);

  return { status: 200, body: { item, category, related } };
}

function createOrder(payload) {
  const body = payload || {};
  const customer = body.customer || {};
  const address = body.address || {};
  const errors = {};

  const name = str(customer.name);
  const email = str(customer.email);
  const phone = str(customer.phone);
  const fulfilment = str(body.fulfilment) || 'delivery';

  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (name.length > 80) errors.name = 'That name is a little too long.';
  if (!EMAIL_RE.test(email)) errors.email = 'That email address does not look right.';
  if (!PHONE_RE.test(phone)) errors.phone = 'Please enter a phone number we can reach you on.';
  if (!['delivery', 'pickup'].includes(fulfilment)) errors.fulfilment = 'Choose delivery or pickup.';

  if (fulfilment === 'delivery') {
    if (str(address.line1).length < 5) errors.line1 = 'Please enter your street address.';
    if (str(address.city).length < 2) errors.city = 'Please enter your city.';
    if (!POSTCODE_RE.test(str(address.postcode))) errors.postcode = 'Please enter a valid postcode.';
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) errors.items = 'Your cart is empty.';
  if (rawItems.length > 40) errors.items = 'That is more items than we can take in one order.';

  const tipNum = Number(body.tip ?? 0);
  if (!Number.isFinite(tipNum) || tipNum < 0 || tipNum > 5000) {
    errors.tip = 'Tip must be between 0 and 5000.';
  }

  // Resolve every line against the catalogue — never trust client prices.
  const lines = [];
  for (const raw of rawItems) {
    const slug = str(raw && raw.slug);
    const quantity = Number(raw && raw.quantity);

    if (!slug) {
      errors.items = 'One of the items in your cart is missing its dish.';
      break;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      errors.items = `Quantities must be whole numbers between 1 and ${MAX_QTY}.`;
      break;
    }

    const dish = seed.items.find((i) => i.slug === slug);
    if (!dish) {
      errors.items = `Sorry — "${slug}" is no longer on the menu.`;
      break;
    }

    const existing = lines.find((l) => l.slug === slug);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, MAX_QTY);
      existing.lineTotal = existing.quantity * existing.unitPrice;
    } else {
      lines.push({
        name: dish.name,
        unitPrice: dish.price,
        quantity,
        lineTotal: dish.price * quantity,
      });
    }
  }

  if (Object.keys(errors).length > 0) return badRequest(errors);

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0;
  const tip = Math.round(tipNum);
  const total = subtotal + tax + deliveryFee + tip;

  const db = load();
  let number = orderNumber();
  while (db.orders.some((o) => o.orderNumber === number)) number = orderNumber();

  const order = {
    orderNumber: number,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    fulfilment,
    customer: { name, email, phone },
    address:
      fulfilment === 'delivery'
        ? { line1: str(address.line1), city: str(address.city), postcode: str(address.postcode), notes: str(address.notes) || null }
        : { notes: str(address.notes) || null },
    items: lines,
    totals: { subtotal, tax, deliveryFee, tip, total },
  };

  db.orders.unshift(order);
  db.nextOrderId += 1;
  persist(db);

  return {
    status: 201,
    body: {
      order,
      message: `Order ${number} confirmed. Thank you, ${name.split(' ')[0]}!`,
    },
  };
}

function getOrder(number) {
  const db = load();
  const order = db.orders.find((o) => o.orderNumber === number);
  if (!order) return notFound(`We could not find an order with the number ${number}.`);
  return { status: 200, body: { order } };
}

function listOrders(q) {
  const email = str(q.get('email'));
  const limit = Math.min(Math.max(parseInt(q.get('limit'), 10) || 20, 1), 50);
  const db = load();
  const orders = (email
    ? db.orders.filter((o) => o.customer.email.toLowerCase() === email.toLowerCase())
    : db.orders
  ).slice(0, limit);
  return { status: 200, body: { count: orders.length, orders } };
}

function createContact(payload) {
  const body = payload || {};
  const errors = {};

  const name = str(body.name);
  const email = str(body.email);
  const subject = str(body.subject) || 'General enquiry';
  const message = str(body.message);

  if (name.length < 2) errors.name = 'Please tell us your name.';
  if (!EMAIL_RE.test(email)) errors.email = 'That email address does not look right.';
  if (message.length < 10) errors.message = 'Please write at least a sentence or two.';
  if (message.length > 2000) errors.message = 'Please keep it under 2000 characters.';

  if (Object.keys(errors).length > 0) return badRequest(errors);

  const db = load();
  db.contacts.unshift({
    id: db.nextMsgId,
    name,
    email,
    subject,
    message,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  });
  db.nextMsgId += 1;
  persist(db);

  return {
    status: 201,
    body: {
      id: db.nextMsgId - 1,
      message: `Thank you, ${name.split(' ')[0]} — we read every one of these and usually reply the same day.`,
    },
  };
}

function subscribe(payload) {
  const email = str(payload && payload.email);
  if (!EMAIL_RE.test(email)) return badRequest({ email: 'That email address does not look right.' });

  const db = load();
  if (db.subscribers.some((s) => s.toLowerCase() === email.toLowerCase())) {
    return { status: 200, body: { alreadySubscribed: true, message: 'You are already on the list — see you Friday.' } };
  }
  db.subscribers.unshift(email);
  persist(db);
  return {
    status: 201,
    body: { alreadySubscribed: false, message: 'You are in. One short email every Friday, nothing else.' },
  };
}

function getContacts() {
  const db = load();
  return {
    status: 200,
    body: {
      messages: db.contacts,
      subscribers: db.subscribers.map((email, i) => ({ email, createdAt: `seed-${i}` })),
    },
  };
}

// ---------------------------------------------------------------------------
// router
// ---------------------------------------------------------------------------
const ROUTES = [
  ['GET', /^\/api\/health$/, () => ({
    status: 200,
    body: {
      status: 'ok',
      demo: true,
      counts: { categories: seed.categories.length, menuItems: seed.items.length, orders: load().orders.length },
    },
  })],
  ['GET', /^\/api\/categories$/, getCategories],
  ['GET', /^\/api\/menu-items$/, (m, q) => getMenuItems(q)],
  ['GET', /^\/api\/menu-items\/([^/]+)$/, (m) => getMenuItem(decodeURIComponent(m[1]))],
  ['POST', /^\/api\/orders$/, (m, q, payload) => createOrder(payload)],
  ['GET', /^\/api\/orders\/([^/]+)$/, (m) => getOrder(decodeURIComponent(m[1]))],
  ['GET', /^\/api\/orders$/, (m, q) => listOrders(q)],
  ['POST', /^\/api\/contact\/newsletter$/, (m, q, payload) => subscribe(payload)],
  ['POST', /^\/api\/contact$/, (m, q, payload) => createContact(payload)],
  ['GET', /^\/api\/contact$/, getContacts],
];

export async function demoRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const [rawPath, rawQuery = ''] = path.split('?');
  const query = new URLSearchParams(rawQuery);

  // A touch of latency so loading skeletons are visible, like a real network.
  await new Promise((r) => setTimeout(r, 120));

  for (const [routeMethod, pattern, handler] of ROUTES) {
    if (routeMethod !== method) continue;
    const match = pattern.exec(rawPath);
    if (!match) continue;

    let payload = null;
    if (options.body) {
      try {
        payload = JSON.parse(options.body);
      } catch {
        return Promise.reject(new ApiError('The request body was not valid JSON.', 400, {}));
      }
    }

    const result = handler(match, query, payload);
    if (result.status >= 400) {
      throw new ApiError(result.body.error, result.status, result.body.fields || {});
    }
    return result.body;
  }

  throw new ApiError('That endpoint does not exist.', 404, {});
}

export function resetDemoData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  memoryDb = null;
}

export const demoMeta = { totalItems: seed.total, totalCategories: seed.categories.length };
