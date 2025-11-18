#!/bin/bash
# Restart Frontend Server Only

echo "==================================="
echo "Restarting Frontend Server"
echo "==================================="

# Kill frontend (vite/node)
echo "Stopping frontend..."
pkill -f "vite" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "[OK] Frontend processes stopped"
else
    echo "[INFO] No frontend processes found"
fi

# Wait for port to be released
sleep 2

# Start frontend
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

# Start development server
echo ""
echo "[OK] Starting development server on http://localhost:5173"
echo ""
npm run dev
