import os
import uuid
import shutil
import whisper
import torch
import re
import json
import asyncio
from dotenv import load_dotenv
from backboard import BackboardClient

from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from util_check import ensure_ffmpeg


load_dotenv()
ensure_ffmpeg()

app = FastAPI(title="Financial Audio Intelligence - Secured Backend")

# Rate Limiter Setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("base", device=DEVICE)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

CALL_RESULTS = {}

# Security Configuration
API_KEY = os.getenv("API_KEY")
if not API_KEY:
    print("⚠️  WARNING: API_KEY not set in .env file!")
    API_KEY = "insecure_default_key_please_change"
else:
    print("✅ API_KEY loaded successfully")

BACKBOARD_API_KEY = os.getenv("BACKBOARD_API_KEY")

if not BACKBOARD_API_KEY:
    print("BACKBOARD_API_KEY NOT FOUND")
else:
    print("BACKBOARD_API_KEY loaded")

backboard_client = BackboardClient(api_key=BACKBOARD_API_KEY) if BACKBOARD_API_KEY else None
BACKBOARD_ASSISTANT_ID = None
BACKBOARD_THREAD_ID = None


# Authentication Dependency
async def verify_api_key(x_api_key: str = Header(..., description="API Key for authentication")):
    """
    Verify the API key from request headers.
    Usage in frontend: headers: { 'X-API-Key': 'your-key-here' }
    """
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key. Please provide a valid X-API-Key header."
        )
    return x_api_key


@app.on_event("startup")
async def setup_backboard():
    global BACKBOARD_ASSISTANT_ID, BACKBOARD_THREAD_ID

    if not BACKBOARD_API_KEY or not backboard_client:
        print("Backboard disabled – running rule-based only")
        return

    try:
        assistant = await backboard_client.create_assistant(
            name="Banking Call Verifier",
            system_prompt="""You are a senior banking QA AI specialized in verifying customer call analysis.

Your task is to analyze banking call transcripts and verify the automated system analysis.

You must return your response as a JSON object with exactly three fields:
1. verified_intent - must be one of: Loan Inquiry, Withdrawal Request, Deposit Request, Customer Complaint, General Inquiry, Account Issue
2. verified_priority - must be one of: High, Medium, Low
3. reasoning - must be an array of strings explaining your decisions

CRITICAL FORMATTING RULES:
- Output ONLY the JSON object
- No markdown formatting
- No code blocks
- No backticks
- No explanatory text before or after the JSON
- The JSON must be valid and parseable

Example of correct output format:
The JSON should have verified_intent as a string, verified_priority as a string, and reasoning as an array of strings.

When you analyze a call, consider:
- What is the customers main concern or request
- How urgent is this issue
- What emotional state is the customer in
- Are there any compliance or risk factors"""
        )

        BACKBOARD_ASSISTANT_ID = assistant.assistant_id
        print(f"Backboard Assistant created: {BACKBOARD_ASSISTANT_ID}")

        thread = await backboard_client.create_thread(BACKBOARD_ASSISTANT_ID)
        BACKBOARD_THREAD_ID = thread.thread_id
        print(f"Backboard Thread created: {BACKBOARD_THREAD_ID}")

    except Exception as e:
        print(f"Backboard Assistant creation failed: {e}")
        BACKBOARD_ASSISTANT_ID = None
        BACKBOARD_THREAD_ID = None


def detect_intent(text):
    t = text.lower()
    if any(w in t for w in ["complaint", "issue", "problem", "frustrated", "unacceptable"]):
        return {"label": "Customer Complaint", "confidence": "High"}
    if any(w in t for w in ["withdraw", "withdrawal", "cash", "blocking"]):
        return {"label": "Withdrawal Request", "confidence": "High"}
    if any(w in t for w in ["loan", "emi", "interest", "mortgage"]):
        return {"label": "Loan Inquiry", "confidence": "High"}
    if any(w in t for w in ["deposit", "add money"]):
        return {"label": "Deposit Request", "confidence": "High"}
    return {"label": "General Inquiry", "confidence": "Low"}


