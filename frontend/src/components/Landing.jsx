import { API_BASE } from "../api/akinator";

export default function Landing({ onStart, loading, error }) {
  return (
    <div className="jg-screen jg-screen--center">
      <div className="jg-kicker">सूत्र · Sootra</div>
      <h1 className="jg-title">Jigyasu</h1>
      <p className="jg-lede">
        Think of a figure, a festival, a monument — anything from India's living past.
        Answer a few questions. Watch the flame steady as Jigyasu narrows in.
      </p>
      <button className="jg-btn jg-btn-primary" onClick={onStart} disabled={loading}>
        {loading ? "Connecting…" : "Begin"}
      </button>
      {error && (
        <div className="jg-error">
          {error} — is the backend running at {API_BASE}?
        </div>
      )}
    </div>
  );
}