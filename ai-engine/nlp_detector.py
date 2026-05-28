"""
Vyom NLP Scam Detector — Phase 2

Human language, weighted escalation, transparent confidence, phrase highlights.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Tuple

from confidence_engine import WeightedSignal, build_escalation_timeline, compute_weighted_confidence


@dataclass
class SignalPattern:
    name: str
    pattern: re.Pattern
    weight: float
    category: str
    human_label: str
    phrase_pattern: re.Pattern | None = None


SIGNAL_PATTERNS: List[SignalPattern] = [
    SignalPattern(
        "urgency_language",
        re.compile(r"\b(urgent|immediately|right\s+now|act\s+now|expire[sd]?|limited\s+time)\b", re.I),
        18.0,
        "urgency_manipulation",
        "Urgency and payment pressure language detected",
        re.compile(r"\b(urgent|immediately|right\s+now|act\s+now)\b", re.I),
    ),
    SignalPattern(
        "payment_pressure",
        re.compile(r"\b(send\s+money|wire\s+transfer|pay\s+now|transfer\s+funds|gift\s+card)\b", re.I),
        20.0,
        "financial_fraud",
        "Payment or transfer pressure detected",
        re.compile(r"\b(send\s+money|wire\s+transfer|pay\s+now)\b", re.I),
    ),
    SignalPattern(
        "credential_request",
        re.compile(r"\b(otp|password|pin|cvv|security\s+code)\b", re.I),
        25.0,
        "identity_theft",
        "Request for sensitive credentials detected",
        re.compile(r"\b(otp|password|pin|cvv)\b", re.I),
    ),
    SignalPattern(
        "phishing_verify",
        re.compile(r"\b(verify\s+your\s+account|confirm\s+your\s+identity|click\s+here)\b", re.I),
        16.0,
        "phishing",
        "Suspicious verification or link language",
        re.compile(r"\b(verify\s+your\s+account|click\s+here)\b", re.I),
    ),
    SignalPattern(
        "prize_scam",
        re.compile(r"\b(lottery|won|winner|prize|congratulations|free\s+money)\b", re.I),
        18.0,
        "prize_scam",
        "Prize or lottery-style reward language",
        re.compile(r"\b(lottery|won|prize|congratulations)\b", re.I),
    ),
    SignalPattern(
        "account_threat",
        re.compile(
            r"\b(suspended|blocked|disabled)\b.{0,40}\b(account|card)\b",
            re.I,
        ),
        20.0,
        "urgency_manipulation",
        "Account suspension or lockout threat",
        re.compile(r"\b(suspended|blocked|disabled)\b", re.I),
    ),
    SignalPattern(
        "impersonation",
        re.compile(r"\b(irs|hmrc|your\s+bank|government|tax\s+refund)\b", re.I),
        15.0,
        "impersonation",
        "Institution impersonation cues detected",
        re.compile(r"\b(irs|hmrc|your\s+bank)\b", re.I),
    ),
    SignalPattern(
        "suspicious_domain",
        re.compile(r"https?://\S+\.(xyz|top|tk|ml|ga|cf|gq)\b", re.I),
        22.0,
        "phishing",
        "Suspicious link domain detected",
        None,
    ),
]


class ScamDetector:
    BASE_RISK = 12

    def analyze(self, content: str) -> Dict:
        matched: List[Tuple[SignalPattern, re.Match]] = []
        categories = set()

        for sig in SIGNAL_PATTERNS:
            m = sig.pattern.search(content)
            if m:
                matched.append((sig, m))
                categories.add(sig.category)

        style_weight, style_label = self._style_check(content)
        steps = [{"label": s.human_label, "weight": s.weight} for s, _ in matched]
        if style_weight > 0 and style_label:
            steps.append({"label": style_label, "weight": style_weight})

        timeline, timeline_score = build_escalation_timeline(
            self.BASE_RISK,
            "Message scanned for phishing patterns",
            steps,
        )

        pattern_sum = sum(s.weight for s, _ in matched) + style_weight
        final_score = int(round(min(100, max(timeline_score, pattern_sum * 0.85))))

        if len(categories) >= 3:
            final_score = min(100, final_score + 4)
        if timeline:
            timeline[-1]["riskAfter"] = final_score

        weighted = [
            WeightedSignal(sig.name, sig.human_label, sig.weight, True)
            for sig, _ in matched
        ]
        if style_weight > 0:
            weighted.append(
                WeightedSignal("style_pressure", style_label, style_weight, True)
            )
        for sig in SIGNAL_PATTERNS:
            if not any(s.name == sig.name for s, _ in matched):
                weighted.append(WeightedSignal(sig.name, sig.human_label, sig.weight, False))

        conf = compute_weighted_confidence(weighted)
        highlighted = self._extract_phrases(content, matched)
        human_signals = [s["label"] for s in steps]
        reasoning = self._build_reasoning(final_score, conf, human_signals, categories)

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
                }
                for w in weighted
                if w.triggered
            ],
            "escalation_timeline": timeline,
            "highlighted_phrases": highlighted,
            "categories": list(categories) if categories else ["safe"],
            "breakdown": {
                "pattern_score": round(sum(s.weight for s, _ in matched), 1),
                "style_score": round(style_weight, 1),
                "signals_matched": len(matched),
                "unique_categories": len(categories),
            },
            "reasoning": reasoning,
            "human_summary": reasoning["summary"],
            "recommendation": reasoning["recommendation"],
            "analyzed_at": datetime.utcnow().isoformat() + "Z",
        }

    def _style_check(self, text: str) -> Tuple[float, str]:
        if len(text) > 15:
            caps = sum(1 for c in text if c.isupper()) / len(text)
            if caps > 0.45:
                return 10.0, "Excessive capitalization suggesting pressure tactics"
        if text.count("!") >= 3:
            return 8.0, "Multiple exclamation marks used for urgency"
        return 0.0, ""

    def _extract_phrases(
        self, content: str, matched: List[Tuple[SignalPattern, re.Match]]
    ) -> List[str]:
        found = set()
        for sig, _ in matched:
            if sig.phrase_pattern:
                for m in sig.phrase_pattern.finditer(content):
                    found.add(m.group(0).strip())
        return list(found)[:8]

    def _build_reasoning(self, score: int, conf: Dict, signals: List[str], categories: set) -> Dict:
        if score >= 70:
            summary = (
                "Urgency and payment pressure language detected. "
                "This message closely resembles known phishing behavior."
            )
            recommendation = "Do not reply, click links, or share codes. Report and delete this message."
        elif score >= 45:
            summary = (
                "Several phrases match common scam tactics. "
                "Verify the sender through a trusted channel before acting."
            )
            recommendation = "Pause before responding. Contact the organization using their official website or app."
        elif score >= 20:
            summary = "Some wording feels pressuring or unusual for a legitimate message."
            recommendation = "Treat this message with light caution until you confirm who sent it."
        else:
            summary = "No strong scam patterns were found in the language of this message."
            recommendation = "No immediate action needed, but stay cautious with unknown senders."

        why = (
            "Risk rose as we matched patterns often seen in "
            + ", ".join(sorted(categories))
            + " attempts."
            if categories
            else "Risk remained low because familiar scam phrases were not detected."
        )

        behavior = (
            f"The message triggered {len(signals)} linguistic risk signal(s) in sequence."
            if signals
            else "Language tone and structure appear typical for legitimate mail."
        )

        return {
            "summary": summary,
            "why_increased": why,
            "behavior_change": behavior,
            "confidence_explanation": conf["explanation"],
            "recommendation": recommendation,
            "top_signals": signals[:5],
        }

    @staticmethod
    def _risk_level(score: int) -> str:
        if score >= 70:
            return "confirmed_scam"
        if score >= 45:
            return "likely_scam"
        if score >= 20:
            return "suspicious"
        return "safe"
