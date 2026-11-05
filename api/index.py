import os
import sys

_current_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_current_dir)
_backend_dir = os.path.join(_project_root, "backend")

# Unload any top-level 'app' module that might refer to a root app.py file
if "app" in sys.modules and not hasattr(sys.modules["app"], "__path__"):
    del sys.modules["app"]

# Ensure backend directory is prioritized first in sys.path
if _backend_dir in sys.path:
    sys.path.remove(_backend_dir)
sys.path.insert(0, _backend_dir)

if _project_root not in sys.path:
    sys.path.append(_project_root)

# Export FastAPI ASGI application for Vercel Serverless Function
try:
    from app.main import app
except ImportError:
    from backend.app.main import app
