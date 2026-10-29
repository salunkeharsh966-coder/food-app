import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
  const counts = db
    .prepare('SELECT category_slug, COUNT(*) AS n FROM menu_items WHERE is_available = 1 GROUP BY category_slug')
    .all()
    .reduce((acc, r) => ({ ...acc, [r.category_slug]: r.n }), {});

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  res.json({
    categories: cats.map((c) => ({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      count: counts[c.slug] ?? 0,
    })),
    total,
  });
});

export default router;
