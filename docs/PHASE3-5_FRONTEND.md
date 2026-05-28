# Phases 3–5 — Frontend (Complete)

## Phase 3 — Stabilization
- Responsive `AppShell` + mobile sidebar
- Auth pages with proper form styles and loading states
- Dashboard uses real API data (`recentAnalyses`, `escalationLogs`, transactions)
- Transaction analyzer: live escalation timeline animation
- Message checker: highlighted phrases, human summaries, escalation panel
- Socket feed via `risk:escalation`, `fraud:alert`, `scam:alert`

## Phase 4 — Humanization
- Warm teal/stone design tokens in `index.css`
- Human microcopy across views (no “threat detected” / “neural matrices”)
- Calm empty states
- Subtle motion (`animate-step-in`, respects `prefers-reduced-motion`)
- Landing hero updated (no fake social proof)

## Phase 5 — Production polish
- 44px touch targets on primary controls
- Loading spinners and retry on dashboard errors
- Responsive tables and grid layouts
- Search/filter on dashboard transactions

## Run

```bash
cd server && npm run dev
cd ai-engine && python app.py
cd client && npm run dev
```

Set `VITE_API_URL` and `VITE_SOCKET_URL` if not using localhost defaults.
