# Development Setup Guide

## 🚀 Quick Start (Recommended Method)

### First Time Setup

1. **Install Node.js dependencies** (root level):
   ```bash
   npm install
   ```

2. **Install frontend dependencies**:
   ```bash
   cd frontend && npm install && cd ..
   ```

3. **Setup Python backend** (one time):
   ```bash
   cd backend
   python -m venv venv

   # On Windows:
   venv\Scripts\activate

   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   cd ..
   ```

4. **Create .env files** (if they don't exist):
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your settings

   # Frontend
   cd ../frontend
   cp .env.example .env
   # Edit .env with your settings
   cd ..
   ```

### Running the App

**Start both frontend and backend** (recommended):
```bash
npm run dev
```

This will:
- ✅ Automatically kill any processes on ports 3000-3004 and 8000
- ✅ Start the backend (FastAPI) on http://localhost:8000
- ✅ Start the frontend (Vite) on http://localhost:3000
- ✅ Show color-coded logs from both servers
- ✅ Stop **BOTH** servers when you press Ctrl+C

**Stop all servers**:
```bash
npm run stop
```

Or on Windows:
```cmd
stop.bat
```

Or on Unix/macOS:
```bash
./stop.sh
```

---

## 📋 Available Commands

### Root Level Commands (npm scripts)

| Command | Description |
|---------|-------------|
| `npm run dev` | **Start both servers** (kills ports first, then starts backend + frontend) |
| `npm run stop` | **Stop all servers** (kills all processes on ports 3000-3004, 8000) |
| `npm run dev:backend` | Start only the backend server |
| `npm run dev:frontend` | Start only the frontend server |
| `npm run install:all` | Install dependencies for both frontend and backend |
| `npm run build` | Build the frontend for production |
| `npm run clean` | Clean up all dev server processes |

### Individual Server Commands

**Backend only**:
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend only**:
```bash
cd frontend
npm run dev
```

---

## 🔧 How It Works

### The Problem We Solved

**Old behavior (start.bat, start.sh):**
- ❌ Backend was started with `start /B` (Windows) or `nohup &` (Unix)
- ❌ Created **detached background processes**
- ❌ Processes survived after Ctrl+C
- ❌ Port-in-use errors on next run
- ❌ Manual cleanup required
- ❌ Platform-specific scripts (didn't work everywhere)

**New behavior (npm run dev):**
- ✅ Uses `concurrently` to run both servers in a **single process group**
- ✅ Pre-flight check kills old processes automatically (`predev` script)
- ✅ Ctrl+C kills **BOTH** servers (no zombies)
- ✅ Cross-platform Node.js port killer (`scripts/killPorts.js`)
- ✅ Works identically on Windows, macOS, and Linux
- ✅ Unified npm commands

### Technical Details

**Port Killing (`scripts/killPorts.js`)**:
- Windows: Uses `netstat -aon` + `taskkill /F /PID`
- macOS/Linux: Uses `lsof -ti` + `kill -9` (fallback to `fuser`)
- Cleans ports: 3000-3004 (Vite + dev servers) and 8000 (FastAPI)
- Exits cleanly even if no processes are running

**Process Management (`concurrently`)**:
- Runs backend and frontend in parallel
- `--kill-others-on-fail`: If one crashes, stop both
- Colored, prefixed logs for easy debugging
- Single Ctrl+C stops everything

**Script Hierarchy**:
```
npm run dev
  ├─ [predev] → node scripts/killPorts.js  (cleanup)
  └─ concurrently
       ├─ BACKEND: cd backend && uvicorn ...
       └─ FRONTEND: cd frontend && npm run dev
```

---

## ❓ Troubleshooting

### "Port 3000 (or 8000) is already in use"

**Solution 1** (Recommended):
```bash
npm run stop
```

**Solution 2** (Manual - Windows):
```cmd
node scripts\killPorts.js
```

**Solution 3** (Manual - macOS/Linux):
```bash
node scripts/killPorts.js
```

**Solution 4** (Nuclear option - Windows PowerShell):
```powershell
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
Get-NetTCPConnection -LocalPort 8000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

**Solution 5** (Nuclear option - macOS/Linux):
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### "Backend keeps running after I stop the frontend"

This was the old behavior with `start.bat` / `start.sh`.

**Fix**: Use the new `npm run dev` command instead. The old scripts now redirect to the new method.

### "concurrently not found"

**Fix**:
```bash
npm install
```

This installs `concurrently` from the root `package.json`.

### Python virtual environment not found

**Fix** (Windows):
```cmd
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Fix** (macOS/Linux):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 🔄 Migration from Old Scripts

If you were using `start.sh` or `start.bat`:

**Old way**:
```bash
./start.sh          # Unix
start.bat           # Windows
# Then manually kill processes later...
```

**New way**:
```bash
npm run dev         # All platforms
# Press Ctrl+C when done (kills everything)
# Or: npm run stop
```

The old scripts still work but now redirect to `npm run dev` after a deprecation warning.

---

## 📦 Dependencies

**Root level** (`package.json`):
- `concurrently` - Run multiple commands in parallel

**Frontend** (`frontend/package.json`):
- React, Vite, React Router, Axios, Tailwind CSS, etc.

**Backend** (`backend/requirements.txt`):
- FastAPI, uvicorn, SQLAlchemy, Pydantic, etc.

---

## 🎯 Best Practices

1. **Always use `npm run dev`** to start servers
2. **Always use `npm run stop`** or Ctrl+C to stop servers
3. **Don't use `start /B` or `nohup &`** - they create zombie processes
4. **Check port status** before debugging: `npm run stop` first
5. **Keep the terminal open** - don't background the dev command

---

## 📝 Summary

| Task | Command |
|------|---------|
| **Start everything** | `npm run dev` |
| **Stop everything** | `npm run stop` or Ctrl+C |
| **Install deps** | `npm install` (root) + `npm run install:all` |
| **Clean ports** | `npm run clean` |
| **Build for prod** | `npm run build` |

**Your workflow should be**:
```bash
# Morning:
npm run dev

# Work on your code...
# Ctrl+C when done

# If problems:
npm run stop
npm run dev
```

That's it! No more port-in-use errors! 🎉
