/* eslint-disable react-refresh/only-export-components */
const API_BASE = "http://localhost:8000/api/v1/akinator";

export async function callStart() {
  const res = await fetch(`${API_BASE}/start`);
  if (!res.ok) throw new Error(`start failed: ${res.status}`);
  return res.json();
}

export async function callAnswer(sessionState, questionId, answer) {
  const res = await fetch(`${API_BASE}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_state: sessionState, question_id: questionId, answer }),
  });
  if (!res.ok) throw new Error(`answer failed: ${res.status}`);
  return res.json();
}

export { API_BASE };