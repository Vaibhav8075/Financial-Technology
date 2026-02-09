import os
import uuid
import shutil
import whisper
import torch

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from util_check import ensure_ffmpeg


# --------------------------------------------------
# Setup
# --------------------------------------------------

ensure_ffmpeg()  # Ensure ffmpeg is available

app = FastAPI(title="Financial Audio Intelligence - Local MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # OK for local dev
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Device & Model
# --------------------------------------------------

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"--- Loading Whisper model on {DEVICE} ---")

model = whisper.load_model("base", device=DEVICE)

# --------------------------------------------------
# In-memory result store
# --------------------------------------------------

CALL_RESULTS = {}

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --------------------------------------------------
# API: Analyze Call
# --------------------------------------------------

@app.post("/api/calls/analyze")
async def analyze_call(file: UploadFile = File(...)):
    call_id = str(uuid.uuid4())
    temp_file = os.path.join(UPLOAD_DIR, f"{call_id}_{file.filename}")

    # Save uploaded file
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        print(f"\n--- Processing Call ID: {call_id} ---")

        # Run Whisper transcription (THIS TAKES TIME)
        result = model.transcribe(temp_file)
        transcript_text = result["text"]

        print(f"\n--- TRANSCRIPT ---\n{transcript_text}\n")

        # Store result (frontend will poll for this)
        CALL_RESULTS[call_id] = {
            "status": "completed",
            "call_id": call_id,
            "transcript": transcript_text,
            "language": result.get("language"),
            "device_used": DEVICE,

            # Mocked intelligence (can be replaced later)
            "summary": transcript_text[:200] + "...",
            "intent": {
                "label": "Loan Inquiry",
                "confidence": "Medium"
            },
            "sentiment": {
                "label": "Neutral",
                "score": 0.0
            },
            "action_items": [
                {
                    "task": "Follow up with customer",
                    "confidence": "Medium"
                }
            ]
        }

        return {
            "call_id": call_id,
            "status": "processing_started"
        }

    except Exception as e:
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


# --------------------------------------------------
# API: Get Call Result (POLLING ENDPOINT)
# --------------------------------------------------

@app.get("/api/calls/result/{call_id}")
def get_call_result(call_id: str):
    if call_id not in CALL_RESULTS:
        return {
            "status": "processing"
        }

    return CALL_RESULTS[call_id]


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Financial Audio Intelligence Backend is running",
        "device": DEVICE
    }
