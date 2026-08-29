import { useState, useCallback } from "react";
import { callStart, callAnswer } from "./api/akinator";
import Landing from "./components/Landing";
import GameScreen from "./components/GameScreen";
import RevealScreen from "./components/RevealScreen";
import MapTimeline from "./components/MapTimeline";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [session, setSession] = useState({ probabilities: [], asked_questions: [] });
  const [question, setQuestion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await callStart();
      setSession(res.session_state);
      setQuestion(res.first_question);
      setConfidence(res.session_state.probabilities.length ? Math.max(...res.session_state.probabilities) : 0);
      setPrediction(null);
      setScreen("game");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const answer = useCallback(
    async (ans) => {
      if (!question) return;
      setLoading(true);
      setError(null);
      try {
        const res = await callAnswer(session, question.id, ans);
        setSession(res.session_state);
        setConfidence(res.confidence);
        if (res.is_finished) {
          setPrediction(res.prediction);
          setScreen("reveal");
        } else {
          setQuestion(res.next_question);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [session, question]
  );

  const restart = useCallback(() => {
    setScreen("landing");
    setSession({ probabilities: [], asked_questions: [] });
    setQuestion(null);
    setPrediction(null);
    setConfidence(0);
    setError(null);
  }, []);

  return (
    <div className="jg-app">
      <div className="jg-shell">
        {screen === "landing" && <Landing onStart={start} loading={loading} error={error} />}
        {screen === "game" && (
          <GameScreen session={session} question={question} confidence={confidence} lang={lang} setLang={setLang} onAnswer={answer} loading={loading} error={error} />
        )}
        {screen === "reveal" && prediction && (
          <RevealScreen prediction={prediction} confidence={confidence} onExplore={() => setScreen("map")} onRestart={restart} />
        )}
        {screen === "map" && prediction && <MapTimeline entity={prediction} onBack={() => setScreen("reveal")} onRestart={restart} />}
      </div>
    </div>
  );
}