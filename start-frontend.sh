#!/bin/bash
# Start Frontend Development Server

echo "Starting Preflight Management Frontend..."

cd frontend

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file from template"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start development server
echo "Starting development server on http://localhost:3000"
npm run dev
