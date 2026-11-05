import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Normalize database URL for SQLAlchemy 2.0 (e.g. Supabase, Neon postgres:// -> postgresql://)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Handle Vercel serverless environment with SQLite
if (os.getenv("VERCEL") or os.getenv("VERCEL_ENV")) and db_url.startswith("sqlite"):
    tmp_db_path = "/tmp/upsc_mentor.db"
    # Seed /tmp database from bundled db if it exists
    if not os.path.exists(tmp_db_path):
        candidate_paths = [
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "upsc_mentor.db"),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "backend", "upsc_mentor.db"),
            os.path.abspath("./backend/upsc_mentor.db"),
            os.path.abspath("./upsc_mentor.db")
        ]
        for candidate in candidate_paths:
            if os.path.exists(candidate) and os.path.isfile(candidate):
                try:
                    shutil.copy2(candidate, tmp_db_path)
                    break
                except Exception:
                    pass
    db_url = f"sqlite:///{tmp_db_path}"

# Serverless connection pooling configuration
if db_url.startswith("sqlite"):
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
else:
    # PostgreSQL / MySQL serverless pool settings
    engine = create_engine(
        db_url,
        pool_size=5,
        max_overflow=10,
        pool_recycle=300,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency that yields a database session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
