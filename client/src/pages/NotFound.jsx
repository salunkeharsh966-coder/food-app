import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="state state--big">
        <p className="state__code">404</p>
        <h1 className="state__title">We could not find that page</h1>
        <p className="state__body">
          The link may be old, or the dish may have come off the menu. Either way, the kitchen is
          still open.
        </p>
        <div className="state__actions">
          <Link to="/menu" className="btn btn--primary btn--lg">See the menu</Link>
          <Link to="/" className="btn btn--ghost btn--lg">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
