from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
import os
from dotenv import load_dotenv

from fraud_model import FraudScorer
from nlp_detector import ScamDetector

load_dotenv()

app = FastAPI(
    title="Vyom AI Engine",
    description="Phase 2: explainable fraud and scam intelligence with weighted confidence",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CLIENT_URL", "http://localhost:5173"),
        os.getenv("SERVER_URL", "http://localhost:5000"),
    ],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

fraud_scorer = FraudScorer()
scam_detector = ScamDetector()


class FraudRequest(BaseModel):
    amount: float = Field(..., ge=0, description="Transaction amount")
    location: str = Field(..., min_length=1)
    device: str = Field(..., min_length=1)
    merchant_category: str = Field(default="unknown")


class ScamRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


@app.get("/health")
def health():
    return {"status": "ok", "service": "vyom-ai-engine", "version": "2.0.0"}


@app.post("/predict/fraud")
def predict_fraud(req: FraudRequest):
    """
    Returns risk_score, escalation_timeline, reasoning (why_increased, behavior_change),
    confidence_explanation, and human_summary.
    """
    try:
        return fraud_scorer.score(
            amount=req.amount,
            location=req.location,
            device=req.device,
            merchant_category=req.merchant_category,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fraud model error: {str(e)}")


@app.post("/predict/scam")
def predict_scam(req: ScamRequest):
    """
    Returns risk_score, escalation_timeline, highlighted_phrases, reasoning, human_summary.
    """
    try:
        return scam_detector.analyze(content=req.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scam model error: {str(e)}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
