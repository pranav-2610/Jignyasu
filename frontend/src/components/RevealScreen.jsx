import Flame from "./Flame";
import ScrollCard from "./ScrollCard";
import { regionalName, sourceTexts } from "../utils/helpers";

export default function RevealScreen({ prediction, confidence, onExplore, onRestart }) {
  const rname = regionalName(prediction);
  const sources = sourceTexts(prediction);

  return (
    <div className="jg-screen">
      <div className="jg-meta" style={{ letterSpacing: 2, textTransform: "uppercase" }}>
        Jigyasu believes it is
      </div>
      <ScrollCard className="jg-scroll-card--reveal">
        <div className="jg-category">{prediction.category}</div>
        <h2 className="jg-entity-name">{prediction.canonical_name}</h2>
        {rname && <div className="jg-regional-name">{rname}</div>}
        {sources.length > 0 && <div className="jg-source">Source: {sources.join(" · ")}</div>}
      </ScrollCard>
      <Flame confidence={confidence} />
      <div className="jg-meta">confidence {(confidence * 100).toFixed(0)}%</div>
      <div className="jg-actions">
        <button className="jg-btn jg-btn-primary jg-btn-primary--sm" onClick={onExplore}>
          See on Map &amp; Timeline
        </button>
        <button className="jg-btn jg-btn-secondary jg-btn-secondary--sm" onClick={onRestart}>
          Play again
        </button>
      </div>
    </div>
  );
}