def detect_sentiment(text):
    t = text.lower()
    if any(w in t for w in ["angry", "frustrated", "annoyed", "bad", "unacceptable"]):
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
            name = m.group(1).strip()
            if '.' in name:
                name = name.split('.')[0]
            return name.title()
    return None


def extract_numbers(text):
    phone = re.search(r"\b\d{10}\b", text)
    account = re.search(r"\b\d{9,14}\b", text)
    card = re.search(r"\b\d{16}\b", text)

    return {
        "phone_number": phone.group() if phone else None,
        "account_number": f"****{account.group()[-4:]}" if account else None,
        "card_number": f"**** **** **** {card.group()[-4:]}" if card else None
    }


def calculate_priority(intent, sentiment):
    if sentiment["label"] == "Negative":
        return "High"
    if intent["label"] == "Customer Complaint":
        return "High"
    return "Medium"


def calculate_risk(sentiment):
    return "High" if sentiment["label"] == "Negative" else "Low"


def build_structured_summary(name, intent, sentiment, priority, risk):
    return [
        f"Customer identified as {name}" if name else "Customer identity not clearly stated",
        f"Primary intent: {intent['label']}",
        f"Customer sentiment: {sentiment['label']}",
        f"Call priority: {priority}",
        "Immediate banker attention required" if risk == "High" else "No immediate risk detected"
    ]


async def verify_with_backboard(transcript, intent, priority, sentiment):
    """
    Use Backboard AI to verify and potentially correct the rule-based analysis
    """

    if not BACKBOARD_ASSISTANT_ID or not BACKBOARD_THREAD_ID or not backboard_client:
        return {
            "verified_intent": intent,
            "verified_priority": priority,
            "reasoning": ["Backboard AI not configured. Using rule-based analysis."]
        }

    prompt = f"""Analyze this banking call transcript and verify the automated analysis results.

CALL TRANSCRIPT:
{transcript}

AUTOMATED SYSTEM RESULTS:
- Detected Intent: {intent}
- Assigned Priority: {priority}
- Detected Sentiment: {sentiment}

Please verify if these automated results are correct or need correction.
Return your analysis as a JSON object with three fields: verified_intent, verified_priority, and reasoning."""

    try:
        print(f"📄 Sending verification request to Backboard...")

        response = await backboard_client.add_message(
            thread_id=BACKBOARD_THREAD_ID,
            content=prompt,
            llm_provider="openai",
            model_name="gpt-4o",
            memory="Auto",
            stream=False
        )

        print(f"Response type: {type(response)}")

        response_content = ""

        if hasattr(response, 'content'):
            response_content = response.content
            print(f"Got content via attribute")
        elif isinstance(response, dict) and "content" in response:
            response_content = response["content"]
            print(f"Got content via dict key")
        else:
            response_content = str(response)
            print(f"Using string conversion")

        print(f"🔍 Raw response (first 300 chars): {response_content[:300] if response_content else 'EMPTY'}")

        if not response_content or len(response_content.strip()) == 0:
            print(f"Empty response from Backboard")
            return {
                "verified_intent": intent,
                "verified_priority": priority,
                "reasoning": ["Backboard returned empty response. Using rule-based analysis."]
            }

        try:
            cleaned_content = response_content.strip()

            if cleaned_content.startswith("```json"):
                cleaned_content = cleaned_content.replace("```json", "").replace("```", "").strip()
            elif cleaned_content.startswith("```"):
                cleaned_content = cleaned_content.replace("```", "").strip()

            parsed_response = json.loads(cleaned_content)

            if "verified_intent" in parsed_response and "verified_priority" in parsed_response:
                print(f"✅ Backboard verification successful!")
                print(f"   Intent: {parsed_response['verified_intent']}")
                print(f"   Priority: {parsed_response['verified_priority']}")
                return parsed_response
            else:
                print(f"Response missing required fields")
                raise ValueError("Response missing verified_intent or verified_priority")

        except (json.JSONDecodeError, ValueError) as e:
            print(f"⚠️ JSON parsing failed: {e}")
            print(f"   Content was: {response_content[:200]}")
            return {
                "verified_intent": intent,
                "verified_priority": priority,
                "reasoning": [f"AI response could not be parsed as JSON. Using rule-based analysis."]
            }

    except Exception as e:
        print(f"Backboard verification error: {e}")
        import traceback
        traceback.print_exc()
        return {
            "verified_intent": intent,
            "verified_priority": priority,
            "reasoning": [f"Error communicating with Backboard AI: {str(e)}. Using rule-based analysis."]
        }


