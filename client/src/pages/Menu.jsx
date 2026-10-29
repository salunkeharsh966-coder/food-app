import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import DishCard from '../components/DishCard.jsx';
import { LoadingGrid, EmptyState, ErrorState } from '../components/States.jsx';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
];

const DIETS = [
  { value: 'all', label: 'Everything' },
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'With meat' },
];

export default function Menu() {
  const [params, setParams] = useSearchParams();

  const category = params.get('category') || 'all';
  const diet = params.get('diet') || 'all';
  const sort = params.get('sort') || 'recommended';

  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [search, setSearch] = useState(params.get('search') || '');

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  // Debounce the search box so we are not firing a request per keystroke.
  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput.trim()), 320);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    api
      .getCategories()
      .then((d) => setCategories(d.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    api
      .getMenu({ category, diet, sort, search })
      .then((d) => {
        if (cancelled) return;
        setItems(d.items);
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
  }, [category, diet, sort, search]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (!value || value === 'all' || (key === 'sort' && value === 'recommended')) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === category),
    [categories, category]
  );

  const filtersActive = category !== 'all' || diet !== 'all' || sort !== 'recommended' || !!search;

  return (
    <div className="page">
      <header className="page__head">
        <p className="section__eyebrow">The menu</p>
        <h1 className="page__title">
          {activeCategory ? activeCategory.name : 'Everything we cook'}
        </h1>
        <p className="page__lede">
          {activeCategory
            ? activeCategory.tagline
            : 'Twenty-four dishes, cooked to order. Filter it down however you like.'}
        </p>
      </header>

      <div className="filters">
        <div className="filters__search">
          <label className="sr-only" htmlFor="menu-search">Search the menu</label>
          <span className="filters__search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            id="menu-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search dishes, ingredients…"
          />
          {searchInput && (
            <button
              type="button"
              className="filters__clear"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="filters__row">
          <div className="filters__group" role="group" aria-label="Filter by diet">
            {DIETS.map((d) => (
              <button
                key={d.value}
                type="button"
                className={`pill${diet === d.value ? ' is-active' : ''}`}
                onClick={() => update('diet', d.value)}
                aria-pressed={diet === d.value}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="filters__select">
            <label className="sr-only" htmlFor="menu-sort">Sort by</label>
            <select id="menu-sort" value={sort} onChange={(e) => update('sort', e.target.value)}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filters__cats" role="group" aria-label="Filter by category">
          <button
            type="button"
            className={`pill pill--cat${category === 'all' ? ' is-active' : ''}`}
            onClick={() => update('category', 'all')}
            aria-pressed={category === 'all'}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={`pill pill--cat${category === c.slug ? ' is-active' : ''}`}
              onClick={() => update('category', c.slug)}
              aria-pressed={category === c.slug}
            >
              {c.name} <span className="pill__count">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="results-bar">
        <p className="results-bar__count" aria-live="polite">
          {status === 'loading'
            ? 'Looking through the kitchen…'
            : `${items.length} ${items.length === 1 ? 'dish' : 'dishes'}${
                search ? ` matching “${search}”` : ''
              }`}
        </p>
        {filtersActive && (
          <button
            type="button"
            className="results-bar__reset"
            onClick={() => {
              setSearchInput('');
              setParams(new URLSearchParams(), { replace: true });
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {status === 'loading' && <LoadingGrid count={6} />}

      {status === 'error' && (
        <ErrorState message={error} onRetry={() => setParams(new URLSearchParams(params))} />
      )}

      {status === 'ready' && items.length === 0 && (
        <EmptyState
          title="Nothing matches that"
          body={
            search
              ? `We could not find anything for “${search}”. Try a shorter word, or clear the filters.`
              : 'No dishes in this combination. Try widening the filters.'
          }
          action={
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setSearchInput('');
                setParams(new URLSearchParams(), { replace: true });
              }}
            >
              Show everything
            </button>
          }
        />
      )}

      {status === 'ready' && items.length > 0 && (
        <div className="grid grid--dishes">
          {items.map((dish, i) => (
            <DishCard dish={dish} index={i} key={dish.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
