#!/bin/bash

# FLEARN Manual Update Script
# This script manually pulls the latest code from git and rebuilds the Docker containers
# Note: If you have webhooks configured, updates happen automatically on push to main

set -e

echo "🔄 Manually updating FLEARN to latest version from main branch..."
echo "💡 Tip: Configure webhooks for automatic updates on git push!"

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Stop running containers
echo "⏹️  Stopping containers..."
if command -v docker-compose &> /dev/null; then
    docker-compose down
elif docker compose version &> /dev/null; then
    docker compose down
else
    echo "❌ Neither docker-compose nor docker compose found!"
    exit 1
fi

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
if command -v docker-compose &> /dev/null; then
    docker-compose build --no-cache --build-arg CACHEBUST=$(date +%s)
else
    docker compose build --no-cache --build-arg CACHEBUST=$(date +%s)
fi

# Start containers with latest code
echo "🚀 Starting containers with latest code..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
else
    docker compose up -d
fi

echo "✅ Manual update complete! FLEARN is now running with the latest code."
echo ""
echo "🌐 Service URLs:"
echo "📝 Frontend: http://localhost:3000"
echo "📝 Backend API: http://localhost:8099"
echo "🎣 Webhook Service: http://localhost:3001"
echo ""

# Show container status
echo "📊 Container status:"
if command -v docker-compose &> /dev/null; then
    docker-compose ps
else
    docker compose ps
fi

echo ""
echo "💡 Pro tip: Set up GitHub webhooks for automatic deployments!"
echo "   Run: ./scripts/setup-webhook.sh"
