import os
import sys
import uvicorn

# Configure UTF-8 encoding for Windows console compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    print("=" * 60)
    print("Starting Financial Audio Intelligence Backend Server")
    print("Backend URL: http://127.0.0.1:8000")
    print("Health Check: http://127.0.0.1:8000/health")
    print("=" * 60)
    
    uvicorn.run(
        "main:app", 
        host="127.0.0.1", 
        port=8000, 
        reload=False,
        app_dir=current_dir
    )