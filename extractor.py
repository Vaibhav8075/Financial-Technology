import os
import json
import whisper
import torch
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from openai import OpenAI


app = FastAPI(title="Financial Audio Intelligence - Local MVP")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"--- Loading Whisper Model on {DEVICE} ---")
model = whisper.load_model("base", device=DEVICE)


def extract_call_intelligence(transcript_text: str):

    prompt = f"""
You are a banking call analysis AI.

Extract structured information from the transcript.

Return ONLY valid JSON in this format:

{{
  "client_name": "",
  "intents": [
    {{"type":"", "amount":0}}
  ],
  "emotion": "",
  "complaints": [],
  "summary": ""
}}

Rules:
- Detect loan, withdraw, payoff, deposit or banking actions.
- Detect emotional tone (neutral, happy, frustrated, angry).
- Extract complaints if any.
- Write a short professional summary.

Transcript:
\"\"\"{transcript_text}\"\"\"
"""

    response = client.chat.completions.create(
        model="gpt-4-mini",  
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    content = response.choices[0].message.content

   
    return json.loads(content)



@app.post("/analyze")
async def process_audio(file: UploadFile = File(...)):

    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
    
        result = model.transcribe(temp_file)
        transcript_text = result["text"]

        print(f"\n--- NEW TRANSCRIPT ---\n{transcript_text}\n")

      
        ai_output = extract_call_intelligence(transcript_text)

      
        with open("transcriptions_log.txt", "a") as f:
            f.write(
                f"File: {file.filename}\n"
                f"Text: {transcript_text}\n"
                f"AI: {json.dumps(ai_output)}\n"
                f"{'-'*30}\n"
            )

        return {
            "transcript": transcript_text,
            "analysis": ai_output,
            "language": result.get("language"),
            "device_used": DEVICE,
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local Error: {str(e)}")

    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)


@app.get("/")
def root():
    return {"message": "Local Audio Intelligence System is Online"}