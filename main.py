import os
import whisper
import torch
from logic.nlp_intelligence import analyze_text_intelligence
from fastapi import FastAPI, UploadFile, File, HTTPException
import shutil

app = FastAPI(title="Financial Audio Intelligence - Local MVP")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"- Loading Whisper Model on {DEVICE} --")
model = whisper.load_model("base", device=DEVICE)

@app.post("/analyze")
async def process_audio(file: UploadFile = File(...)):
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = model.transcribe(temp_file,task="translate")
        transcript_text = result["text"]

        print(f"\n--- NEW TRANSCRIPT ---\n{transcript_text}\n")

       
        with open("transcriptions_log.txt", "a") as f:
            f.write(f"File: {file.filename}\nText: {transcript_text}\n{'-'*30}\n")
        intelligence = analyze_text_intelligence(transcript_text)
        return {
           "transcript": transcript_text,
            "language": result.get("language"),
            "device_used": DEVICE,
            "emotion": intelligence["emotion"],
            "intent": intelligence["intent"],
            "risk_level": intelligence["risk_level"],
            "user_need": intelligence["user_need"],
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local Error: {str(e)}")
    finally:
       
        if os.path.exists(temp_file):
            os.remove(temp_file)

@app.get("/docs")

def root():
    return {"message": "Local Audio Intelligence System is Online"}