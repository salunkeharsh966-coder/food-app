const Database = require('./server/node_modules/better-sqlite3');
const fs = require('fs');

const db = new Database('./server/data/saffron.db', { readonly: true });
const cats = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
const items = db.prepare('SELECT * FROM menu_items WHERE is_available = 1 ORDER BY id').all();

const shape = (r) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description,
  price: r.price,
  category: r.category_slug,
  image: r.image,
  isVeg: r.is_veg === 1,
  spiceLevel: r.spice_level,
  rating: r.rating,
  reviewCount: r.review_count,
  prepMinutes: r.prep_minutes,
  isSignature: r.is_signature === 1,
  allergens: r.allergens ? r.allergens.split(',').map((s) => s.trim()).filter(Boolean) : [],
});

const out = {
  categories: cats.map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    count: items.filter((i) => i.category_slug === c.slug).length,
  })),
  total: items.length,
  items: items.map(shape),
};

fs.writeFileSync('./demo-app/src/seed-data.json', JSON.stringify(out, null, 2));
console.log('exported', out.categories.length, 'categories and', out.items.length, 'items');
