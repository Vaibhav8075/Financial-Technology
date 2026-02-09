import math

def validate_audio_file(filename: str, content_type: str, size: int):

    allowed_types = ["audio/mpeg", "audio/wav", "audio/x-m4a"]
    if content_type not in allowed_types:
        return False, "Invalid file type. Please upload MP3 or WAV."
    
 
    max_size = 25 * 1024 * 1024
    if size > max_size:
        return False, "File too large. Maximum size is 25MB."
        
    return True, None

def calculate_confidence(avg_logprob: float) -> float:

    return round(math.exp(avg_logprob) * 100, 2)