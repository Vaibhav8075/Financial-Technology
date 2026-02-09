import os
import uuid
import shutil
import whisper
import torch
import re

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from util_check import ensure_ffmpeg

ensure_ffmpeg()

app = FastAPI(title="Financial Audio Intelligence - Local MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("base", device=DEVICE)

CALL_RESULTS = {}
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def detect_intent(text):
    t = text.lower()
    if any(w in t for w in ["loan", "emi", "interest", "mortgage"]):
        return {"label": "Loan Inquiry", "confidence": "High"}
    if any(w in t for w in ["withdraw", "withdrawal", "cash"]):
        return {"label": "Withdrawal Request", "confidence": "High"}
    if any(w in t for w in ["deposit", "add money"]):
        return {"label": "Deposit Request", "confidence": "High"}
    if any(w in t for w in ["complaint", "issue", "problem"]):
        return {"label": "Customer Complaint", "confidence": "High"}
    return {"label": "General Inquiry", "confidence": "Low"}


def detect_sentiment(text):
    t = text.lower()
    if any(w in t for w in ["angry", "frustrated", "annoyed", "bad"]):
        return {"label": "Negative", "score": -0.7}
    if any(w in t for w in ["happy", "satisfied", "thank you"]):
        return {"label": "Positive", "score": 0.6}
    return {"label": "Neutral", "score": 0.0}


def extract_customer_name(text):
    patterns = [
        r"my name is ([a-zA-Z ]+)",
        r"this is ([a-zA-Z ]+)",
        r"i am ([a-zA-Z ]+)"
    ]
    for p in patterns:
        m = re.search(p, text.lower())
        if m:
            return m.group(1).title()
    return None


def extract_numbers(text):
    phone = re.search(r"\b\d{10}\b", text)
    card = re.search(r"\b\d{16}\b", text)
    account = re.search(r"\b\d{9,14}\b", text)

    return {
        "phone_number": phone.group() if phone else None,
        "card_number": f"**** **** **** {card.group()[-4:]}" if card else None,
        "account_number": f"****{account.group()[-4:]}" if account else None
    }


def extract_action_items(text):
    items = []
    t = text.lower()
    if "follow up" in t:
        items.append("Follow up with customer")
    if "call back" in t:
        items.append("Call customer back")
    if "email" in t:
        items.append("Send email to customer")
    return items


def calculate_priority(intent, sentiment):
    if sentiment["label"] == "Negative":
        return "High"
    if intent["label"] == "Customer Complaint":
        return "High"
    return "Medium"


def calculate_risk(sentiment):
    return "High" if sentiment["label"] == "Negative" else "Low"


def build_banker_steps(intent, sentiment, actions):
    steps = [{"step": 1, "action": "Verify customer identity"}]

    if intent["label"] == "Loan Inquiry":
        steps.append({"step": 2, "action": "Check loan eligibility and EMI details"})
    elif intent["label"] == "Withdrawal Request":
        steps.append({"step": 2, "action": "Verify account balance and withdrawal limits"})
    elif intent["label"] == "Deposit Request":
        steps.append({"step": 2, "action": "Verify deposit source and account details"})
    elif intent["label"] == "Customer Complaint":
        steps.append({"step": 2, "action": "Register complaint in CRM system"})

    if sentiment["label"] == "Negative":
        steps.append({"step": 3, "action": "Escalate call to senior support officer"})
    else:
        steps.append({"step": 3, "action": "Proceed with standard customer assistance"})

    for a in actions:
        steps.append({"step": len(steps) + 1, "action": a})

    return steps


def build_structured_summary(name, intent, sentiment, priority, risk):
    summary = []
    summary.append(f"Customer identified as {name}" if name else "Customer identity not clearly stated")
    summary.append(f"Primary intent is {intent['label']}")
    summary.append(f"Customer sentiment is {sentiment['label']}")
    summary.append(f"Call priority set to {priority}")
    summary.append("Immediate attention required due to high risk" if risk == "High" else "No immediate risk detected")
    return summary


@app.post("/api/calls/analyze")
async def analyze_call(file: UploadFile = File(...)):
    call_id = str(uuid.uuid4())
    temp_file = os.path.join(UPLOAD_DIR, f"{call_id}_{file.filename}")

    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = model.transcribe(temp_file)
        transcript = result["text"]

        name = extract_customer_name(transcript)
        numbers = extract_numbers(transcript)
        intent = detect_intent(transcript)
        sentiment = detect_sentiment(transcript)
        actions = extract_action_items(transcript)
        priority = calculate_priority(intent, sentiment)
        risk = calculate_risk(sentiment)

        summary = build_structured_summary(
            name,
            intent,
            sentiment,
            priority,
            risk
        )

        CALL_RESULTS[call_id] = {
            "status": "completed",
            "call_id": call_id,
            "customer_details": {
                "name": name,
                "phone_number": numbers["phone_number"],
                "account_number": numbers["account_number"],
                "card_number": numbers["card_number"]
            },
            "intent": intent,
            "sentiment": sentiment,
            "priority": priority,
            "risk_level": risk,
            "summary": summary,
            "banker_steps": build_banker_steps(intent, sentiment, actions),
            "transcript": transcript
        }

        return {"call_id": call_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


@app.get("/api/calls/result/{call_id}")
def get_call_result(call_id: str):
    if call_id not in CALL_RESULTS:
        return {"status": "processing"}
    return CALL_RESULTS[call_id]


@app.get("/")
def root():
    return {
        "message": "Financial Audio Intelligence Backend is running",
        "device": DEVICE
    }
