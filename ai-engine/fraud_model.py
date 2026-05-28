"""
Vyom Fraud Scoring Engine — Phase 2

Weighted signals, live escalation timeline, human reasoning, transparent confidence.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Tuple

from confidence_engine import WeightedSignal, build_escalation_timeline, compute_weighted_confidence

HIGH_RISK_LOCATIONS = {
    "nigeria", "ghana", "foreign", "international", "overseas", "abroad",
}
RISKY_DEVICE_PATTERNS = [
    ("vpn", "VPN or proxy connection identified", 18),
    ("proxy", "VPN or proxy connection identified", 18),
    ("tor", "Anonymous network routing detected", 20),
    ("new device", "New device detected", 22),
    ("unknown", "New or unrecognized device detected", 22),
    ("unrecognized", "New or unrecognized device detected", 22),
    ("emulator", "Emulated or virtual device detected", 24),
    ("rooted", "Modified or rooted device detected", 20),
]
HIGH_RISK_MERCHANTS = {
    "cryptocurrency", "crypto", "gambling", "wire transfer",
    "money transfer", "gift card", "prepaid",
}


@dataclass
class FraudContext:
    amount: float
    location: str
    device: str
    merchant_category: str


@dataclass
class SignalCheck:
    signal_id: str
    label: str
    weight: float
    triggered: bool


class FraudScorer:
    BASE_RISK = 24

    def score(
        self,
        amount: float,
        location: str,
        device: str,
        merchant_category: str = "unknown",
    ) -> Dict:
        ctx = FraudContext(
            amount=float(amount),
            location=(location or "").strip(),
            device=(device or "").strip(),
            merchant_category=(merchant_category or "unknown").strip(),
        )

        checks = self._build_signal_checks(ctx)
        triggered_steps = [
            {"label": c.label, "weight": c.weight}
            for c in checks
            if c.triggered
        ]

        timeline, final_from_timeline = build_escalation_timeline(
            self.BASE_RISK,
            "Transaction submitted for risk review",
            triggered_steps,
        )

        weighted = [
            WeightedSignal(
                signal_id=c.signal_id,
                label=c.label,
                weight=c.weight,
                triggered=c.triggered,
                contribution=c.weight if c.triggered else 0,
            )
            for c in checks
        ]

        conf = compute_weighted_confidence(weighted)
        component_score = self._component_aggregate(ctx, checks)
        final_score = int(round(min(100, (final_from_timeline * 0.6 + component_score * 0.4))))

        if len(triggered_steps) >= 3:
            final_score = min(100, final_score + 5)

        # Reconcile timeline final step
        if timeline:
            timeline[-1]["riskAfter"] = final_score

        human_signals = [s["label"] for s in triggered_steps]
        reasoning = self._build_reasoning(ctx, checks, final_score, conf, human_signals)

        return {
            "risk_score": final_score,
            "risk_level": self._risk_level(final_score),
            "confidence": conf["confidence"],
            "confidence_percent": conf["confidence_percent"],
            "confidence_explanation": conf["explanation"],
            "signals": human_signals,
            "weighted_signals": [
                {
                    "id": w.signal_id,
                    "label": w.label,
                    "weight": w.weight,
                    "triggered": w.triggered,
                    "contribution": w.contribution,
                }
                for w in weighted
            ],
            "escalation_timeline": timeline,
            "breakdown": {
                c.signal_id: c.weight if c.triggered else 0
                for c in checks
            },
            "reasoning": reasoning,
            "human_summary": reasoning["summary"],
            "recommendation": reasoning["recommendation"],
            "analyzed_at": datetime.utcnow().isoformat() + "Z",
        }

    def _build_signal_checks(self, ctx: FraudContext) -> List:
        loc = ctx.location.lower()
        dev = ctx.device.lower()
        merch = ctx.merchant_category.lower()

        amount_weight = 0
        if ctx.amount > 50_000:
            amount_weight = 28
        elif ctx.amount > 10_000:
            amount_weight = 20
        elif ctx.amount > 5_000:
            amount_weight = 14
        elif ctx.amount > 2_000:
            amount_weight = 10

        loc_weight = 0
        loc_label = ""
        if any(r in loc for r in HIGH_RISK_LOCATIONS):
            loc_weight, loc_label = 20, "Location mismatch with your usual spending region"
        elif len(loc) < 3 or loc in ("n/a", "none", "-"):
            loc_weight, loc_label = 15, "Transaction location could not be verified"

        device_weight = 0
        device_label = ""
        for pattern, label, weight in RISKY_DEVICE_PATTERNS:
            if pattern in dev:
                device_weight = max(device_weight, weight)
                device_label = label

        merch_weight = 0
        merch_label = ""
        if any(m in merch for m in HIGH_RISK_MERCHANTS):
            merch_weight, merch_label = 12, "Unusual merchant category for everyday spending"
        elif merch in ("unknown", "", "other"):
            merch_weight, merch_label = 8, "Merchant type was not recognized"

        hour = datetime.now().hour
        time_weight = 8 if 1 <= hour <= 5 else 0
        time_label = "Transaction at an unusual time of day" if time_weight else ""

        return [
            SignalCheck("amount_spike", "Unusual payment spike compared to typical activity", amount_weight, amount_weight > 0),
            SignalCheck("location_mismatch", loc_label or "Location mismatch", loc_weight, loc_weight > 0),
            SignalCheck("new_device", device_label or "Device risk", device_weight, device_weight > 0),
            SignalCheck("unusual_merchant", merch_label or "Merchant risk", merch_weight, merch_weight > 0),
            SignalCheck("suspicious_timing", time_label or "Timing risk", time_weight, time_weight > 0),
        ]

    def _component_aggregate(self, ctx: FraudContext, checks: List) -> float:
        base = float(self.BASE_RISK)
        for c in checks:
            if c.triggered:
                base = min(100, base + c.weight * 0.85)
        return base

    def _build_reasoning(
        self,
        ctx: FraudContext,
        checks: List,
        final_score: int,
        conf: Dict,
        signals: List[str],
    ) -> Dict:
        triggered = [c for c in checks if c.triggered]

        if final_score >= 75:
            summary = (
                "This transaction differs significantly from normal spending behavior. "
                "Multiple risk patterns appeared together."
            )
            recommendation = "Delay transaction verification until you confirm this was you."
        elif final_score >= 50:
            summary = (
                "Several details about this transaction look unfamiliar compared with typical activity."
            )
            recommendation = "Review this transaction before approving it."
        elif final_score >= 30:
            summary = "A few minor unusual patterns were noted, but nothing critical on its own."
            recommendation = "No immediate action needed—worth a quick glance if you do not recognize it."
        else:
            summary = "This transaction aligns with routine spending patterns we analyzed."
            recommendation = "No immediate action needed."

        why_parts = []
        if any(c.signal_id == "amount_spike" and c.triggered for c in triggered):
            why_parts.append(
                f"the amount (${ctx.amount:,.2f}) is higher than typical everyday purchases"
            )
        if any(c.signal_id == "location_mismatch" and c.triggered for c in triggered):
            why_parts.append(f"the location ({ctx.location}) does not match familiar regions")
        if any(c.signal_id == "new_device" and c.triggered for c in triggered):
            why_parts.append("the device or network fingerprint looks unfamiliar")
        if any(c.signal_id == "unusual_merchant" and c.triggered for c in triggered):
            why_parts.append(f"the merchant category ({ctx.merchant_category}) is uncommon for you")

        why_increased = (
            "Risk increased because " + ", and ".join(why_parts) + "."
            if why_parts
            else "Risk stayed low because no strong fraud patterns were detected together."
        )

        behavior_change = (
            "Compared with routine activity, this attempt combines "
            + f"{len(triggered)} independent anomaly signal(s)."
            if triggered
            else "Spending location, device, and amount appear consistent with low-risk activity."
        )

        return {
            "summary": summary,
            "why_increased": why_increased,
            "behavior_change": behavior_change,
            "confidence_explanation": conf["explanation"],
            "recommendation": recommendation,
            "top_signals": signals[:5],
        }

    @staticmethod
    def _risk_level(score: int) -> str:
        if score >= 75:
            return "critical"
        if score >= 50:
            return "high"
        if score >= 25:
            return "medium"
        return "low"
