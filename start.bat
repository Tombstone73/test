@echo off
REM Preflight Management App - Complete Startup Script (Windows)
REM This script kills any processes on ports 3000-3004 and 8000, then starts frontend and backend

echo ==================================
echo Preflight Management App Startup
echo ==================================
echo.

REM Step 1: Kill processes on ports
echo Step 1: Cleaning up ports...
echo ----------------------------

REM Kill port 3000-3004
for /L %%p in (3000,1,3004) do (
    echo Checking port %%p...
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":%%p" ^| find "LISTENING"') do (
        echo Killing process on port %%p (PID: %%a)
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Kill port 8000
echo Checking port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Killing process on port 8000 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo.
timeout /t 2 /nobreak >nul

REM Step 2: Start Backend
echo Step 2: Starting Backend Server...
echo -----------------------------------
cd backend

REM Create .env if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo Created .env file from template
)

REM Check if virtual environment exists
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
echo Installing backend dependencies...
pip install -q -r requirements.txt

REM Start backend in background
echo Starting FastAPI server on http://localhost:8000
echo API Docs available at http://localhost:8000/docs
start /B python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ..\backend.log 2>&1

REM Return to root directory
cd ..
echo.

REM Wait for backend to start
echo Waiting for backend to be ready...
timeout /t 3 /nobreak >nul

REM Step 3: Start Frontend
echo Step 3: Starting Frontend Server...
echo ------------------------------------
cd frontend

REM Create .env if it doesn't exist
if not exist .env (
    copy .env.example .env
    echo Created .env file from template
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)

REM Start frontend
echo Starting Vite dev server on http://localhost:3000
echo.
echo ==================================
echo Backend running on port 8000
echo Frontend running on port 3000
echo ==================================
echo.
echo Press Ctrl+C to stop the frontend
echo (Backend will continue running)
echo.

call npm run dev
