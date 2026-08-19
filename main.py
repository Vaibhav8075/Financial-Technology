import os
import sys
import uuid
import shutil
import re
import json
import asyncio
from contextlib import asynccontextmanager

# Configure UTF-8 encoding for Windows console compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import torch
import whisper
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

try:
    from util_check import ensure_ffmpeg
    ensure_ffmpeg()
except Exception as e:
    print(f"[WARN] ensure_ffmpeg check skipped or failed: {e}")

# Load environment variables
load_dotenv()
load_dotenv(".env")

# Backboard SDK Import with Safe Fallback
try:
    from backboard import BackboardClient
    BACKBOARD_SDK_AVAILABLE = True
except ImportError:
    BACKBOARD_SDK_AVAILABLE = False
    print("[WARN] backboard-sdk not installed. Running in rule-based mode.")

    class BackboardClient:
        def __init__(self, api_key=None):
            self.api_key = api_key
        async def create_assistant(self, **kwargs):
            class Asst:
                assistant_id = "mock_asst_123"
            return Asst()
        async def create_thread(self, asst_id):
            class Thr:
                thread_id = "mock_thread_456"
            return Thr()
        async def add_message(self, **kwargs):
            return {
                "content": json.dumps({
                    "verified_intent": "General Inquiry",
                    "verified_priority": "Low",
                    "reasoning": ["Running in local rule-based fallback mode."]
                })
            }

# Security Configuration
API_KEY = os.getenv("API_KEY") or "banking_secret_key_2024_change_this_in_production"
BACKBOARD_API_KEY = os.getenv("BACKBOARD_API_KEY")

if os.getenv("API_KEY"):
    print("[INFO] API_KEY loaded successfully.")
else:
    print("[WARN] API_KEY not set in .env file! Using default development key.")

backboard_client = None
if BACKBOARD_API_KEY and BACKBOARD_SDK_AVAILABLE:
    try:
        backboard_client = BackboardClient(api_key=BACKBOARD_API_KEY)
        print("[INFO] Backboard client initialized with provided API key.")
    except Exception as e:
        print(f"[WARN] Could not initialize Backboard client: {e}")
        backboard_client = None

