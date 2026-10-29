# Saffron & Smoke — full-stack food ordering site

A modern Indian kitchen site with a React + Vite frontend and a real Express + SQLite
backend. Menu browsing, category and diet filtering, search, dish detail, cart with
quantity editing, a validated checkout, persisted orders, contact messages and
newsletter signups.

```
saffron-and-smoke/
├── client/                 React 18 + Vite 5 frontend
│   ├── public/images/      25 dish photos (hosted with the project)
│   └── src/
│       ├── pages/          Home, Menu, DishDetail, Cart, Checkout, Confirmation, About, Contact, NotFound
│       ├── components/     Navbar, Footer, DishCard, SpiceMeter, ToastStack, States
│       ├── context/        CartContext, ToastContext
│       ├── styles/         index.css (design system)
│       ├── api.js          fetch wrapper + money/date helpers
│       └── App.jsx         routes
└── server/                 Express 4 + better-sqlite3
    ├── routes/             menu.js, categories.js, orders.js, contact.js
    ├── data/menu.js        seed data (single source of truth)
    ├── db.js               schema + connection
    ├── seed.js             idempotent seed script
    └── index.js            app entry, CORS, SPA serving
```

## Run it

Requires Node 18+.

```bash
cd saffron-and-smoke

# installs both workspaces, seeds the DB, then runs API + Vite together
npm run install:all
npm run seed
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

The Vite dev server proxies `/api` to `:4000`, so there is no CORS setup to do
locally. Override the proxy target with `VITE_API_TARGET` if your API is elsewhere.

## Production build

```bash
npm run build            # builds client/dist
npm start                # Express serves the API *and* client/dist on :4000
```

Open http://localhost:4000 — one process, one port. The server detects
`client/dist` at boot and serves the SPA with an index.html fallback.

## API

Base URL: `/api`

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/health` | Status + row counts |
| GET | `/categories` | All categories with per-category dish counts |
| GET | `/menu-items` | List/filter: `?category=&search=&diet=veg\|non-veg&spice=mild\|spicy&sort=recommended\|rating\|price-asc\|price-desc&limit=` |
| GET | `/menu-items/:slug` | One dish, its category, and 3 related dishes |
| POST | `/orders` | Create an order (server re-prices every line from the DB) |
| GET | `/orders/:orderNumber` | Fetch one order by its order number |
| GET | `/orders` | List orders: `?email=&limit=` |
| POST | `/contact` | Contact / booking enquiry |
| POST | `/contact/newsletter` | Newsletter signup (idempotent) |
| GET | `/contact` | Recent enquiries + subscribers (small admin view) |

### Order payload

```json
{
  "customer": { "name": "Harsh Salunke", "email": "harsh@example.com", "phone": "+44 7700 900123" },
  "fulfilment": "delivery",
  "address": { "line1": "18 Hanbury Street", "city": "London", "postcode": "E1 6QR", "notes": "Extra chutney" },
  "items": [{ "slug": "butter-chicken", "quantity": 2 }, { "slug": "dahi-ke-kebab", "quantity": 1 }],
  "tip": 0
}
```

Errors come back as `400` with a per-field map:

```json
{ "error": "Please check the highlighted fields.",
  "fields": { "email": "That email address does not look right." } }
```

Prices are stored and calculated as whole rupees (integers) — no floating point
money bugs. Delivery is £49, free over £100; tax is 5%.

## Seed data

24 dishes across 5 categories (Small Plates, From the Handi, Breads, Sweets, To Drink),
each with description, price, category, image, veg/non-veg, spice level, rating and
review count. `npm run seed` is idempotent — it upserts by slug, so re-running it never
duplicates rows. The server also seeds automatically if it boots against an empty DB.

## Deploy

**Vercel / Render / Railway (single service):** build command `npm run build`,
start command `npm start`. `server/index.js` serves `client/dist` itself, so no
separate static hosting is needed. Set `DB_PATH` to a persistent volume path if the
platform has an ephemeral filesystem (SQLite is a file).

**Static frontend + separate API:** deploy `client/dist` anywhere and set
`VITE_API_URL=https://your-api.example.com` at build time, then allow that origin
in the server's CORS config.

## Notes

- Cart persists in `localStorage`, so a refresh does not lose it.
- The cart badge, quantity steppers, remove, clear, tax and delivery thresholds all
  recompute live; the server independently re-validates and re-prices every order.
- Route transitions use hash routing (`#/menu`) so the same build works from a
  domain root, a sub-folder, or a plain static host with no rewrite rules.
- All 25 photographs are real professional food photography, stored locally in
  `client/public/images/` — nothing is hotlinked, so no 404s.
