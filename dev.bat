@echo off
REM Windows wrapper for npm run dev
REM This ensures consistent behavior on Windows

echo.
echo ========================================
echo  Preflight Management App
echo ========================================
echo.
echo Starting development servers...
echo.

REM Install concurrently if needed
if not exist node_modules\concurrently (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Run the dev command
call npm run dev
