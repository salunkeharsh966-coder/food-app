// Shared loading / empty / error blocks so every list has a designed state.

export function LoadingGrid({ count = 6, label = 'Loading the menu' }) {
  return (
    <div className="grid grid--dishes" aria-busy="true" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton" key={i}>
          <div className="skeleton__media" />
          <div className="skeleton__line skeleton__line--title" />
          <div className="skeleton__line" />
          <div className="skeleton__line skeleton__line--short" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="state">
      <div className="state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <h3 className="state__title">{title}</h3>
      <p className="state__body">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <div className="state__icon" aria-hidden="true">!</div>
      <h3 className="state__title">That did not work</h3>
      <p className="state__body">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
