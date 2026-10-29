import { Router } from 'express';
import { db } from '../db.js';
import { str, fail } from '../validate.js';

const router = Router();

/** POST /api/contact */
router.post('/', (req, res) => {
  const body = req.body ?? {};
  const errors = {};

  const name = str(body.name);
  const email = str(body.email);
  const subject = str(body.subject) || 'General enquiry';
  const message = str(body.message);

  if (name.length < 2) errors.name = 'Please tell us your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'That email address does not look right.';
  if (message.length < 10) errors.message = 'Please write at least a sentence or two.';
  if (message.length > 2000) errors.message = 'Please keep it under 2000 characters.';

  if (Object.keys(errors).length > 0) return fail(res, errors);

  const info = db
    .prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)')
    .run(name, email, subject, message);

  res.status(201).json({
    id: info.lastInsertRowid,
    message: `Thank you, ${name.split(' ')[0]} — we read every one of these and usually reply the same day.`,
  });
});

/** POST /api/newsletter */
router.post('/newsletter', (req, res) => {
  const email = str(req.body?.email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return fail(res, { email: 'That email address does not look right.' });
  }

  const existing = db.prepare('SELECT id FROM newsletter_subscribers WHERE lower(email) = lower(?)').get(email);
  if (existing) {
    return res.status(200).json({ alreadySubscribed: true, message: 'You are already on the list — see you Friday.' });
  }

  db.prepare('INSERT INTO newsletter_subscribers (email) VALUES (?)').run(email);
  res.status(201).json({ alreadySubscribed: false, message: 'You are in. One short email every Friday, nothing else.' });
});

/** GET /api/contact — small admin view so submissions are demonstrably persisted */
router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY id DESC LIMIT 50').all();
  const subs = db.prepare('SELECT email, created_at FROM newsletter_subscribers ORDER BY id DESC LIMIT 50').all();
  res.json({
    messages: rows.map((r) => ({ id: r.id, name: r.name, email: r.email, subject: r.subject, message: r.message, createdAt: r.created_at })),
    subscribers: subs.map((s) => ({ email: s.email, createdAt: s.created_at })),
  });
});

export default router;
