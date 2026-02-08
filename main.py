import os
import whisper
import torch
from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil

app = FastAPI(title="Financial Audio Intelligence - Local MVP")

# Check for GPU (NVIDIA)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"--- Loading Whisper Model on {DEVICE} ---")
model = whisper.load_model("base", device=DEVICE)

@app.post("/analyze")
async def process_audio(file: UploadFile = File(...)):
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # 1. Run Transcription
        result = model.transcribe(temp_file)
        transcript_text = result["text"]

        # 2. VIEW in Terminal
        print(f"\n--- NEW TRANSCRIPT ---\n{transcript_text}\n")

        # 3. STORE in a permanent local file
        with open("transcriptions_log.txt", "a") as f:
            f.write(f"File: {file.filename}\nText: {transcript_text}\n{'-'*30}\n")
        
        return {
            "transcript": transcript_text,
            "language": result.get("language"),
            "device_used": DEVICE,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local Error: {str(e)}")
    finally:
        # Clean up audio file but keep the text log
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.get("/")
def root():
    return {"message": "Local Audio Intelligence System is Online"}