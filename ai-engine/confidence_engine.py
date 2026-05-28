"""
Weighted confidence from signal contributions — transparent, not arbitrary.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import List, Dict


@dataclass
class WeightedSignal:
    signal_id: str
    label: str
    weight: float
    triggered: bool
    contribution: float = 0.0


def compute_weighted_confidence(signals: List[WeightedSignal]) -> Dict:
    """
    Confidence rises when multiple independent signals fire with meaningful weights.
    Returns score (0–1) and a human-readable explanation.
    """
    triggered = [s for s in signals if s.triggered]
    if not triggered:
        return {
            "confidence": 0.52,
            "confidence_percent": 52,
            "explanation": "Limited unusual patterns were found, so confidence stays moderate.",
        }

    total_weight = sum(s.weight for s in triggered)
    max_possible = sum(s.weight for s in signals) or 1.0
    coverage = total_weight / max_possible

    # Independent signal count boosts certainty
    count_factor = min(len(triggered) / 4.0, 1.0)
    raw = 0.45 + 0.55 * coverage * (0.6 + 0.4 * count_factor)
    confidence = round(min(0.97, max(0.55, raw)), 3)

    top = sorted(triggered, key=lambda s: s.weight, reverse=True)[:3]
    labels = ", ".join(s.label.lower() for s in top)

    if confidence >= 0.85:
        explanation = (
            f"We are highly confident in this assessment because several strong patterns "
            f"aligned ({labels})."
        )
    elif confidence >= 0.7:
        explanation = (
            f"Confidence is solid based on {len(triggered)} contributing factor(s), "
            f"especially {labels}."
        )
    else:
        explanation = (
            f"Some caution applies: only partial pattern overlap was detected ({labels})."
        )

    return {
        "confidence": confidence,
        "confidence_percent": int(round(confidence * 100)),
        "explanation": explanation,
    }


def build_escalation_timeline(
    base_risk: float,
    base_event: str,
    steps: List[Dict],
) -> List[Dict]:
    """
    steps: [{ "label": str, "weight": float }, ...] only triggered steps should be passed
    """
    from datetime import datetime, timedelta

    timeline = []
    running = base_risk
    t0 = datetime.now()

    timeline.append({
        "time": t0.strftime("%I:%M %p").lstrip("0"),
        "event": base_event,
        "riskAfter": int(round(running)),
    })

    for i, step in enumerate(steps, start=1):
        running = min(100.0, running + step["weight"])
        ts = t0 + timedelta(seconds=i)
        timeline.append({
            "time": ts.strftime("%I:%M %p").lstrip("0"),
            "event": step["label"],
            "riskAfter": int(round(running)),
        })

    return timeline, int(round(running))
