import os
import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    reload_flag = os.getenv("RELOAD", "false").lower() == "true"
    print(f"Starting UPSC Mentor AI backend on http://127.0.0.1:{port}", flush=True)
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=reload_flag)
