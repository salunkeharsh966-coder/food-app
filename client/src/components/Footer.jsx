import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  async function subscribe(e) {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('That email address does not look right.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.subscribe(email.trim());
      toast.success(res.message);
      setEmail('');
    } catch (err) {
      setError(err.fields?.email || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col footer__col--brand">
          <p className="footer__brand">Saffron <em>&amp;</em> Smoke</p>
          <p className="footer__blurb">
            A small Indian kitchen on Brick Lane. Everything is cooked to order, in small batches,
            and sent out the moment it is ready.
          </p>
        </div>

        <div className="footer__col">
          <h3 className="footer__head">Find us</h3>
          <address className="footer__address">
            42 Brick Lane<br />
            Shoreditch, London E1 6RF<br />
            <a href="tel:+442079460958">+44 20 7946 0958</a>
          </address>
          <p className="footer__hours">
            Tue–Sun, 5pm – 11pm<br />
            Closed Mondays
          </p>
        </div>

        <div className="footer__col">
          <h3 className="footer__head">Explore</h3>
          <ul className="footer__list">
            <li><Link to="/menu">Full menu</Link></li>
            <li><Link to="/about">Our story</Link></li>
            <li><Link to="/contact">Contact &amp; bookings</Link></li>
            <li><Link to="/cart">Your cart</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__head">One email a week</h3>
          <p className="footer__blurb">
            What is new on the menu, and the occasional thing we are trying out. Nothing else.
          </p>
          <form className="footer__form" onSubmit={subscribe} noValidate>
            <label className="sr-only" htmlFor="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-invalid={!!error}
              aria-describedby={error ? 'newsletter-error' : undefined}
            />
            <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
              {busy ? 'Adding…' : 'Join'}
            </button>
          </form>
          {error && (
            <p className="field__error" id="newsletter-error" role="alert">{error}</p>
          )}
        </div>
      </div>

      <div className="footer__base">
        <p>© {new Date().getFullYear()} Saffron &amp; Smoke. A demonstration project.</p>
        <p>Prices include VAT. Allergen information available on request.</p>
      </div>
    </footer>
  );
}
