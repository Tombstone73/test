#!/bin/bash
# Preflight Management App - Complete Startup Script
# This script kills any processes on ports 3000-3004 and 8000, then starts frontend and backend

set -e  # Exit on error

echo "=================================="
echo "Preflight Management App Startup"
echo "=================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to kill process on a specific port
kill_port() {
    local port=$1
    echo -n "Checking port $port... "

    # Try lsof first (works on macOS and most Linux)
    if command -v lsof &> /dev/null; then
        pid=$(lsof -ti:$port 2>/dev/null)
        if [ -n "$pid" ]; then
            kill -9 $pid 2>/dev/null && echo -e "${GREEN}✓ Killed process $pid${NC}" || echo -e "${RED}✗ Failed to kill${NC}"
            return
        fi
    fi

    # Try fuser as fallback (Linux)
    if command -v fuser &> /dev/null; then
        if fuser -k ${port}/tcp 2>/dev/null; then
            echo -e "${GREEN}✓ Killed process${NC}"
            return
        fi
    fi

    echo "Not in use"
}

# Step 1: Kill processes on ports
echo "Step 1: Cleaning up ports..."
echo "----------------------------"
kill_port 3000
kill_port 3001
kill_port 3002
kill_port 3003
kill_port 3004
kill_port 8000
echo

# Give processes time to fully terminate
sleep 1

# Step 2: Start Backend
echo "Step 2: Starting Backend Server..."
echo "-----------------------------------"
cd backend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}Created .env file from template${NC}"
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

# Start backend in background
echo -e "${GREEN}Starting FastAPI server on http://localhost:8000${NC}"
echo "API Docs available at http://localhost:8000/docs"
nohup python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Return to root directory
cd ..
echo

# Wait for backend to start
echo "Waiting for backend to be ready..."
sleep 3

# Step 3: Start Frontend
echo "Step 3: Starting Frontend Server..."
echo "------------------------------------"
cd frontend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}Created .env file from template${NC}"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend (this will run in foreground)
echo -e "${GREEN}Starting Vite dev server on http://localhost:3000${NC}"
echo
echo "=================================="
echo "✓ Backend running on port 8000"
echo "✓ Frontend starting on port 3000"
echo "=================================="
echo
echo "Press Ctrl+C to stop both servers"
echo

# Trap SIGINT (Ctrl+C) to cleanup
cleanup() {
    echo
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill_port 3000
    kill_port 8000
    echo "Servers stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start frontend (runs in foreground)
npm run dev
