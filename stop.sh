#!/bin/bash
# Stop all Preflight Management dev servers

echo
echo "========================================"
echo "  Stopping Preflight Management App"
echo "========================================"
echo

node scripts/killPorts.js

echo
echo "Done!"
