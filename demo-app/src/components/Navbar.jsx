import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { count } = useCart();
  const { pathname } = useLocation();

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to="/" className="nav__brand" aria-label="Saffron and Smoke, home">
          <span className="nav__mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M12 3c0 3-3 4-3 7a3 3 0 0 0 6 0c0-3-3-4-3-7Z" />
              <path d="M5 21h14" />
              <path d="M7 21c0-3 2-5 5-5s5 2 5 5" />
            </svg>
          </span>
          <span className="nav__wordmark">
            Saffron <em>&amp;</em> Smoke
          </span>
        </Link>

        <nav className="nav__links" aria-label="Main">
          <NavLink to="/menu" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Menu
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Our story
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Contact
          </NavLink>
        </nav>

        <Link
          to="/cart"
          className={`nav__cart${pathname === '/cart' ? ' is-active' : ''}`}
          aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}
        >
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6h15l-1.5 9h-12z" />
            <path d="M6 6 5 3H2" />
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
          </svg>
          <span className="nav__cart-label">Cart</span>
          {count > 0 && <span className="nav__badge">{count}</span>}
        </Link>
      </div>
    </header>
  );
}
