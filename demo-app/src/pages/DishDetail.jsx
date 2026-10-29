import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, imageUrl, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SpiceMeter from '../components/SpiceMeter.jsx';
import DishCard from '../components/DishCard.jsx';
import { ErrorState } from '../components/States.jsx';

export default function DishDetail() {
  const { slug } = useParams();
  const { add } = useCart();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setQty(1);
    api
      .getDish(slug)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="page">
        <div className="detail detail--skeleton">
          <div className="skeleton skeleton__media skeleton__media--tall" />
          <div>
            <div className="skeleton__line skeleton__line--title" />
            <div className="skeleton__line" />
            <div className="skeleton__line skeleton__line--short" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="page">
        <ErrorState message={error} />
        <p className="detail__back">
          <Link to="/menu" className="btn btn--ghost">← Back to the menu</Link>
        </p>
      </div>
    );
  }

  const { item, category, related } = data;

  function handleAdd() {
    add(item, qty);
    toast.success(`${qty} × ${item.name} added to your cart.`);
  }

  return (
    <div className="page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/menu">Menu</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/menu?category=${item.category}`}>{category?.name ?? item.category}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{item.name}</span>
      </nav>

      <article className="detail">
        <div className="detail__media">
          <img src={imageUrl(item.image)} alt={item.name} width="1000" height="750" />
          {item.isSignature && <span className="dish__flag">Kitchen favourite</span>}
        </div>

        <div className="detail__body">
          <div className="detail__badges">
            <span className={`badge badge--${item.isVeg ? 'veg' : 'nonveg'}`}>
              {item.isVeg ? 'Vegetarian' : 'Contains meat'}
            </span>
            <span className="badge">{item.prepMinutes} min to cook</span>
          </div>

          <h1 className="detail__title">{item.name}</h1>

          <div className="detail__meta">
            <span className="dish__rating">
              <span aria-hidden="true">★</span> {item.rating.toFixed(1)}
              <span className="dish__reviews">({item.reviewCount} reviews)</span>
            </span>
            <SpiceMeter level={item.spiceLevel} showLabel />
          </div>

          <p className="detail__desc">{item.description}</p>

          {item.allergens.length > 0 && (
            <p className="detail__allergens">
              <strong>Allergens:</strong> {item.allergens.join(', ')}
            </p>
          )}

          <div className="detail__buy">
            <p className="detail__price">{money(item.price)}</p>

            <div className="qty" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty__value" aria-live="polite">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                disabled={qty >= 20}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button type="button" className="btn btn--primary btn--lg" onClick={handleAdd}>
              Add {qty > 1 ? `${qty} ` : ''}to cart · {money(item.price * qty)}
            </button>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section">
          <div className="section__head">
            <div>
              <p className="section__eyebrow">Goes well with</p>
              <h2 className="section__title">More from {category?.name ?? 'the menu'}</h2>
            </div>
          </div>
          <div className="grid grid--dishes">
            {related.map((d, i) => (
              <DishCard dish={d} index={i} key={d.slug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
