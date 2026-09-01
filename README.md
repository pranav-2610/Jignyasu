**Jigyansu**

**Curiosity as the entry point: guess your way into India's festivals, art, monuments, and traditions, then explore where and when they come alive on a live map and timeline.**

-GROUP-11.

---

## The problem

Indian cultural knowledge is fragmented across static, text-heavy sources built
for people who already know what they're looking for. Existing tools don't let
**curiosity itself** be the entry point, and none of them preserve how regions
and sources *disagree* — most flatten everything into a single "official"
version instead of surfacing that disagreement as part of the story.

## The solution

**Jigyansu** turns discovery into a guessing game instead of a search bar. A
Bayesian question-selection engine ("Culture Akinator") asks targeted
yes/no/probably questions — each one narrows the field *and* teaches
something, unlike a static search — to identify a festival, monument,
tradition, or historical figure with zero prior vocabulary required.

The moment a guess is confirmed, the app hands off instantly to the
**Culture Map & Timeline**: a real, clickable map of India showing where the
answer originates, and a chronological timeline of its history — including,
where traditions genuinely disagree (a figure's birthplace, a festival's
dating), showing that disagreement explicitly rather than picking a winner.

---

## How it works, end to end

```
 Landing → Ask a question → Answer (Yes / Probably / Don't know /
 Probably not / No) → repeat until confident → Guess revealed →
 auto-routed to Map & Timeline for that entity → click a region on the
 map to see who else is associated with it → click through to explore
```

The question engine picks whichever unasked question **maximizes expected
information gain** (entropy reduction) at each step — not a fixed decision
tree — so it adapts to however the game has gone so far and converges in
roughly `log2(number of entities)` questions.

---

## Project structure

```
sootra/
├── frontend/                    React + Vite — the game UI, map, and timeline
│   ├── src/
│   │   ├── api/                 fetch wrappers for both backend APIs
│   │   ├── components/          Landing, GameScreen, RevealScreen,
│   │   │                        MapTimeline, Sidebar, TimelineSlider, ...
│   │   ├── styles/               shared CSS
│   │   └── App.jsx              screen routing + top-level state
│   └── package.json
│
├── src/                          FastAPI backend
│   ├── routers/                 akinator.py, entities.py (map/timeline)
│   ├── schemas/                 Pydantic models for entities, questions,
│   │                            game state, map/timeline data
│   ├── services/                Bayesian engine, data loaders,
│   │                            map/timeline service (nearby search,
│   │                            flattened timeline, etc.)
│   └── ...
│
├── data/
│   ├── entities.json            every playable entity + its attributes
│   ├── questions.json           every question the engine can ask
│   └── map_timeline.json        coordinates + timeline events per entity
│
├── tests/
└── main.py                      FastAPI entrypoint — registers both routers
```

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React + Vite, `react-simple-maps` + `d3-geo` for the India map |
| Backend | FastAPI, Pydantic, NumPy (Bayesian inference engine) |
| Data | Hand-curated JSON — entities, questions, coordinates, timeline events |

---

## Getting started

You need **two terminals running at once** — the backend and frontend are
separate servers.

### Backend

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
Runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Runs at `http://localhost:5173`.

> **Why `--legacy-peer-deps`:** `react-simple-maps` currently declares React
> 16–18 as its peer dependency and hasn't updated that range yet, even though
> it works fine on the React 19 this project uses. A plain `npm install`
> will fail with an `ERESOLVE` error without this flag.

Start the backend first, then the frontend — if the frontend loads before
the backend is up, the app shows a visible error banner rather than failing
silently.

The frontend expects the backend at `http://localhost:8000`. That's set as
`API_BASE` near the top of `frontend/src/api/akinator.js` — change it there
if you run the backend on a different port.

---

## API overview

| Endpoint | Purpose |
|---|---|
| `GET /api/v1/akinator/start` | Begin a game — returns the first question |
| `POST /api/v1/akinator/answer` | Submit an answer — returns the next question or a final guess |
| `GET /api/v1/entities/{id}` | Full entity detail: coordinates + timeline, used for the post-guess map handoff |
| `GET /api/v1/entities` | Browse all entities, optionally filtered by category |
| `GET /api/v1/map/pins` | Every entity with known coordinates, for the map's "explore" overlay |
| `GET /api/v1/map/nearby?lat=&lng=&radius_km=` | Everyone associated with a clicked region, closest first — powers the sidebar |

---

## Known issues / in progress

- **Schema field mismatch:** `entities.json` currently uses `regional_names` /
  `source_texts` (plural); the Pydantic schema expects `regional_name` /
  `source_text` (singular). Needs a one-line rename to line up — until fixed,
  those fields come back empty from the API. The frontend defensively checks
  both spellings so nothing breaks, but the real data is silently dropped
  until this is fixed server-side.
- **Small dataset:** the guessing game currently converges in 2–3 questions
  for most entities — needs a larger entity set to feel like a real "guessing
  game" rather than an instant answer.
- **Attributes are mostly crisp (0/1), not fractional:** the whole premise of
  the project is preserving regional disagreement, which the schema already
  supports (attributes can be any value from 0–1, not just yes/no) — but most
  entities haven't been populated with that nuance yet. This is genuine
  research work, not a quick fix.
- **Map is state-level only** — no village/site-level pins yet for
  hyper-local traditions and folk deities.
- **No standalone "browse the map without playing" mode yet** — the map is
  currently only reachable after a completed guess.

---

