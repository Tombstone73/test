# Restart Scripts

This directory contains scripts to properly restart the Preflight Management application by killing any existing processes and starting fresh instances.

## Why Use These Scripts?

When you make code changes, the servers need to be completely restarted to pick up the new code. Simply running the start scripts again won't work if processes are already running. These restart scripts handle that automatically.

## Available Scripts

### Full Application Restart

**Linux/Mac:**
```bash
./restart.sh
```

**Windows:**
```cmd
restart.bat
```

These scripts will:
1. Stop all backend (uvicorn) processes
2. Stop all frontend (vite) processes
3. Wait for ports to be released
4. Start the backend on http://localhost:8000
5. Start the frontend on http://localhost:5173

### Backend Only

**Linux/Mac:**
```bash
./restart-backend.sh
```

**Windows:**
```cmd
restart-backend.bat
```

Restarts only the FastAPI backend server.

### Frontend Only

**Linux/Mac:**
```bash
./restart-frontend.sh
```

**Windows:**
```cmd
restart-frontend.bat
```

Restarts only the React/Vite frontend server.

## What Gets Fixed

These scripts ensure:
- All old processes are killed before starting new ones
- Ports 8000 (backend) and 5173 (frontend) are freed up
- Fresh instances start with the latest code changes
- Dependencies are installed if missing
- Virtual environments are activated correctly

## Logs

**Linux/Mac (when using restart.sh):**
- Backend: `tail -f backend/backend.log`
- Frontend: `tail -f frontend/frontend.log`

**Windows:**
- Logs appear in separate command windows

## Manual Process Cleanup

If you need to manually stop services:

**Linux/Mac:**
```bash
pkill -f "uvicorn app.main:app"  # Stop backend
pkill -f "vite"                   # Stop frontend
```

**Windows:**
```cmd
taskkill /F /FI "COMMANDLINE eq *uvicorn*app.main:app*"
taskkill /F /FI "COMMANDLINE eq *vite*"
```

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:
1. Run the restart script again - it will kill the existing processes
2. Or manually kill processes using the commands above
3. Wait a few seconds for ports to be released

### Permission Denied (Linux/Mac)

If you get "permission denied":
```bash
chmod +x restart.sh restart-backend.sh restart-frontend.sh
```

### Python/Node Not Found

Make sure you have:
- Python 3.8+ installed
- Node.js 16+ and npm installed
- They are in your system PATH
