import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, money } from '../api.js';
import { ErrorState } from '../components/States.jsx';

export default function Confirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    api
      .getOrder(orderNumber)
      .then((d) => {
        if (cancelled) return;
        setOrder(d.order);
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
  }, [orderNumber]);

  if (status === 'loading') {
    return (
      <div className="page">
        <div className="skeleton__line skeleton__line--title" />
        <div className="skeleton__line" />
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

  const eta = new Date(Date.now() + 35 * 60 * 1000);
  const etaText = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="page">
      <div className="confirm">
        <div className="confirm__tick" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        </div>

        <h1 className="confirm__title">Order confirmed</h1>
        <p className="confirm__lede">
          Thank you, {order.customer.name.split(' ')[0]}. The kitchen has it and we have sent a
          confirmation to {order.customer.email}.
        </p>

        <div className="confirm__number">
          <span className="confirm__number-label">Order number</span>
          <strong className="confirm__number-value">{order.orderNumber}</strong>
        </div>

        <div className="confirm__eta">
          {order.fulfilment === 'delivery' ? (
            <>Arriving by about <strong>{etaText}</strong></>
          ) : (
            <>Ready to collect by about <strong>{etaText}</strong></>
          )}
        </div>

        <div className="confirm__grid">
          <section className="confirm__panel">
            <h2 className="confirm__panel-title">What you ordered</h2>
            <ul className="summary__items">
              {order.items.map((i) => (
                <li key={i.name}>
                  <span className="summary__qty">{i.quantity}×</span>
                  <span className="summary__name">{i.name}</span>
                  <span className="summary__amt">{money(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="summary__rows">
              <div><dt>Subtotal</dt><dd>{money(order.totals.subtotal)}</dd></div>
              <div><dt>Tax</dt><dd>{money(order.totals.tax)}</dd></div>
              <div>
                <dt>{order.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</dt>
                <dd>{order.totals.deliveryFee === 0 ? <span className="summary__free">Free</span> : money(order.totals.deliveryFee)}</dd>
              </div>
              {order.totals.tip > 0 && <div><dt>Tip</dt><dd>{money(order.totals.tip)}</dd></div>}
            </dl>
            <div className="summary__total">
              <span>Total</span>
              <strong>{money(order.totals.total)}</strong>
            </div>
          </section>

          <section className="confirm__panel">
            <h2 className="confirm__panel-title">
              {order.fulfilment === 'delivery' ? 'Delivering to' : 'Collect from'}
            </h2>
            {order.fulfilment === 'delivery' ? (
              <address className="confirm__address">
                {order.customer.name}<br />
                {order.address.line1}<br />
                {order.address.city} {order.address.postcode}<br />
                {order.customer.phone}
              </address>
            ) : (
              <address className="confirm__address">
                42 Brick Lane<br />
                Shoreditch, London E1 6RF<br />
                <a href="tel:+442079460958">+44 20 7946 0958</a>
              </address>
            )}

            {order.address.notes && (
              <p className="confirm__notes">
                <strong>Your note:</strong> {order.address.notes}
              </p>
            )}

            <p className="confirm__status">
              Status: <span className="badge badge--ok">{order.status}</span>
            </p>
          </section>
        </div>

        <div className="confirm__actions">
          <Link to="/menu" className="btn btn--primary btn--lg">Order something else</Link>
          <Link to="/" className="btn btn--ghost btn--lg">Back to home</Link>
        </div>

        <p className="confirm__note">
          This is a demonstration project — no payment was taken and no card details were collected.
        </p>
      </div>
    </div>
  );
}
