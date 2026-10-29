import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'saffron-cart-v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { dish, quantity = 1 } = action;
      const existing = state.find((l) => l.slug === dish.slug);
      if (existing) {
        return state.map((l) =>
          l.slug === dish.slug ? { ...l, quantity: Math.min(l.quantity + quantity, 20) } : l
        );
      }
      return [
        ...state,
        {
          slug: dish.slug,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          isVeg: dish.isVeg,
          quantity: Math.min(quantity, 20),
        },
      ];
    }
    case 'setQty': {
      const q = Math.max(1, Math.min(20, action.quantity));
      return state.map((l) => (l.slug === action.slug ? { ...l, quantity: q } : l));
    }
    case 'remove':
      return state.filter((l) => l.slug !== action.slug);
    case 'clear':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage blocked — the cart still works for this session */
    }
  }, [lines]);

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
    return {
      lines,
      count,
      subtotal,
      add: (dish, quantity) => dispatch({ type: 'add', dish, quantity }),
      setQty: (slug, quantity) => dispatch({ type: 'setQty', slug, quantity }),
      remove: (slug) => dispatch({ type: 'remove', slug }),
      clear: () => dispatch({ type: 'clear' }),
      has: (slug) => lines.some((l) => l.slug === slug),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
