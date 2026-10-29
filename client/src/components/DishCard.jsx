import { Link } from 'react-router-dom';
import { money, imageUrl } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SpiceMeter from './SpiceMeter.jsx';

export default function DishCard({ dish, index = 0 }) {
  const { add, has } = useCart();
  const toast = useToast();
  const inCart = has(dish.slug);

  function handleAdd(e) {
    e.preventDefault();
    add(dish, 1);
    toast.success(`${dish.name} added to your cart.`);
  }

  return (
    <article className="dish" style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}>
      <Link to={`/dish/${dish.slug}`} className="dish__media" aria-label={`View ${dish.name}`}>
        <img
          src={imageUrl(dish.image)}
          alt={dish.name}
          loading={index < 4 ? 'eager' : 'lazy'}
          decoding="async"
          width="1000"
          height="750"
        />
        {dish.isSignature && <span className="dish__flag">Kitchen favourite</span>}
        <span
          className={`dish__diet dish__diet--${dish.isVeg ? 'veg' : 'nonveg'}`}
          title={dish.isVeg ? 'Vegetarian' : 'Contains meat'}
        >
          <span aria-hidden="true" />
          <span className="sr-only">{dish.isVeg ? 'Vegetarian' : 'Non-vegetarian'}</span>
        </span>
      </Link>

      <div className="dish__body">
        <div className="dish__top">
          <h3 className="dish__name">
            <Link to={`/dish/${dish.slug}`}>{dish.name}</Link>
          </h3>
          <p className="dish__price">{money(dish.price)}</p>
        </div>

        <p className="dish__desc">{dish.description}</p>

        <div className="dish__meta">
          <span
            className="dish__rating"
            aria-label={`Rated ${dish.rating} out of 5 from ${dish.reviewCount} reviews`}
          >
            <span aria-hidden="true">★</span> {dish.rating.toFixed(1)}
            <span className="dish__reviews">({dish.reviewCount})</span>
          </span>
          <SpiceMeter level={dish.spiceLevel} />
          <span className="dish__time">{dish.prepMinutes} min</span>
        </div>

        <button
          type="button"
          className={`btn btn--add${inCart ? ' is-in' : ''}`}
          onClick={handleAdd}
          aria-label={`Add ${dish.name} to cart`}
        >
          {inCart ? 'Add another' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
