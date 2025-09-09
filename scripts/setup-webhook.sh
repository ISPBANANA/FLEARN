#!/bin/bash

# FLEARN Webhook Setup Script
# This script helps set up GitHub webhooks for automatic deployment

set -e

echo "🎣 FLEARN Webhook Setup"
echo "======================"

# Generate a secure webhook secret if not provided
if [ -z "$1" ]; then
    echo "📝 Generating secure webhook secret..."
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    echo "🔐 Generated webhook secret: $WEBHOOK_SECRET"
else
    WEBHOOK_SECRET="$1"
    echo "🔐 Using provided webhook secret"
fi

# Update .env file
echo "📝 Updating .env file..."
if grep -q "WEBHOOK_SECRET=" .env; then
    sed -i "s/WEBHOOK_SECRET=.*/WEBHOOK_SECRET=$WEBHOOK_SECRET/" .env
else
    echo "WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env
fi

echo "✅ Webhook secret configured in .env file"
echo ""

# Remove old cron job
echo "🗑️  Removing old auto-update cron job..."
(crontab -l 2>/dev/null | grep -v "auto-update.sh" || true) | crontab -
echo "✅ Old cron job removed"
echo ""

# Build and start the webhook service
echo "🔨 Building and starting webhook service..."
docker compose up -d webhook-service

echo ""
echo "🎉 Webhook setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository settings"
echo "2. Navigate to Settings > Webhooks"
echo "3. Click 'Add webhook'"
echo "4. Set Payload URL to: http://your-server-ip:3001/webhook"
echo "5. Set Content type to: application/json"
echo "6. Set Secret to: $WEBHOOK_SECRET"
echo "7. Select 'Just the push event'"
echo "8. Make sure 'Active' is checked"
echo "9. Click 'Add webhook'"
echo ""
echo "🔍 Test the webhook:"
echo "curl -X GET http://localhost:3001/health"
echo ""
echo "📊 Check webhook service status:"
echo "docker compose logs webhook-service"
