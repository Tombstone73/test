#!/bin/bash
# Restart both Frontend and Backend servers
# This script kills any running instances and starts fresh

echo "==================================="
echo "Restarting Preflight Management"
echo "==================================="

# Kill backend (uvicorn)
echo ""
echo "Stopping backend..."
pkill -f "uvicorn app.main:app" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[OK] Backend processes stopped"
else
    echo "[INFO] No backend processes found"
fi

# Kill frontend (vite/node)
echo ""
echo "Stopping frontend..."
pkill -f "vite" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[OK] Frontend processes stopped"
else
    echo "[INFO] No frontend processes found"
fi

# Wait a moment for ports to be released
sleep 2

# Start backend
echo ""
echo "==================================="
echo "Starting backend..."
echo "==================================="
cd backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] Created .env file from template"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Start server in background
echo ""
echo "[OK] Starting FastAPI server on http://localhost:8000"
echo "[INFO] API Docs available at http://localhost:8000/docs"
nohup python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo "[OK] Backend started (PID: $BACKEND_PID)"

cd ..

# Start frontend
echo ""
echo "==================================="
echo "Starting frontend..."
echo "==================================="
cd frontend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] Created .env file from template"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start development server in background
echo ""
echo "[OK] Starting development server on http://localhost:5173"
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "[OK] Frontend started (PID: $FRONTEND_PID)"

cd ..

echo ""
echo "==================================="
echo "All services started!"
echo "==================================="
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "  Backend:  tail -f backend/backend.log"
echo "  Frontend: tail -f frontend/frontend.log"
echo ""
echo "To stop all services, run:"
echo "  pkill -f 'uvicorn app.main:app'"
echo "  pkill -f 'vite'"
echo ""
