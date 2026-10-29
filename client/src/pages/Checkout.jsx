import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { EmptyState } from '../components/States.jsx';

const TAX_RATE = 0.05;
const DELIVERY_FEE = 49;
const FREE_DELIVERY_OVER = 2500;
const TIPS = [0, 100, 200, 300];

export default function Checkout() {
  const { lines, subtotal, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    fulfilment: 'delivery',
    line1: '',
    city: '',
    postcode: '',
    notes: '',
  });
  const [tip, setTip] = useState(0);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState('');
  const [busy, setBusy] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="page">
        <header className="page__head">
          <p className="section__eyebrow">Checkout</p>
          <h1 className="page__title">There is nothing to check out</h1>
        </header>
        <EmptyState
          title="Your cart is empty"
          body="Add a dish or two and come back — we will keep your place."
          action={<Link to="/menu" className="btn btn--primary btn--lg">Browse the menu</Link>}
        />
      </div>
    );
  }

  const tax = Math.round(subtotal * TAX_RATE);
  const deliveryFee = form.fulfilment === 'delivery' && subtotal < FREE_DELIVERY_OVER ? DELIVERY_FEE : 0;
  const total = subtotal + tax + deliveryFee + tip;

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'That email address does not look right.';
    if (!/^[+]?[\d\s()-]{7,20}$/.test(form.phone.trim())) e.phone = 'Please enter a phone number we can reach you on.';
    if (form.fulfilment === 'delivery') {
      if (form.line1.trim().length < 5) e.line1 = 'Please enter your street address.';
      if (form.city.trim().length < 2) e.city = 'Please enter your city.';
      if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/.test(form.postcode.trim())) e.postcode = 'Please enter a valid postcode.';
    }
    return e;
  }

  async function submit(ev) {
    ev.preventDefault();
    setBanner('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setBanner('Please check the highlighted fields.');
      const first = document.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }

    setBusy(true);
    try {
      const res = await api.createOrder({
        customer: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
        fulfilment: form.fulfilment,
        address: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          postcode: form.postcode.trim(),
          notes: form.notes.trim(),
        },
        items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
        tip,
      });

      clear();
      toast.success(res.message);
      navigate(`/order/${res.order.orderNumber}`);
    } catch (err) {
      if (err.fields && Object.keys(err.fields).length > 0) {
        setErrors(err.fields);
        setBanner(err.message);
      } else {
        setBanner(err.message);
      }
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <header className="page__head">
        <p className="section__eyebrow">Checkout</p>
        <h1 className="page__title">Almost there</h1>
        <p className="page__lede">We only need a few details to get this to you.</p>
      </header>

      <form className="checkout" onSubmit={submit} noValidate>
        <div className="checkout__main">
          {banner && (
            <div className="alert alert--error" role="alert">{banner}</div>
          )}

          <fieldset className="fieldset">
            <legend className="fieldset__legend">How would you like it?</legend>
            <div className="segmented">
              {[
                { value: 'delivery', label: 'Deliver to me', hint: '30 minutes, within 3 miles' },
                { value: 'pickup', label: 'I will collect', hint: 'Ready in 20 minutes' },
              ].map((o) => (
                <label key={o.value} className={`segmented__opt${form.fulfilment === o.value ? ' is-active' : ''}`}>
                  <input
                    type="radio"
                    name="fulfilment"
                    value={o.value}
                    checked={form.fulfilment === o.value}
                    onChange={() => set('fulfilment', o.value)}
                  />
                  <span className="segmented__label">{o.label}</span>
                  <span className="segmented__hint">{o.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset__legend">Your details</legend>
            <div className="field-grid">
              <Field
                id="name" label="Full name" value={form.name} error={errors.name}
                onChange={(v) => set('name', v)} autoComplete="name" placeholder="Aarav Mehta"
              />
              <Field
                id="email" label="Email" type="email" value={form.email} error={errors.email}
                onChange={(v) => set('email', v)} autoComplete="email" placeholder="you@example.com"
              />
              <Field
                id="phone" label="Phone" type="tel" value={form.phone} error={errors.phone}
                onChange={(v) => set('phone', v)} autoComplete="tel" placeholder="+44 7700 900123"
              />
            </div>
          </fieldset>

          {form.fulfilment === 'delivery' && (
            <fieldset className="fieldset">
              <legend className="fieldset__legend">Where to</legend>
              <div className="field-grid">
                <Field
                  id="line1" label="Street address" value={form.line1} error={errors.line1}
                  onChange={(v) => set('line1', v)} autoComplete="address-line1"
                  placeholder="42 Brick Lane" className="field--wide"
                />
                <Field
                  id="city" label="City" value={form.city} error={errors.city}
                  onChange={(v) => set('city', v)} autoComplete="address-level2" placeholder="London"
                />
                <Field
                  id="postcode" label="Postcode" value={form.postcode} error={errors.postcode}
                  onChange={(v) => set('postcode', v)} autoComplete="postal-code" placeholder="E1 6RF"
                />
              </div>
            </fieldset>
          )}

          <fieldset className="fieldset">
            <legend className="fieldset__legend">
              Anything we should know? <span className="fieldset__optional">optional</span>
            </legend>
            <div className="field">
              <label className="sr-only" htmlFor="notes">Notes for the kitchen</label>
              <textarea
                id="notes"
                rows="3"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Allergies, a buzzer that does not work, extra napkins…"
              />
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend className="fieldset__legend">
              Tip the kitchen <span className="fieldset__optional">optional</span>
            </legend>
            <div className="tips" role="group" aria-label="Choose a tip">
              {TIPS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`pill${tip === t ? ' is-active' : ''}`}
                  onClick={() => setTip(t)}
                  aria-pressed={tip === t}
                >
                  {t === 0 ? 'No tip' : money(t)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="summary" aria-label="Order summary">
          <h2 className="summary__title">Your order</h2>

          <ul className="summary__items">
            {lines.map((l) => (
              <li key={l.slug}>
                <span className="summary__qty">{l.quantity}×</span>
                <span className="summary__name">{l.name}</span>
                <span className="summary__amt">{money(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="summary__rows">
            <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
            <div><dt>Tax (5%)</dt><dd>{money(tax)}</dd></div>
            <div>
              <dt>{form.fulfilment === 'delivery' ? 'Delivery' : 'Pickup'}</dt>
              <dd>{deliveryFee === 0 ? <span className="summary__free">Free</span> : money(deliveryFee)}</dd>
            </div>
            {tip > 0 && <div><dt>Tip</dt><dd>{money(tip)}</dd></div>}
          </dl>

          <div className="summary__total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          <button type="submit" className="btn btn--primary btn--lg summary__cta" disabled={busy}>
            {busy ? 'Placing your order…' : `Place order · ${money(total)}`}
          </button>

          <p className="summary__note">
            This is a demonstration — no payment is taken and no card details are collected.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({ id, label, value, onChange, error, type = 'text', className = '', ...rest }) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && <p className="field__error" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
