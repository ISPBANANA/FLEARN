# FLEARN Webhook Deployment System

## 🎯 What Changed

The FLEARN project has been upgraded from a cron-based auto-update system to a modern webhook-based deployment system that provides instant deployments when code is pushed to GitHub.

## ✅ What Was Removed

- **Cron job**: Removed the hourly cron job (`0 * * * * /home/yotshiba/ispbanana/FLEARN/scripts/auto-update.sh`)
- **Auto-update script**: The old auto-update mechanism that checked for changes periodically
- **Polling delays**: No more waiting up to an hour for deployments

## 🆕 What Was Added

### 1. Webhook Service
- **Container**: `flearn_webhook` - A new dedicated container for handling GitHub webhooks
- **Port**: 3001 (configurable via `WEBHOOK_PORT`)
- **Security**: HMAC SHA-256 signature verification for authentic GitHub requests
- **Monitoring**: Health check endpoint at `/health`

### 2. Automated Deployment
- **Instant**: Deployments trigger immediately when code is pushed to main branch
- **Logging**: All deployment activities logged to `logs/deployment.log`
- **Recovery**: Automatic container restart on deployment failures
- **Cache Busting**: Ensures fresh builds with timestamp-based cache invalidation

### 3. Configuration Files
- **`webhook-service/`**: New directory containing the webhook service code
- **`scripts/setup-webhook.sh`**: Script to configure the webhook system
- **`scripts/test-webhook.sh`**: Script to test webhook functionality
- **Environment variables**: Added `WEBHOOK_SECRET` and `WEBHOOK_PORT` to `.env`

### 4. Updated Scripts
- **`scripts/update.sh`**: Enhanced manual update script with webhook setup tips
- **Docker Compose**: Added webhook service configuration
- **README.md**: Updated with webhook setup instructions

## 🚀 How to Use

### Quick Setup
```bash
# 1. Run the setup script
./scripts/setup-webhook.sh

# 2. Configure GitHub webhook with the provided URL and secret
# 3. Push code to main branch for automatic deployment
```

### Manual Deployment (Backup)
```bash
# If webhook is unavailable, use manual update
./scripts/update.sh
```

### Monitoring
```bash
# Check webhook service status
docker compose ps webhook-service

# View webhook logs
docker compose logs -f webhook-service

# Check deployment history
tail -f logs/deployment.log

# Test webhook health
curl http://localhost:3001/health
```

## 🔧 Technical Details

### Webhook Process
1. GitHub sends POST request to `/webhook` endpoint
2. Service verifies HMAC SHA-256 signature using `WEBHOOK_SECRET`
3. Checks if event is a push to `main` branch
4. Executes deployment sequence:
   - Git pull latest changes
   - Stop running containers
   - Rebuild with cache bust
   - Start containers
   - Clean up old images
   - Log deployment status

### Security Features
- **Signature Verification**: Only authentic GitHub requests are processed
- **Branch Filtering**: Only `main` branch pushes trigger deployments
- **Error Logging**: All failures are logged for debugging
- **Container Isolation**: Webhook service runs in isolated container

### Environment Variables
```bash
WEBHOOK_SECRET=your_github_webhook_secret_here  # Required for security
WEBHOOK_PORT=3001                               # Port for webhook service
```

## 🔗 GitHub Webhook Configuration

1. Go to your repository Settings → Webhooks
2. Click "Add webhook"
3. Set Payload URL: `http://your-server-ip:3001/webhook`
4. Set Content type: `application/json`
5. Set Secret: Use the secret from `scripts/setup-webhook.sh`
6. Select "Just the push event"
7. Ensure "Active" is checked
8. Click "Add webhook"

## 🎉 Benefits

- **⚡ Instant Deployment**: No more waiting for cron schedules
- **🔒 Secure**: Cryptographic verification of requests
- **📊 Monitored**: Complete logging and health checks
- **🔧 Reliable**: Error recovery and container restart capabilities
- **🎯 Targeted**: Only deploys on main branch pushes
- **🚀 Modern**: Industry-standard webhook-based CI/CD
