#!/bin/bash

# FLEARN Docker Update Script
# This script pulls the latest code from git and rebuilds the Docker containers

set -e

echo "🔄 Updating FLEARN to latest version from main branch..."

# Stop running containers
echo "⏹️  Stopping containers..."
docker-compose down

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
docker-compose build --no-cache --build-arg CACHEBUST=$(date +%s)

# Start containers with latest code
echo "🚀 Starting containers with latest code..."
docker-compose up -d

echo "✅ Update complete! FLEARN is now running with the latest code from main branch."
echo "📝 Frontend: http://localhost:3000"
echo "📝 Backend API: http://localhost:8099"

# Show container status
echo "📊 Container status:"
docker-compose ps
