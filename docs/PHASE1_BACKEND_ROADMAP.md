# Phase 1 — Backend Foundation (Implemented)

## API routes

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/auth` | POST register, login; GET me | JWT auth |
| `/api/fraud` | POST analyze, GET history | Transaction risk + escalation |
| `/api/scam` | POST analyze, GET history | Message risk + human summary |
| `/api/dashboard` | GET stats, risk-events, alerts | Real aggregated data |

## Fraud analyze response

```json
{
  "success": true,
  "data": {
    "riskScore": 91,
    "riskLevel": "critical",
    "signals": ["New device detected", "VPN or proxy connection identified"],
    "escalationTimeline": [
      { "time": "12:01 PM", "event": "Transaction submitted for risk review", "riskAfter": 24 },
      { "time": "12:01 PM", "event": "New device detected", "riskAfter": 46 }
    ],
    "recommendation": "Delay transaction verification until you confirm this was you."
  }
}
```

## MongoDB collections

- `users` — auth
- `transactions` — fraud analyses
- `scammessages` — scam analyses  
- `riskevents` — escalation audit trail
- `alerts` — user notifications

## Socket events

- `fraud:alert` / `scam:alert` — high-risk results
- `risk:escalation` — unified live feed payload with timeline

## Run locally

```bash
# Terminal 1 — API
cd server && cp .env.example .env   # set MONGODB_URI + JWT_SECRET
npm install && npm run dev

# Terminal 2 — AI engine (optional)
cd ai-engine && pip install -r requirements.txt && python app.py
```