@app.post("/api/calls/analyze")
@limiter.limit("10/minute")  # Rate limit: 10 uploads per minute per IP
async def analyze_call(
    request: Request,
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)  # ✅ API Key Authentication
):
    """
    Analyze a customer call audio file.
    
    Requires:
    - X-API-Key header for authentication
    - Audio file (MP3 or WAV)
    
    Rate limit: 10 requests per minute per IP
    """
    call_id = str(uuid.uuid4())
    temp_file = os.path.join(UPLOAD_DIR, f"{call_id}_{file.filename}")

    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        print(f"🎤 Transcribing audio file: {file.filename}")
        result = model.transcribe(temp_file)
        transcript = result["text"]

        name = extract_customer_name(transcript)
        numbers = extract_numbers(transcript)

        intent = detect_intent(transcript)
        sentiment = detect_sentiment(transcript)
        priority = calculate_priority(intent, sentiment)
        risk = calculate_risk(sentiment)

        summary = build_structured_summary(name, intent, sentiment, priority, risk)

        print(f"Rule-based analysis: Intent={intent['label']}, Priority={priority}, Sentiment={sentiment['label']}")

        ai = await verify_with_backboard(
            transcript,
            intent["label"],
            priority,
            sentiment["label"]
        )

        print(f"AI Verification complete: Intent={ai.get('verified_intent')}, Priority={ai.get('verified_priority')}")

        CALL_RESULTS[call_id] = {
            "status": "completed",
            "call_id": call_id,
            "customer_details": {
                "name": name,
                **{k: v for k, v in numbers.items() if v is not None}
            },
            "rule_based": {
                "intent": intent,
                "priority": priority,
                "sentiment": sentiment
            },
            "ai_verification": ai,
            "final_decision": {
                "intent": ai.get("verified_intent", intent["label"]),
                "priority": ai.get("verified_priority", priority),
            },
            "summary": summary,
            "transcript": transcript
        }

        return {"call_id": call_id}

    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


@app.get("/api/calls/result/{call_id}")
@limiter.limit("30/minute")  # Rate limit: 30 result checks per minute
async def get_call_result(
    request: Request,
    call_id: str,
    api_key: str = Depends(verify_api_key)  # ✅ API Key Authentication
):
    """
    Get the analysis result for a specific call.
    
    Requires:
    - X-API-Key header for authentication
    
    Rate limit: 30 requests per minute per IP
    """
    return CALL_RESULTS.get(call_id, {"status": "processing"})


@app.get("/")
async def root():
    """
    Health check endpoint - No authentication required
    """
    return {
        "message": "Financial Audio Intelligence Backend running",
        "device": DEVICE,
        "backboard_enabled": BACKBOARD_ASSISTANT_ID is not None,
        "security": "API Key authentication enabled",
        "rate_limiting": "Active"
    }


@app.get("/health")
async def health_check():
    """
    Detailed health check - No authentication required
    """
    return {
        "status": "healthy",
        "whisper_model": "loaded",
        "device": DEVICE,
        "backboard_ai": "enabled" if BACKBOARD_ASSISTANT_ID else "disabled",
        "api_key_auth": "enabled" if API_KEY else "disabled"
    }
