#!/bin/bash

# Preflight Management System - Unified Startup Script
# This script starts both the backend and frontend servers

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Store PIDs
BACKEND_PID=""
FRONTEND_PID=""

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"

    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${CYAN}Stopping backend (PID: $BACKEND_PID)${NC}"
        kill -TERM $BACKEND_PID 2>/dev/null || true
        # Kill the entire process group to ensure child processes are also killed
        pkill -P $BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${CYAN}Stopping frontend (PID: $FRONTEND_PID)${NC}"
        kill -TERM $FRONTEND_PID 2>/dev/null || true
        # Kill the entire process group to ensure child processes are also killed
        pkill -P $FRONTEND_PID 2>/dev/null || true
    fi

    # Wait a moment for graceful shutdown
    sleep 2

    # Force kill if still running
    if [ ! -z "$BACKEND_PID" ] && ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill -9 $BACKEND_PID 2>/dev/null || true
        pkill -9 -P $BACKEND_PID 2>/dev/null || true
    fi

    if [ ! -z "$FRONTEND_PID" ] && ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill -9 $FRONTEND_PID 2>/dev/null || true
        pkill -9 -P $FRONTEND_PID 2>/dev/null || true
    fi

    echo -e "${GREEN}All services stopped${NC}"
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Print header
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Preflight Management System - Startup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if scripts exist
if [ ! -f "start-backend.sh" ]; then
    echo -e "${RED}Error: start-backend.sh not found${NC}"
    exit 1
fi

if [ ! -f "start-frontend.sh" ]; then
    echo -e "${RED}Error: start-frontend.sh not found${NC}"
    exit 1
fi

# Make scripts executable
chmod +x start-backend.sh
chmod +x start-frontend.sh

# Create log directory
mkdir -p .logs

# Start Backend
echo -e "${CYAN}[1/2] Starting Backend...${NC}"
./start-backend.sh > .logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo -e "      Log: .logs/backend.log"
echo -e "      URL: ${BLUE}http://localhost:8000${NC}"
echo -e "      Docs: ${BLUE}http://localhost:8000/docs${NC}"
echo ""

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo -e "${CYAN}[2/2] Starting Frontend...${NC}"
./start-frontend.sh > .logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
echo -e "      Log: .logs/frontend.log"
echo -e "      URL: ${BLUE}http://localhost:3000${NC}"
echo ""

# Wait for services to initialize
echo -e "${YELLOW}Waiting for services to initialize...${NC}"
sleep 3

# Print status
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ All services are running${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}Frontend:${NC}  http://localhost:3000"
echo -e "${CYAN}Backend:${NC}   http://localhost:8000"
echo -e "${CYAN}API Docs:${NC}  http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Monitor logs in real-time (interleaved)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Live Logs (Ctrl+C to stop)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Tail both logs with labels
tail -f .logs/backend.log .logs/frontend.log 2>/dev/null | while IFS= read -r line; do
    if [[ $line == "==>"* ]]; then
        # File separator from tail -f
        echo -e "${CYAN}$line${NC}"
    else
        echo "$line"
    fi
done
