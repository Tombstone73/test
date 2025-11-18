@echo off
REM Restart Backend Server Only

echo ===================================
echo Restarting Backend Server
echo ===================================

REM Kill backend (uvicorn/python)
echo Stopping backend...
taskkill /F /FI "WINDOWTITLE eq *uvicorn*" 2>nul
taskkill /F /FI "COMMANDLINE eq *uvicorn*app.main:app*" 2>nul
echo [OK] Backend processes stopped

REM Wait for port to be released
timeout /t 2 /nobreak >nul

REM Start backend
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
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
