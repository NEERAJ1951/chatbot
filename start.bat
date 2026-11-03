@echo off
echo ========================================================
echo  Starting UPSC Mentor AI (AntiGravity IAS Academy)
echo ========================================================
echo.
echo Starting Backend (FastAPI)...
start "UPSC Mentor - Backend" cmd /k "cd /d %~dp0backend && python run.py"

echo Starting Frontend (Vite React)...
start "UPSC Mentor - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers launched in separate windows!
echo Open your browser at: http://localhost:5173
echo.
pause
