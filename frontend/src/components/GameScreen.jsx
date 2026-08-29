import Flame from "./Flame";
import ScrollCard from "./ScrollCard";

const ANSWER_OPTIONS = [
  { key: "yes", label: "Yes", variant: "yes" },
  { key: "probably", label: "Probably", variant: "neutral" },
  { key: "unknown", label: "Don't know", variant: "neutral" },
  { key: "probably_not", label: "Probably not", variant: "neutral" },
  { key: "no", label: "No", variant: "no" },
];

export default function GameScreen({ session, question, confidence, lang, setLang, onAnswer, loading, error }) {
  const askedCount = session.asked_questions.length;

  return (
    <div className="jg-screen">
      <div className="jg-row-between">
        <span className="jg-meta">question {askedCount + 1}</span>
        <div className="jg-lang-toggle">
          {["en", "te"].map((l) => (
            <button
              key={l}
              className={`jg-lang-btn ${lang === l ? "jg-lang-btn--active" : ""}`}
              onClick={() => setLang(l)}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <Flame confidence={confidence} />
      <div className="jg-meta">certainty {(confidence * 100).toFixed(0)}%</div>

      <ScrollCard className="jg-scroll-card--question">
        <p className="jg-question-text">{question ? question.text[lang] || question.text.en : "…"}</p>
      </ScrollCard>

      <div className="jg-answers">
        {ANSWER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            disabled={loading}
            onClick={() => onAnswer(opt.key)}
            className={`jg-btn jg-btn-answer jg-btn-answer--${opt.variant}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <div className="jg-error">{error}</div>}

      {askedCount > 0 && (
        <div className="jg-chips">
          {session.asked_questions.map((qid) => (
            <span key={qid} className="jg-chip">
              {qid.replace("q_", "").replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}