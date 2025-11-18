@echo off
REM Restart both Frontend and Backend servers
REM This script kills any running instances and starts fresh

echo ===================================
echo Restarting Preflight Management
echo ===================================

REM Kill backend (uvicorn/python)
echo.
echo Stopping backend...
taskkill /F /FI "WINDOWTITLE eq *uvicorn*" 2>nul
taskkill /F /FI "COMMANDLINE eq *uvicorn*app.main:app*" 2>nul
echo [OK] Backend processes stopped

REM Kill frontend (node/vite)
echo.
echo Stopping frontend...
taskkill /F /FI "WINDOWTITLE eq *vite*" 2>nul
taskkill /F /FI "COMMANDLINE eq *vite*" 2>nul
echo [OK] Frontend processes stopped

REM Wait a moment for ports to be released
timeout /t 2 /nobreak >nul

REM Start backend
echo.
echo ===================================
echo Starting backend...
echo ===================================

cd backend

REM Create .env if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file from template
)

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
echo Installing dependencies...
pip install -q -r requirements.txt

REM Start server
echo.
echo [OK] Starting FastAPI server on http://localhost:8000
echo [INFO] API Docs available at http://localhost:8000/docs
start "Preflight Backend" cmd /k "venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

cd ..

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start frontend
echo.
echo ===================================
echo Starting frontend...
echo ===================================

cd frontend

REM Create .env if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo [OK] Created .env file from template
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

REM Start development server
echo.
echo [OK] Starting development server on http://localhost:5173
start "Preflight Frontend" cmd /k "npm run dev"

cd ..

echo.
echo ===================================
echo All services started!
echo ===================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Two command windows will open:
echo   - Preflight Backend (FastAPI)
echo   - Preflight Frontend (Vite)
echo.
echo To stop services, close those windows or use:
echo   taskkill /F /FI "WINDOWTITLE eq Preflight*"
echo.
pause
