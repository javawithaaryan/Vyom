# Phase 2 — AI Engine Improvement

## Capabilities

| Chunk | Implementation |
|-------|----------------|
| 2.1 Better fraud reasoning | `reasoning.why_increased`, `behavior_change`, `top_signals` |
| 2.2 Human risk language | `human_summary` — no raw "fraud probability high" |
| 2.3 Escalation timeline | Real clock times via `build_escalation_timeline()` |
| 2.4 Confidence engine | `confidence_engine.py` — weighted signal coverage |

## Run

```bash
cd ai-engine
pip install -r requirements.txt
python app.py
# GET http://127.0.0.1:8000/health → version 2.0.0
```

## Example fraud response

```bash
curl -X POST http://127.0.0.1:8000/predict/fraud \
  -H "Content-Type: application/json" \
  -d '{"amount":12000,"location":"Moscow, RU","device":"new device / VPN","merchant_category":"crypto"}'
```

## Node merge

`server/src/services/aiMergeService.js` blends rule escalation (55%) + AI (45%) and returns unified `aiReasoning`, `confidenceExplanation`, merged `escalationTimeline`.