BACKBOARD_ASSISTANT_ID = None
BACKBOARD_THREAD_ID = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global BACKBOARD_ASSISTANT_ID, BACKBOARD_THREAD_ID

    if BACKBOARD_API_KEY and backboard_client:
        try:
            print("[INFO] Initializing Backboard Assistant...")
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
- The JSON must be valid and parseable"""
            )

            BACKBOARD_ASSISTANT_ID = getattr(assistant, "assistant_id", None)
            print(f"[INFO] Backboard Assistant created: {BACKBOARD_ASSISTANT_ID}")

            if BACKBOARD_ASSISTANT_ID:
                thread = await backboard_client.create_thread(BACKBOARD_ASSISTANT_ID)
                BACKBOARD_THREAD_ID = getattr(thread, "thread_id", None)
                print(f"[INFO] Backboard Thread created: {BACKBOARD_THREAD_ID}")
        except Exception as e:
            print(f"[WARN] Backboard Assistant initialization bypassed ({e}). System will run with rule-based analysis.")
            BACKBOARD_ASSISTANT_ID = None
            BACKBOARD_THREAD_ID = None
    else:
        print("[INFO] Backboard AI not configured – running rule-based analysis.")

    yield


app = FastAPI(
    title="Financial Audio Intelligence - Secured Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Rate Limiter Setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Universal CORS for frontend compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Whisper Model Initialization
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[INFO] Loading Whisper 'base' model on {DEVICE}...")
model = whisper.load_model("base", device=DEVICE)
print("[INFO] Whisper model ready.")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

CALL_RESULTS = {}


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


def detect_intent(text):
    t = text.lower()
    if any(w in t for w in ["complaint", "issue", "problem", "frustrated", "unacceptable", "terrible", "bad service", "dispute"]):
        return {"label": "Customer Complaint", "confidence": "High"}
    if any(w in t for w in ["withdraw", "withdrawal", "cash", "take out money"]):
        return {"label": "Withdrawal Request", "confidence": "High"}
    if any(w in t for w in ["loan", "emi", "interest", "mortgage", "borrow", "payoff"]):
        return {"label": "Loan Inquiry", "confidence": "High"}
    if any(w in t for w in ["deposit", "add money", "put money", "transfer"]):
        return {"label": "Deposit Request", "confidence": "High"}
    if any(w in t for w in ["account", "balance", "statement", "routing", "card", "block card"]):
        return {"label": "Account Issue", "confidence": "High"}
    return {"label": "General Inquiry", "confidence": "Low"}


def detect_sentiment(text):
    t = text.lower()
    if any(w in t for w in ["angry", "frustrated", "annoyed", "bad", "unacceptable", "horrible", "upset", "cheat"]):
        return {"label": "Negative", "score": -0.7}
    if any(w in t for w in ["happy", "satisfied", "thank you", "thanks", "great", "excellent", "appreciate"]):
        return {"label": "Positive", "score": 0.6}
    return {"label": "Neutral", "score": 0.0}


def extract_customer_name(text):
    patterns = [
        r"my name is ([a-zA-Z ]+)",
        r"this is ([a-zA-Z ]+)",
        r"i am ([a-zA-Z ]+)",
        r"calling, my name is ([a-zA-Z ]+)",
        r"speaking with ([a-zA-Z ]+)"
    ]
    for p in patterns:
        m = re.search(p, text.lower())
        if m:
            name = m.group(1).strip()
            if '.' in name:
                name = name.split('.')[0]
            if len(name) > 30:
                name = name[:30]
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
    Use Backboard AI to verify and potentially correct the rule-based analysis.
    If unavailable or invalid, returns clean rule-based confirmation.
    """
    if not BACKBOARD_ASSISTANT_ID or not BACKBOARD_THREAD_ID or not backboard_client:
        return {
            "verified_intent": intent,
            "verified_priority": priority,
            "reasoning": ["Rule-based analysis applied. Backboard AI verification is idle."]
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
        print("[INFO] Sending verification request to Backboard AI...")
        response = await backboard_client.add_message(
            thread_id=BACKBOARD_THREAD_ID,
            content=prompt,
            llm_provider="openai",
            model_name="gpt-4o",
            memory="Auto",
            stream=False
        )

        response_content = ""
        if hasattr(response, 'content'):
            response_content = response.content
        elif isinstance(response, dict) and "content" in response:
            response_content = response["content"]
        else:
            response_content = str(response)

        if not response_content or not response_content.strip():
            return {
                "verified_intent": intent,
                "verified_priority": priority,
                "reasoning": ["Backboard AI returned empty response. Used rule-based analysis."]
            }

        cleaned_content = response_content.strip()
        if cleaned_content.startswith("```json"):
            cleaned_content = cleaned_content.replace("```json", "").replace("```", "").strip()
        elif cleaned_content.startswith("```"):
            cleaned_content = cleaned_content.replace("```", "").strip()

        parsed_response = json.loads(cleaned_content)
        if "verified_intent" in parsed_response and "verified_priority" in parsed_response:
            print(f"[INFO] Backboard verification successful: {parsed_response['verified_intent']} / {parsed_response['verified_priority']}")
            return parsed_response
        else:
            raise ValueError("Response missing verified_intent or verified_priority")

    except Exception as e:
        print(f"[WARN] Backboard AI verification fallback: {e}")
        return {
            "verified_intent": intent,
            "verified_priority": priority,
            "reasoning": [f"AI verification bypassed ({str(e)}). Used rule-based analysis."]
        }


@app.post("/api/calls/analyze")
@limiter.limit("60/minute")
async def analyze_call(
    request: Request,
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)
):
    """
    Analyze a customer call audio file.
    Runs Whisper in a separate thread so as not to block the asyncio event loop.
    """
    call_id = str(uuid.uuid4())
    temp_file = os.path.join(UPLOAD_DIR, f"{call_id}_{file.filename}")

    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        print(f"[INFO] Transcribing audio file asynchronously: {file.filename}")
        result = await asyncio.to_thread(model.transcribe, temp_file)
        transcript = result.get("text", "").strip()

        name = extract_customer_name(transcript)
        numbers = extract_numbers(transcript)

        intent = detect_intent(transcript)
        sentiment = detect_sentiment(transcript)
        priority = calculate_priority(intent, sentiment)
        risk = calculate_risk(sentiment)

        summary = build_structured_summary(name, intent, sentiment, priority, risk)

        print(f"[INFO] Rule-based analysis: Intent={intent['label']}, Priority={priority}, Sentiment={sentiment['label']}")

        ai = await verify_with_backboard(
            transcript,
            intent["label"],
            priority,
            sentiment["label"]
        )

        final_intent = ai.get("verified_intent", intent["label"])
        final_priority = ai.get("verified_priority", priority)

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
                "intent": final_intent,
                "priority": final_priority,
            },
            "summary": summary,
            "transcript": transcript
        }

        print(f"[INFO] Analysis completed for call_id: {call_id}")
        return {"call_id": call_id}

    except Exception as e:
        print(f"[ERROR] Error processing audio {file.filename}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Audio analysis failed: {str(e)}")

    finally:
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except Exception:
                pass


@app.get("/api/calls/result/{call_id}")
@limiter.limit("120/minute")
async def get_call_result(
    request: Request,
    call_id: str,
    api_key: str = Depends(verify_api_key)
):
    """
    Get the analysis result for a specific call ID.
    """
    result = CALL_RESULTS.get(call_id)
    if not result:
        return {"status": "processing", "call_id": call_id}
    return result


@app.get("/")
async def root():
    """
    Health check endpoint - Public
    """
    return {
        "message": "Financial Audio Intelligence Backend is running",
        "device": DEVICE,
        "backboard_enabled": BACKBOARD_ASSISTANT_ID is not None,
        "security": "API Key authentication enabled",
        "rate_limiting": "Active",
        "status": "online"
    }


@app.get("/health")
async def health_check():
    """
    Detailed health check endpoint - Public
    """
    return {
        "status": "healthy",
        "whisper_model": "loaded",
        "device": DEVICE,
        "backboard_ai": "enabled" if BACKBOARD_ASSISTANT_ID else "fallback_mode",
        "api_key_auth": "enabled" if API_KEY else "disabled"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
