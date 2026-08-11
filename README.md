# VenuePulse AI 🏟️
### *Real-Time Crowd Intelligence & Rerouting Console*

> **"Predict bottlenecks. Reroute safely. Keep venues moving."**

VenuePulse AI is an operator-facing crowd operations intelligence platform that models venues as live digital twins, predicts dangerous bottlenecks before they occur, and surfaces operator-approved rerouting strategies in real-time.

---

## What it does

| Feature | Description |
|---|---|
| **Digital Twin Graph** | Venue mapped as directed graph of zones (nodes) + corridors (edges) with live density/flow calculations |
| **Predictive Bottleneck Engine** | 30-minute lookahead model calculates breach time based on inflow/outflow imbalance |
| **NLP Incident Classification** | Ground staff text reports classified via Hugging Face `facebook/bart-large-mnli` (zero-shot), with deterministic offline fallback |
| **Strategy Comparison Engine** | Generates multiple rerouting strategies with projected risk scores and load relief metrics |
| **Operator-in-the-Loop** | All interventions require human approval — the AI proposes, the operator decides |
| **Judge Demo Mode** | 8-step auto-pilot briefing script for judges/stakeholders with voiceover scripts |
| **Data Readiness View** | CSV dataset inspector for all 7 core schema files used in the twin |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Vanilla CSS (custom design system — dark glassmorphism) |
| Backend | Node.js + Express (REST API) |
| NLP | Hugging Face Inference API (`facebook/bart-large-mnli`) |
| Canvas | HTML5 Canvas (venue map, flow particles, heatmap) |
| State | React `useState` + `useRef` |

---

## Project Structure

```
crowd-flow-optimizer/
├── server/
│   └── index.ts          # Express backend — /api/simulate, /api/classify, /api/scenarios
├── src/
│   ├── components/       # UI components (TelemetryPanel, StrategyCards, VenueMapCanvas, etc.)
│   ├── data/             # Venue presets (zones, corridors, strategies, CSVs)
│   ├── services/         # simulationEngine.ts, huggingfaceService.ts
│   ├── types/            # crowdflow.ts — all TypeScript interfaces
│   └── views/            # Page-level views (LandingPage, ControlRoomView, JudgeDemoOverlay, etc.)
├── .env.example          # Environment variable template
├── vite.config.ts        # Vite config with /api proxy to backend
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
HF_TOKEN=hf_your_hugging_face_token_here
```

> The `HF_TOKEN` is optional — the app runs fully offline with deterministic fallback classification if no token is provided.

### 3. Start development server

```bash
npm run dev
```

This starts both the **Express backend** (port 3001) and the **Vite frontend** (port 5173) concurrently.

Open → [http://localhost:5173](http://localhost:5173)

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start both backend + frontend (concurrent) |
| `npm run dev:ui` | Frontend only (Vite) |
| `npm run dev:server` | Backend only (tsx) |
| `npm run build` | Production build (TypeScript check + Vite bundle) |
| `npm run preview` | Preview production build locally |

---

## API Endpoints

All requests are proxied from frontend port 5173 → backend port 3001.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/scenarios` | Returns all venue preset configurations |
| `POST` | `/api/simulate` | Runs deterministic crowd simulation step |
| `POST` | `/api/classify` | NLP classification of incident report text |
| `POST` | `/api/activate-route` | Validates and confirms a rerouting strategy |

---

## Venue Presets

| Venue | Type | Capacity |
|---|---|---|
| IPL Cricket Stadium | Sports | 42,000 |
| T20 World Cup Stadium | Sports | 68,000 |
| Mumbai Railway Station | Transit | 120,000/day |
| Kumbh Mela Ghat | Mass gathering | 500,000 |

---

## Safety Notice

> VenuePulse AI is a **decision-support platform** for trained venue operations personnel. All sensor readings, crowd counts, and risk scores shown are derived from simulated demo data. This system does not replace professional crowd safety assessment or the authority of qualified safety officers.

---

## License

MIT
