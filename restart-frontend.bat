@echo off
REM Restart Frontend Server Only

echo ===================================
echo Restarting Frontend Server
echo ===================================

REM Kill frontend (node/vite)
echo Stopping frontend...
taskkill /F /FI "WINDOWTITLE eq *vite*" 2>nul
taskkill /F /FI "COMMANDLINE eq *vite*" 2>nul
echo [OK] Frontend processes stopped

REM Wait for port to be released
timeout /t 2 /nobreak >nul

REM Start frontend
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
echo.
npm run dev
