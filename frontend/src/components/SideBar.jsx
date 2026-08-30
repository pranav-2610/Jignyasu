export default function Sidebar({ regionName, results, onPick, onClose }) {
  return (
    <div className="jg-sidebar">
      <div className="jg-sidebar-header">
        <span className="jg-sidebar-title">
          {regionName ? `Near ${regionName}` : "Nearby"}
        </span>
        <button className="jg-sidebar-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      {results.length === 0 ? (
        <div className="jg-sidebar-empty">Nothing catalogued in this area yet.</div>
      ) : (
        <div className="jg-sidebar-list">
          {results.map((r) => (
            <button key={r.id} className="jg-sidebar-item" onClick={() => onPick(r.id)}>
              <div className="jg-sidebar-item-name">{r.canonical_name}</div>
              <div className="jg-sidebar-item-meta">
                {r.category} · {r.distance_km} km away
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
