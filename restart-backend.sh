#!/bin/bash
# Restart Backend Server Only

echo "==================================="
echo "Restarting Backend Server"
echo "==================================="

# Kill backend (uvicorn)
echo "Stopping backend..."
pkill -f "uvicorn app.main:app" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[OK] Backend processes stopped"
else
    echo "[INFO] No backend processes found"
fi

# Wait for port to be released
sleep 2

# Start backend
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

# Start server
echo ""
echo "[OK] Starting FastAPI server on http://localhost:8000"
echo "[INFO] API Docs available at http://localhost:8000/docs"
echo ""
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
