from transformers import pipeline

# Load once (important for performance)
emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base"
)

intent_model = pipeline("zero-shot-classification")

INTENT_LABELS = [
    "Billing issue",
    "Fraud report",
    "Loan inquiry",
    "Service complaint",
    "Account issue"
]
def is_financial_content(text: str):
    labels = [
        "Financial related",
        "Non-financial related"
    ]

    result = intent_model(text, labels)
    
    top_label = result["labels"][0]
    confidence = result["scores"][0]

    if top_label == "Financial related" and confidence > 0.6:
        return True, confidence
    else:
        return False, confidence


def analyze_text_intelligence(text: str):
    # 0. Check if financial domain
    is_finance, domain_conf = is_financial_content(text)

    if not is_finance:
        return {
            "is_financial": False,
            "domain_confidence": round(domain_conf, 2),
            "message": "The uploaded audio does not appear to be related to financial issues."
        }

    # 1. Emotion
    emotion_result = emotion_model(text)[0]
    emotion = emotion_result["label"]

    # 2. Intent
    intent_result = intent_model(text, INTENT_LABELS)
    intent = intent_result["labels"][0]

    # 3. Infer user need & risk
    if intent == "Fraud report":
        need = "Immediate account security and escalation"
        risk = "Critical"
    elif emotion in ["anger", "fear"]:
        need = "Immediate human support"
        risk = "High"
    else:
        need = "Standard support response"
        risk = "Medium"

    return {
        "is_financial": True,
        "emotion": emotion,
        "intent": intent,
        "risk_level": risk,
        "user_need": need
    }
