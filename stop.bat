@echo off
REM Stop all dev servers on Windows

echo.
echo ========================================
echo  Stopping Preflight Management App
echo ========================================
echo.

node scripts\killPorts.js

echo.
echo Done!
echo.
pause
