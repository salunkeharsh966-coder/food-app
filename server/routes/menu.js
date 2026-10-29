import { Router } from 'express';
import { db } from '../db.js';
import { notFound } from '../validate.js';

const router = Router();

const SORTS = {
  recommended: 'is_signature DESC, rating DESC',
  rating: 'rating DESC, review_count DESC',
  'price-asc': 'price ASC',
  'price-desc': 'price DESC',
  newest: 'id ASC',
};

/** GET /api/menu-items?category=&search=&diet=&spice=&sort=&limit= */
router.get('/', (req, res) => {
  const { category, search, diet, spice, sort, limit } = req.query;
  const where = ['is_available = 1'];
  const params = {};

  if (category && category !== 'all') {
    where.push('category_slug = @category');
    params.category = String(category);
  }
  if (search) {
    where.push('(name LIKE @q OR description LIKE @q OR allergens LIKE @q)');
    params.q = `%${String(search).trim()}%`;
  }
  if (diet === 'veg') where.push('is_veg = 1');
  if (diet === 'non-veg') where.push('is_veg = 0');
  if (spice === 'mild') where.push('spice_level <= 1');
  if (spice === 'spicy') where.push('spice_level >= 2');

  const orderBy = SORTS[sort] || SORTS.recommended;
  const max = Math.min(Math.max(parseInt(limit, 10) || 100, 1), 100);

  const rows = db
    .prepare(`SELECT * FROM menu_items WHERE ${where.join(' AND ')} ORDER BY ${orderBy} LIMIT ${max}`)
    .all(params);

  res.json({ count: rows.length, items: rows.map(shape) });
});

/** GET /api/menu-items/:slug */
router.get('/:slug', (req, res) => {
  const row = db.prepare('SELECT * FROM menu_items WHERE slug = ?').get(req.params.slug);
  if (!row) return notFound(res, `No dish called "${req.params.slug}".`);

  const cat = db.prepare('SELECT * FROM categories WHERE slug = ?').get(row.category_slug);
  const related = db
    .prepare('SELECT * FROM menu_items WHERE category_slug = ? AND slug <> ? AND is_available = 1 LIMIT 3')
    .all(row.category_slug, row.slug);

  res.json({ item: shape(row), category: cat ?? null, related: related.map(shape) });
});

function shape(r) {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    price: r.price,
    category: r.category_slug,
    image: r.image,
    isVeg: !!r.is_veg,
    spiceLevel: r.spice_level,
    rating: r.rating,
    reviewCount: r.review_count,
    prepMinutes: r.prep_minutes,
    isSignature: !!r.is_signature,
    allergens: r.allergens ? r.allergens.split(',').map((s) => s.trim()).filter(Boolean) : [],
  };
}

export default router;
