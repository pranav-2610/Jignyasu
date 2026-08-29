import {  sourceTexts, project } from "../utils/helpers";

export default function MapTimeline({ entity, onBack, onRestart }) {
  const coords = entity.spatial_coordinates;
  const pin = coords ? project(coords.latitude, coords.longitude) : null;
  const sources = sourceTexts(entity);

  return (
    <div className="jg-screen">
      <div style={{ textAlign: "center" }}>
        <div className="jg-section-label" style={{ marginBottom: 0 }}>Cultural map &amp; timeline</div>
        <h2 className="jg-subtitle">{entity.canonical_name}</h2>
      </div>

      <div className="jg-map-wrap">
        <svg viewBox="0 0 400 480" width="100%" className="jg-map-svg">
          <path
            d="M 150 40 C 220 30, 300 60, 320 130 C 335 175, 300 200, 310 250 C 320 300, 280 330, 290 380 C 296 410, 270 440, 250 430 C 230 420, 220 390, 195 400 C 170 410, 150 440, 120 420 C 95 405, 100 370, 80 340 C 60 310, 70 260, 55 220 C 42 185, 60 150, 70 110 C 80 70, 110 45, 150 40 Z"
            fill="#233F3A"
            stroke="#3E6B4F"
            strokeWidth="1.5"
          />
          {pin && (
            <g>
              <circle cx={pin.x} cy={pin.y} r="7" fill="#C9522A" stroke="#F1E7D2" strokeWidth="1.5" />
              <circle cx={pin.x} cy={pin.y} r="14" fill="none" stroke="#C9522A" strokeWidth="1" opacity="0.5" />
            </g>
          )}
        </svg>
        {pin && (
          <div className="jg-map-pin-label" style={{ left: `${(pin.x / 400) * 100}%`, top: `${(pin.y / 480) * 100 + 3}%` }}>
            {coords.name}
          </div>
        )}
        {!pin && <div className="jg-map-empty">no coordinates for this entity yet</div>}
        <div className="jg-map-badge">stylized · prototype</div>
      </div>

      <div className="jg-timeline">
        <div className="jg-section-label">Timeline · attested in</div>
        {(sources.length ? sources : ["No source text recorded"]).map((s, i) => (
          <div key={i} className="jg-timeline-item">
            <div className="jg-timeline-dot-col">
              <div className="jg-timeline-dot" />
              {i < sources.length - 1 && <div className="jg-timeline-line" />}
            </div>
            <div className="jg-timeline-text">{s}</div>
          </div>
        ))}
      </div>

      <div className="jg-actions">
        <button className="jg-btn jg-btn-secondary jg-btn-secondary--sm" onClick={onBack}>Back to reveal</button>
        <button className="jg-btn jg-btn-primary jg-btn-primary--sm" onClick={onRestart}>Play again</button>
      </div>
    </div>
  );
}