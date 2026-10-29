import { Router } from 'express';
import { db } from '../db.js';
import { str, fail, notFound, isInt } from '../validate.js';

const router = Router();

export const DELIVERY_FEE = 49; // whole rupees — prices are stored as integers, no paise
const TAX_RATE = 0.05;
const MAX_QTY = 20;

function generateOrderNumber() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'SS-';
  for (let i = 0; i < 8; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/**
 * POST /api/orders
 * body: {
 *   customer: { name, email, phone },
 *   fulfilment: 'delivery' | 'pickup',
 *   address: { line1, city, postcode, notes },
 *   items: [{ slug, quantity }],
 *   tip: number (optional, rupees)
 * }
 */
router.post('/', (req, res) => {
  const body = req.body ?? {};
  const customer = body.customer ?? {};
  const address = body.address ?? {};
  const errors = {};

  const name = str(customer.name);
  const email = str(customer.email);
  const phone = str(customer.phone);
  const fulfilment = str(body.fulfilment) || 'delivery';

  if (name.length < 2) errors.name = 'Please enter your full name.';
  if (name.length > 80) errors.name = 'That name is a little too long.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'That email address does not look right.';
  if (!/^[+]?[\d\s()-]{7,20}$/.test(phone)) errors.phone = 'Please enter a phone number we can reach you on.';
  if (!['delivery', 'pickup'].includes(fulfilment)) errors.fulfilment = 'Choose delivery or pickup.';

  if (fulfilment === 'delivery') {
    if (str(address.line1).length < 5) errors.line1 = 'Please enter your street address.';
    if (str(address.city).length < 2) errors.city = 'Please enter your city.';
    if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/.test(str(address.postcode))) errors.postcode = 'Please enter a valid postcode.';
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) errors.items = 'Your cart is empty.';
  if (rawItems.length > 40) errors.items = 'That is more items than we can take in one order.';

  const tip = Number(body.tip ?? 0);
  if (!Number.isFinite(tip) || tip < 0 || tip > 5000) errors.tip = 'Tip must be between 0 and 5000.';

  // Resolve every line against the DB — never trust client prices.
  const lines = [];
  const lookup = db.prepare('SELECT * FROM menu_items WHERE slug = ? AND is_available = 1');

  for (const raw of rawItems) {
    const slug = str(raw?.slug);
    const quantity = Number(raw?.quantity);

    if (!slug) {
      errors.items = 'One of the items in your cart is missing its dish.';
      break;
    }
    if (!isInt(quantity) || quantity < 1 || quantity > MAX_QTY) {
      errors.items = `Quantities must be whole numbers between 1 and ${MAX_QTY}.`;
      break;
    }

    const dish = lookup.get(slug);
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
        menuItemId: dish.id,
        slug: dish.slug,
        name: dish.name,
        unitPrice: dish.price,
        quantity,
        lineTotal: dish.price * quantity,
      });
    }
  }

  if (Object.keys(errors).length > 0) return fail(res, errors);
  if (lines.length === 0) return fail(res, { items: 'Your cart is empty.' });

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0;
  const tipRupees = Math.round(tip);
  const total = subtotal + tax + deliveryFee + tipRupees;

  let orderNumber = generateOrderNumber();
  while (db.prepare('SELECT 1 FROM orders WHERE order_number = ?').get(orderNumber)) {
    orderNumber = generateOrderNumber();
  }

  const insertOrder = db.prepare(`
    INSERT INTO orders
      (order_number, customer_name, email, phone, fulfilment, address_line, city, postcode, notes,
       subtotal, tax, delivery_fee, tip, total, status)
    VALUES
      (@orderNumber, @name, @email, @phone, @fulfilment, @line1, @city, @postcode, @notes,
       @subtotal, @tax, @deliveryFee, @tip, @total, 'CONFIRMED')
  `);

  const insertLine = db.prepare(`
    INSERT INTO order_items (order_id, menu_item_id, name, unit_price, quantity, line_total)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const place = db.transaction(() => {
    const info = insertOrder.run({
      orderNumber,
      name,
      email,
      phone,
      fulfilment,
      line1: fulfilment === 'delivery' ? str(address.line1) : null,
      city: fulfilment === 'delivery' ? str(address.city) : null,
      postcode: fulfilment === 'delivery' ? str(address.postcode) : null,
      notes: str(address.notes) || null,
      subtotal,
      tax,
      deliveryFee,
      tip: tipRupees,
      total,
    });
    for (const l of lines) {
      insertLine.run(info.lastInsertRowid, l.menuItemId, l.name, l.unitPrice, l.quantity, l.lineTotal);
    }
    return info.lastInsertRowid;
  });

  const orderId = place();
  const order = loadOrder(orderId);

  res.status(201).json({
    order,
    message: `Order ${orderNumber} confirmed. Thank you, ${name.split(' ')[0]}!`,
  });
});

/** GET /api/orders/:orderNumber */
router.get('/:orderNumber', (req, res) => {
  const row = db.prepare('SELECT id FROM orders WHERE order_number = ?').get(req.params.orderNumber);
  if (!row) return notFound(res, `We could not find an order with the number ${req.params.orderNumber}.`);
  res.json({ order: loadOrder(row.id) });
});

/** GET /api/orders?email=&limit= — list orders (newest first) */
router.get('/', (req, res) => {
  const email = str(req.query.email);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

  const rows = email
    ? db.prepare('SELECT id FROM orders WHERE lower(email) = lower(?) ORDER BY id DESC LIMIT ?').all(email, limit)
    : db.prepare('SELECT id FROM orders ORDER BY id DESC LIMIT ?').all(limit);

  res.json({ count: rows.length, orders: rows.map((r) => loadOrder(r.id)) });
});

function loadOrder(id) {
  const o = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!o) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC').all(id);

  return {
    orderNumber: o.order_number,
    status: o.status,
    createdAt: o.created_at,
    fulfilment: o.fulfilment,
    customer: { name: o.customer_name, email: o.email, phone: o.phone },
    address:
      o.fulfilment === 'delivery'
        ? { line1: o.address_line, city: o.city, postcode: o.postcode, notes: o.notes }
        : { notes: o.notes },
    items: items.map((i) => ({
      name: i.name,
      unitPrice: i.unit_price,
      quantity: i.quantity,
      lineTotal: i.line_total,
    })),
    totals: {
      subtotal: o.subtotal,
      tax: o.tax,
      deliveryFee: o.delivery_fee,
      tip: o.tip,
      total: o.total,
    },
  };
}

export default router;
