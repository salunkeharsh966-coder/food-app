import { db, migrate } from './db.js';
import { categories, menuItems } from './data/menu.js';

migrate();

const insertCategory = db.prepare(
  `INSERT INTO categories (slug, name, tagline, sort_order) VALUES (?, ?, ?, ?)
   ON CONFLICT(slug) DO UPDATE SET name=excluded.name, tagline=excluded.tagline, sort_order=excluded.sort_order`
);

const insertItem = db.prepare(
  `INSERT INTO menu_items
   (slug, name, description, price, category_slug, image, is_veg, spice_level, rating, review_count, prep_minutes, is_signature, is_available, allergens)
   VALUES (@slug, @name, @description, @price, @category_slug, @image, @is_veg, @spice_level, @rating, @review_count, @prep_minutes, @is_signature, 1, @allergens)
   ON CONFLICT(slug) DO UPDATE SET
     name=excluded.name, description=excluded.description, price=excluded.price,
     category_slug=excluded.category_slug, image=excluded.image, is_veg=excluded.is_veg,
     spice_level=excluded.spice_level, rating=excluded.rating, review_count=excluded.review_count,
     prep_minutes=excluded.prep_minutes, is_signature=excluded.is_signature, allergens=excluded.allergens`
);

const run = db.transaction(() => {
  for (const c of categories) insertCategory.run(c.slug, c.name, c.tagline, c.sort_order);
  for (const i of menuItems) insertItem.run({ ...i, allergens: i.allergens ?? '' });
});

run();

const catCount = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
const itemCount = db.prepare('SELECT COUNT(*) AS n FROM menu_items').get().n;
console.log(`Seeded ${catCount} categories and ${itemCount} menu items into the database.`);
