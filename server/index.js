import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { migrate, db } from './db.js';
import menuRoutes from './routes/menu.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import contactRoutes from './routes/contact.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 4000;

migrate();

// Seed automatically on a cold start if the menu is empty (fresh clone / deploy).
const itemCount = db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='menu_items'").get();
if (itemCount.n > 0) {
  const n = db.prepare('SELECT COUNT(*) AS n FROM menu_items').get().n;
  if (n === 0) {
    const { categories, menuItems } = await import('./data/menu.js');
    const insertCategory = db.prepare(
      'INSERT INTO categories (slug, name, tagline, sort_order) VALUES (?, ?, ?, ?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name'
    );
    const insertItem = db.prepare(`INSERT INTO menu_items
      (slug, name, description, price, category_slug, image, is_veg, spice_level, rating, review_count, prep_minutes, is_signature, is_available, allergens)
      VALUES (@slug, @name, @description, @price, @category_slug, @image, @is_veg, @spice_level, @rating, @review_count, @prep_minutes, @is_signature, 1, @allergens)`);
    db.transaction(() => {
      for (const c of categories) insertCategory.run(c.slug, c.name, c.tagline, c.sort_order);
      for (const i of menuItems) insertItem.run({ ...i, allergens: i.allergens ?? '' });
    })();
    console.log('Database was empty — seeded the menu automatically.');
  }
}

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  const counts = {
    categories: db.prepare('SELECT COUNT(*) AS n FROM categories').get().n,
    menuItems: db.prepare('SELECT COUNT(*) AS n FROM menu_items').get().n,
    orders: db.prepare('SELECT COUNT(*) AS n FROM orders').get().n,
  };
  res.json({ status: 'ok', counts, uptime: Math.round(process.uptime()) });
});

app.use('/api/menu-items', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

// Serve the built SPA when it exists (single-service deploy: Railway / Render / Fly).
const clientDist = path.resolve(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'That endpoint does not exist.' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'The request body was not valid JSON.' });
  }
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Saffron & Smoke API listening on http://localhost:${PORT}`);
});
