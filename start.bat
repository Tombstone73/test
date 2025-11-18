@echo off
REM Preflight Management App - Legacy startup script (Windows)
REM DEPRECATED: Use 'npm run dev' instead for better cross-platform support
REM
REM This script is kept for backwards compatibility but we recommend:
REM   npm run dev    - Start both servers
REM   npm run stop   - Stop all servers

echo.
echo ========================================
echo  WARNING: DEPRECATED SCRIPT
echo ========================================
echo.
echo This script is deprecated.
echo Please use: npm run dev
echo.
echo Redirecting in 3 seconds...
echo.
timeout /t 3 /nobreak >nul

REM Run the new npm-based startup
call npm run dev
