export default function Flame({ confidence }) {
  const scale = 0.55 + confidence * 0.7;
  const glow = 8 + confidence * 26;
  return (
    <svg width="52" height="72" viewBox="0 0 52 72" aria-hidden="true">
      <ellipse cx="26" cy="64" rx="16" ry="5" fill="#3A2E22" opacity="0.6" />
      <g
        style={{
          transform: `translate(26px, 46px) scale(${scale})`,
          transformOrigin: "26px 46px",
          transition: "transform 0.6s ease",
        }}
      >
        <path
          d="M0 -34 C 10 -18, 12 -6, 0 8 C -12 -6, -10 -18, 0 -34 Z"
          fill="url(#flameGrad)"
          style={{ filter: `drop-shadow(0 0 ${glow}px #E7A542)` }}
        />
      </g>
      <rect x="18" y="46" width="16" height="18" rx="2" fill="#8A6A3C" />
      <rect x="12" y="60" width="28" height="6" rx="2" fill="#5A4426" />
      <defs>
        <linearGradient id="flameGrad" x1="0" y1="-34" x2="0" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD98A" />
          <stop offset="55%" stopColor="#E7A542" />
          <stop offset="100%" stopColor="#C9522A" />
        </linearGradient>
      </defs>
    </svg>
  );
}