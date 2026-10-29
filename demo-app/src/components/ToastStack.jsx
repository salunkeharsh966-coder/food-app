import { useToast } from '../context/ToastContext.jsx';

export default function ToastStack() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`}>
          <span className="toast__icon" aria-hidden="true">
            {t.tone === 'error' ? '!' : t.tone === 'info' ? 'i' : '✓'}
          </span>
          <p className="toast__text">{t.message}</p>
          <button
            type="button"
            className="toast__close"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
