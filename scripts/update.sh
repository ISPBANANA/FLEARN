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
docker compose down

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
docker compose build --no-cache --build-arg CACHEBUST=$(date +%s)

# Start containers with latest code
echo "🚀 Starting containers with latest code..."
docker compose up -d

echo "✅ Manual update complete! FLEARN is now running with the latest code."
echo ""
echo "🌐 Service URLs:"
echo "📝 Frontend: http://localhost:3000"
echo "📝 Backend API: http://localhost:8099"
echo "🎣 Webhook Service: http://localhost:3001"
echo ""

# Show container status
echo "📊 Container status:"
docker compose ps

echo ""
echo "💡 Pro tip: Set up GitHub webhooks for automatic deployments!"
echo "   Run: ./scripts/setup-webhook.sh"
