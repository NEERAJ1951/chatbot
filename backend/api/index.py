import os
import sys

_current_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_current_dir)
_project_root = os.path.dirname(_backend_dir)

# Ensure backend directory is prioritized first in sys.path
if _backend_dir in sys.path:
    sys.path.remove(_backend_dir)
sys.path.insert(0, _backend_dir)

if _project_root not in sys.path:
    sys.path.append(_project_root)

# Export FastAPI ASGI application for Vercel Serverless Function
from app.main import app
