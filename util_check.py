import shutil

def ensure_ffmpeg():
    if not shutil.which("ffmpeg"):
        raise RuntimeError(
            "FFmpeg is not installed or not available in PATH. "
            "Install FFmpeg and restart the server."
        )
