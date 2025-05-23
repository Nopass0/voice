#!/bin/bash

echo "📦 Generating lock files for better reproducibility..."

# Backend - generate bun.lock if needed
if [ -d "backend" ]; then
    echo "Checking backend lock file..."
    cd backend
    if [ ! -f "bun.lock" ] && [ ! -f "bun.lockb" ]; then
        echo "Generating bun.lock..."
        bun install
        echo "✅ Backend lock file generated"
    else
        echo "✅ Backend lock file already exists"
    fi
    cd ..
fi

# Frontend - generate package-lock.json if needed
if [ -d "frontend" ]; then
    echo "Checking frontend lock file..."
    cd frontend
    if [ ! -f "package-lock.json" ] && [ ! -f "yarn.lock" ] && [ ! -f "pnpm-lock.yaml" ]; then
        echo "Generating package-lock.json..."
        npm install
        echo "✅ Frontend lock file generated"
    else
        echo "✅ Frontend lock file already exists"
    fi
    cd ..
fi

echo ""
echo "✅ Lock files check complete!"
echo ""
echo "Note: Lock files ensure consistent dependency versions across deployments."
echo "Consider committing them to the repository for production stability."