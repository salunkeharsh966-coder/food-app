import { Link } from 'react-router-dom';
import { imageUrl, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { EmptyState } from '../components/States.jsx';

const TAX_RATE = 0.05;
const DELIVERY_FEE = 49;
const FREE_DELIVERY_OVER = 2500;

export default function Cart() {
  const { lines, subtotal, setQty, remove, clear, count } = useCart();
  const toast = useToast();

  if (lines.length === 0) {
    return (
      <div className="page">
        <header className="page__head">
          <p className="section__eyebrow">Your cart</p>
          <h1 className="page__title">Nothing in here yet</h1>
        </header>
        <EmptyState
          title="Your cart is empty"
          body="Have a look through the menu and add something. The dal makhani is a good place to start."
          action={
            <Link to="/menu" className="btn btn--primary btn--lg">
              Browse the menu
            </Link>
          }
        />
      </div>
    );
  }

  const tax = Math.round(subtotal * TAX_RATE);
  const deliveryFee = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  const total = subtotal + tax + deliveryFee;

  return (
    <div className="page">
      <header className="page__head">
        <p className="section__eyebrow">Your cart</p>
        <h1 className="page__title">
          {count} {count === 1 ? 'item' : 'items'}
        </h1>
      </header>

      <div className="cart">
        <ul className="cart__lines">
          {lines.map((line) => (
            <li className="cart-line" key={line.slug}>
              <Link to={`/dish/${line.slug}`} className="cart-line__media">
                <img src={imageUrl(line.image)} alt={line.name} width="200" height="150" loading="lazy" />
              </Link>

              <div className="cart-line__body">
                <div className="cart-line__top">
                  <h2 className="cart-line__name">
                    <Link to={`/dish/${line.slug}`}>{line.name}</Link>
                  </h2>
                  <p className="cart-line__price">{money(line.price * line.quantity)}</p>
                </div>
                <p className="cart-line__unit">{money(line.price)} each</p>

                <div className="cart-line__controls">
                  <div className="qty qty--sm" role="group" aria-label={`Quantity for ${line.name}`}>
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.quantity - 1)}
                      disabled={line.quantity <= 1}
                      aria-label={`Decrease quantity of ${line.name}`}
                    >
                      −
                    </button>
                    <span className="qty__value" aria-live="polite">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.quantity + 1)}
                      disabled={line.quantity >= 20}
                      aria-label={`Increase quantity of ${line.name}`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-line__remove"
                    onClick={() => {
                      remove(line.slug);
                      toast.info(`${line.name} removed from your cart.`);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="summary" aria-label="Order summary">
          <h2 className="summary__title">Order summary</h2>

          <dl className="summary__rows">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Tax (5%)</dt>
              <dd>{money(tax)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{deliveryFee === 0 ? <span className="summary__free">Free</span> : money(deliveryFee)}</dd>
            </div>
          </dl>

          {deliveryFee > 0 && (
            <p className="summary__hint">
              Add {money(FREE_DELIVERY_OVER - subtotal)} more for free delivery.
            </p>
          )}

          <div className="summary__total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          <Link to="/checkout" className="btn btn--primary btn--lg summary__cta">
            Go to checkout
          </Link>

          <button
            type="button"
            className="summary__clear"
            onClick={() => {
              clear();
              toast.info('Cart cleared.');
            }}
          >
            Clear cart
          </button>

          <p className="summary__note">
            You will choose delivery or pickup on the next step.
          </p>
        </aside>
      </div>
    </div>
  );
}
