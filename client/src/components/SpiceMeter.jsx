const LABELS = ['Not spicy', 'Mild', 'Medium', 'Hot'];

export default function SpiceMeter({ level = 0, showLabel = false }) {
  const safe = Math.max(0, Math.min(3, level));
  return (
    <span className="spice" title={LABELS[safe]}>
      <span className="spice__chillies" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`spice__chilli${i < safe ? ' is-on' : ''}`} />
        ))}
      </span>
      <span className="sr-only">Spice level: {LABELS[safe]}</span>
      {showLabel && <span className="spice__label">{LABELS[safe]}</span>}
    </span>
  );
}
