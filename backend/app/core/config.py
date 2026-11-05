import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search for .env in candidate locations (root, backend, current cwd)
_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(os.path.dirname(_current_dir))
_root_dir = os.path.dirname(_backend_dir)

for _candidate in [
    os.path.join(_root_dir, ".env"),
    os.path.join(_backend_dir, ".env"),
    os.path.join(os.getcwd(), ".env"),
    os.path.join(os.getcwd(), "..", ".env"),
]:
    if os.path.exists(_candidate):
        load_dotenv(_candidate, override=False)

_is_vercel = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))
_default_db = "sqlite:////tmp/upsc_mentor.db" if _is_vercel else "sqlite:///./upsc_mentor.db"
_raw_db_url = os.getenv("DATABASE_URL", _default_db)
if _is_vercel and (_raw_db_url in ["sqlite:///./upsc_mentor.db", "./upsc_mentor.db", "sqlite:///upsc_mentor.db"]):
    _raw_db_url = "sqlite:////tmp/upsc_mentor.db"

_default_upload_dir = "/tmp/uploads" if _is_vercel else os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

_raw_cors = os.getenv("CORS_ORIGINS", "")
_env_cors = [c.strip() for c in _raw_cors.split(",") if c.strip()]
_default_cors = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

class Settings(BaseSettings):
    PROJECT_NAME: str = "UPSC Mentor AI - AntiGravity IAS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SITE_URL: str = os.getenv("SITE_URL", "https://upsc-mentor-ai.vercel.app")
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "upsc-mentor-ai-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    # Default to SQLite for zero-setup execution, or PostgreSQL (e.g. postgresql://user:pass@ep-xyz.neon.tech/neondb)
    DATABASE_URL: str = _raw_db_url
    
    # AI / LLM Configuration
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    OPENROUTER_BASE_URL: str = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
    OPENROUTER_TIMEOUT_SECONDS: float = float(os.getenv("OPENROUTER_TIMEOUT_SECONDS", "45.0"))
    MAX_HISTORY_MESSAGES: int = int(os.getenv("MAX_HISTORY_MESSAGES", "8"))
    PORT: int = int(os.getenv("PORT", "5000"))

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_LLM_MODEL: str = os.getenv("DEFAULT_LLM_MODEL", "gemini-2.5-flash")
    DEEP_ANALYSIS_MODEL: str = os.getenv("DEEP_ANALYSIS_MODEL", "gemini-2.5-pro")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-004")
    TEMPERATURE: float = 0.3
    MAX_OUTPUT_TOKENS: int = 2048
    
    # RAG Settings
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 100
    TOP_K_RETRIEVAL: int = 4
    SIMILARITY_THRESHOLD: float = 0.45
    
    # Upload Directories
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", _default_upload_dir)
    
    # CORS
    CORS_ORIGINS: List[str] = list(dict.fromkeys(_default_cors + _env_cors))

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists (gracefully handle read-only filesystems on serverless)
try:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
except Exception:
    settings.UPLOAD_DIR = "/tmp/uploads"
    try:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    except Exception:
        pass
