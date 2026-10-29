import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = 'success') => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((t) => [...t.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 3600);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      success: (m) => push(m, 'success'),
      error: (m) => push(m, 'error'),
      info: (m) => push(m, 'info'),
    }),
    [toasts, dismiss, push]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider');
  return ctx;
}
