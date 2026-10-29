import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imageUrl, money } from '../api.js';
import DishCard from '../components/DishCard.jsx';
import { LoadingGrid, ErrorState } from '../components/States.jsx';

const HIGHLIGHTS = [
  { icon: '🔥', title: 'Cooked to order', body: 'Nothing sits under a lamp. Your curry starts when you order it.' },
  { icon: '🕰️', title: 'Six hours on the dal', body: 'The dal makhani is the one thing we will not rush, ever.' },
  { icon: '🛵', title: 'Warm on arrival', body: 'Insulated bags and a 30-minute radius, so it lands hot.' },
];

export default function Home() {
  const [signature, setSignature] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  async function load() {
    setStatus('loading');
    try {
      const [menu, cats] = await Promise.all([
        api.getMenu({ sort: 'recommended', limit: 6 }),
        api.getCategories(),
      ]);
      setSignature(menu.items);
      setCategories(cats.categories);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero__media">
          <img
            src={imageUrl('hero.jpg')}
            alt="A spread of Indian dishes — biryani, butter chicken, naan and kebabs — on a dark wooden table"
            width="1800"
            height="1012"
            fetchPriority="high"
          />
          <div className="hero__scrim" />
        </div>

        <div className="hero__content">
          <p className="hero__eyebrow">Brick Lane · Shoreditch</p>
          <h1 className="hero__title">
            Slow-fired Indian,
            <br />
            <em>delivered warm.</em>
          </h1>
          <p className="hero__lede">
            A small kitchen with a big tandoor. Biryani sealed under dough, curries that have been
            on the stove since morning, and breads pulled out of the clay wall to order.
          </p>
          <div className="hero__actions">
            <Link to="/menu" className="btn btn--primary btn--lg">
              See the menu
            </Link>
            <Link to="/about" className="btn btn--ghost btn--lg">
              Our story
            </Link>
          </div>
          <dl className="hero__stats">
            <div>
              <dt>Dishes</dt>
              <dd>24</dd>
            </div>
            <div>
              <dt>Average rating</dt>
              <dd>4.8 ★</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>30 min</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <p className="section__eyebrow">Start here</p>
            <h2 className="section__title">What the kitchen is known for</h2>
          </div>
        </div>
        <ul className="highlights">
          {HIGHLIGHTS.map((h) => (
            <li className="highlight" key={h.title}>
              <span className="highlight__icon" aria-hidden="true">{h.icon}</span>
              <h3 className="highlight__title">{h.title}</h3>
              <p className="highlight__body">{h.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <p className="section__eyebrow">Browse</p>
            <h2 className="section__title">Five ways through the menu</h2>
          </div>
          <Link to="/menu" className="section__link">See everything →</Link>
        </div>

        {status === 'error' ? (
          <ErrorState message={error} onRetry={load} />
        ) : (
          <ul className="cat-strip">
            {(status === 'loading' ? Array.from({ length: 5 }) : categories).map((c, i) => (
              <li key={c?.slug ?? i}>
                {c ? (
                  <Link to={`/menu?category=${c.slug}`} className="cat-chip">
                    <span className="cat-chip__name">{c.name}</span>
                    <span className="cat-chip__tag">{c.tagline}</span>
                    <span className="cat-chip__count">{c.count} dishes</span>
                  </Link>
                ) : (
                  <div className="cat-chip cat-chip--skeleton" />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section">
        <div className="section__head">
          <div>
            <p className="section__eyebrow">Kitchen favourites</p>
            <h2 className="section__title">The ones people come back for</h2>
          </div>
          <Link to="/menu" className="section__link">Full menu →</Link>
        </div>

        {status === 'loading' && <LoadingGrid count={6} />}
        {status === 'error' && <ErrorState message={error} onRetry={load} />}
        {status === 'ready' && (
          <div className="grid grid--dishes">
            {signature.map((dish, i) => (
              <DishCard dish={dish} index={i} key={dish.slug} />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="cta">
          <div className="cta__text">
            <h2 className="cta__title">Hungry now?</h2>
            <p className="cta__body">
              Order before 10:30pm and it goes out the same night. Free delivery on orders over{' '}
              {money(2500)}.
            </p>
          </div>
          <Link to="/menu" className="btn btn--primary btn--lg">Order now</Link>
        </div>
      </section>
    </>
  );
}
