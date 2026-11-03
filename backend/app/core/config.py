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

class Settings(BaseSettings):
    PROJECT_NAME: str = "UPSC Mentor AI - AntiGravity IAS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Security & Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "upsc-mentor-ai-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    # Default to SQLite for zero-setup local execution, or set to PostgreSQL (e.g., postgresql://user:pass@localhost:5432/upsc_mentor)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./upsc_mentor.db")
    
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
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
