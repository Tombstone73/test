#!/bin/bash
# Preflight Management App - Legacy startup script
# DEPRECATED: Use 'npm run dev' instead for better cross-platform support
#
# This script is kept for backwards compatibility but we recommend:
#   npm run dev    - Start both servers
#   npm run stop   - Stop all servers

echo "⚠️  DEPRECATION NOTICE"
echo "This script is deprecated. Please use 'npm run dev' instead."
echo "Continuing in 3 seconds..."
sleep 3

# Run the new npm-based startup
npm run dev
