# logic/transcription_service.py
import math
from openai import OpenAI

client = OpenAI() # Assumes OPENAI_API_KEY is in .env

async def get_transcript_with_confidence(file_content, filename):
    response = client.audio.transcriptions.create(
        model="whisper-1",
        file=(filename, file_content),
        response_format="verbose_json"
    )
    

    conf = 0.0
    if response.segments:
        conf = sum(math.exp(s.avg_logprob) for s in response.segments) / len(response.segments)
    
    return {
        "text": response.text,
        "confidence": round(conf * 100, 2)
    }