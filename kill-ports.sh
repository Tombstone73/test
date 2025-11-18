#!/bin/bash

# Script to kill processes running on ports 3000-3004

echo "Searching for processes on ports 3000-3004..."
echo

for port in {3000..3004}; do
    # Try lsof first (works on macOS and Linux)
    pid=$(lsof -ti:$port 2>/dev/null)

    if [ -n "$pid" ]; then
        echo "Found process $pid on port $port"
        kill -9 $pid 2>/dev/null && echo "✓ Killed process $pid on port $port" || echo "✗ Failed to kill process $pid"
    else
        # Try fuser as fallback (Linux)
        fuser -k ${port}/tcp 2>/dev/null && echo "✓ Killed process on port $port" || echo "  Port $port is not in use"
    fi
done

echo
echo "Done! All processes on ports 3000-3004 have been terminated."
