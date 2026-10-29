import { useState } from 'react';
import { resetDemoData, demoMeta } from '../demoApi.js';

export default function DemoBanner() {
  const [open, setOpen] = useState(false);

  function handleReset() {
    resetDemoData();
    window.location.hash = '#/';
    window.location.reload();
  }

  return (
    <div className="demo-banner">
      <div className="demo-banner__bar">
        <span className="demo-banner__tag">DEMO MODE</span>
        <p className="demo-banner__text">
          This is the real React app running with an in-browser mock API. Orders and messages are
          saved in <strong>your browser only</strong> — no server or database is running.
        </p>
        <button
          type="button"
          className="demo-banner__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? 'Hide' : 'What is mocked?'}
        </button>
        <button type="button" className="demo-banner__reset" onClick={handleReset}>
          Reset demo data
        </button>
      </div>

      {open && (
        <div className="demo-banner__panel">
          <p>
            The full-stack project ships a real <strong>Express + SQLite</strong> backend with{' '}
            {demoMeta.totalItems} dishes across {demoMeta.totalCategories} categories. For this
            hosted demo, exactly one layer is swapped: the HTTP client. Every page, component,
            style and piece of state is the untouched production code.
          </p>
          <p>
            The mock mirrors the real API route-for-route — same paths, same JSON field names, same
            validation messages, same status codes and the same{' '}
            <code>{'{ error, fields }'}</code> error envelope. Order totals are recalculated
            server-side in the real app; here the same arithmetic runs in the browser.
          </p>
          <p className="demo-banner__note">
            To run the real thing: <code>npm run install:all &amp;&amp; npm run seed &amp;&amp; npm run dev</code>
          </p>
        </div>
      )}
    </div>
  );
}
