# 🐳 Docker & Deployment Guide

This comprehensive guide covers containerized deployment using Docker, webhook-based auto-deployment, and production deployment strategies for FLEARN.

## 🎯 Overview

FLEARN uses a containerized microservices architecture with:
- **Docker Compose**: Multi-service orchestration
- **Webhook Deployment**: Automated GitHub-triggered deployments
- **Database Services**: PostgreSQL and MongoDB with web interfaces
- **Health Monitoring**: Built-in health checks and logging
- **Zero-Downtime Deployment**: Rolling updates with automatic rollback

## 🏗️ Container Architecture

```
FLEARN Container Stack
├── flearn-frontend     (Next.js)      - Port 3000
├── flearn-backend      (Express.js)   - Port 8099  
├── flearn-webhook      (Node.js)      - Port 3001
├── flearn-postgres     (PostgreSQL)   - Port 5432
├── flearn-mongodb      (MongoDB)      - Port 27017
├── flearn-pgadmin      (pgAdmin)      - Port 8088
└── flearn-mongo-express (Mongo Express) - Port 8087
```

## 🚀 Quick Docker Setup

### Prerequisites
- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Git** for repository management
- **4GB+ RAM** available for containers

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/ISPBANANA/FLEARN.git
cd FLEARN

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### 2. Start All Services

```bash
# Start all services in detached mode
docker compose up -d

# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f flearn-backend
```

### 3. Verify Deployment

```bash
# Check service status
docker compose ps

# Test health endpoints
curl http://localhost:8099/health
curl http://localhost:3001/health
```

Expected output:
```
NAME                    IMAGE                STATUS              PORTS
flearn-backend         flearn_backend       Up 30 seconds       0.0.0.0:8099->8099/tcp
flearn-frontend        flearn_frontend      Up 30 seconds       0.0.0.0:3000->3000/tcp
flearn-postgres        postgres:15          Up 45 seconds       0.0.0.0:5432->5432/tcp
flearn-mongodb         mongo:7.0            Up 45 seconds       0.0.0.0:27017->27017/tcp
flearn-pgadmin         dpage/pgladmin4      Up 30 seconds       0.0.0.0:8088->80/tcp
flearn-mongo-express   mongo-express        Up 30 seconds       0.0.0.0:8087->8081/tcp
flearn-webhook         flearn_webhook       Up 30 seconds       0.0.0.0:3001->3001/tcp
```

## ⚙️ Environment Configuration

### Complete .env Template

```env
# ===========================================
# Application Configuration
# ===========================================
NODE_ENV=production
FRONTEND_PORT=3000
API_PORT=8099

# ===========================================
# PostgreSQL Database
# ===========================================
POSTGRES_DB=flearn_db
POSTGRES_USER=flearn_user
POSTGRES_PASSWORD=generate_strong_unique_password_here
POSTGRES_PORT=5432

# ===========================================
# pgAdmin Configuration
# ===========================================
PGLADMIN_DEFAULT_EMAIL=admin@flearn.com
PGLADMIN_DEFAULT_PASSWORD=generate_strong_unique_password_here
PGLADMIN_PORT=8088

# ===========================================
# MongoDB Configuration
# ===========================================
MONGO_INITDB_ROOT_USERNAME=flearn_admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_mongo_password_here
MONGO_INITDB_DATABASE=flearn_mongo_db
MONGO_PORT=27017

# ===========================================
# MongoDB Express Configuration
# ===========================================
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=your_secure_express_password_here
MONGO_EXPRESS_PORT=8087
MONGO_EXPRESS_INTERNAL_PORT=8081

# ===========================================
# Auth0 Configuration
# ===========================================
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://flearn-api.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_SECRET=your_nextjs_auth0_secret

# ===========================================
# Webhook Service Configuration
# ===========================================
WEBHOOK_PORT=3001
WEBHOOK_SECRET=your_github_webhook_secret_here

# ===========================================
# CORS and Security
# ===========================================
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

### 🔒 Critical Security Requirements
- 🚨 **NEVER commit** `.env` files containing real secrets to version control
- 🔐 **Use strong, unique passwords** (minimum 16 characters, include symbols)
- 🔄 **Rotate all secrets** regularly (every 90 days minimum)
- 📁 **Add `.env*` to `.gitignore`** before first commit
- 🌍 **Use environment-specific** configurations (dev/staging/prod)
- 🔑 **Enable 2FA** on all service accounts (Auth0, GitHub, etc.)
- 📊 **Monitor access logs** for unauthorized attempts
- 🛡️ **Use HTTPS only** in production environments

## 🎣 Webhook Auto-Deployment System

FLEARN includes a sophisticated webhook system for instant deployment when code is pushed to GitHub.

### Setup Webhook Deployment

#### 1. Configure Webhook Service
```bash
# Run the automated setup script
./scripts/setup-webhook.sh

# Or provide custom secret
./scripts/setup-webhook.sh your_custom_webhook_secret
```

#### 2. GitHub Webhook Configuration
1. Go to your GitHub repository **Settings** → **Webhooks**
2. Click **"Add webhook"**
3. Configure webhook:
   ```
   Payload URL: http://your-server-ip:3001/webhook
   Content type: application/json
   Secret: [use secret from setup script]
   Events: Just the push event
   Active: ✓ Checked
   ```

#### 3. Test Webhook System
```bash
# Test webhook functionality
./scripts/test-webhook.sh

# Check webhook service health
curl http://localhost:3001/health

# Monitor webhook logs
docker compose logs -f flearn-webhook
```

### Webhook Deployment Process

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant WH as Webhook Service
    participant Docker as Docker Compose
    participant App as FLEARN App
    
    Dev->>GH: git push main
    GH->>WH: POST /webhook (with signature)
    WH->>WH: Verify HMAC signature
    WH->>Docker: git pull latest
    WH->>Docker: docker compose down
    WH->>Docker: docker compose build --no-cache
    WH->>Docker: docker compose up -d
    WH->>App: Health check verification
    WH->>GH: Deployment status (success/failure)
```

### Webhook Features
- **🔒 Security**: HMAC SHA-256 signature verification
- **⚡ Speed**: Instant deployment on push to main branch
- **📊 Logging**: Comprehensive deployment logs
- **🔄 Recovery**: Automatic rollback on failure
- **🎯 Selective**: Only deploys on main branch pushes
- **💻 Health Checks**: Verifies services after deployment

### Manual Deployment (Backup)
```bash
# If webhook is unavailable, use manual update
./scripts/update.sh

# Force rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d
```

## 🗄️ Database Management

### PostgreSQL Management

#### Access via pgAdmin
1. Open http://localhost:8088
2. Login with credentials from `.env` file
3. **Add Server Connection**:
   ```
   General:
     Name: FLEARN PostgreSQL
   
   Connection:
     Host name/address: postgres
     Port: 5432
     Maintenance database: flearn_db
     Username: flearn_user
     Password: [from .env]
   ```

#### Direct PostgreSQL Access
```bash
# Connect via Docker container
docker compose exec postgres psql -U flearn_user -d flearn_db

# Connect from host machine
psql -h localhost -p 5432 -U flearn_user -d flearn_db

# Run SQL commands
docker compose exec postgres psql -U flearn_user -d flearn_db -c "SELECT * FROM \"user\" LIMIT 5;"
```

### MongoDB Management  

#### Access via Mongo Express
1. Open http://localhost:8087
2. Login with credentials from `.env` file
3. Browse databases and collections through web interface

#### Direct MongoDB Access
```bash
# Connect via Docker container
docker compose exec mongodb mongosh -u flearn_admin -p your_password --authenticationDatabase admin

# Connect from host machine  
mongosh "mongodb://flearn_admin:your_password@localhost:27017/flearn_mongo_db?authSource=admin"

# Run MongoDB commands
docker compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Database Backups

#### PostgreSQL Backup
```bash
# Create backup
docker compose exec postgres pg_dump -U flearn_user flearn_db > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20250913.sql | docker compose exec -T postgres psql -U flearn_user -d flearn_db
```

#### MongoDB Backup
```bash
# Create backup
docker compose exec mongodb mongodump --uri="mongodb://flearn_admin:password@localhost:27017/flearn_mongo_db?authSource=admin" --out=/tmp/backup

# Restore backup
docker compose exec mongodb mongorestore --uri="mongodb://flearn_admin:password@localhost:27017/flearn_mongo_db?authSource=admin" /tmp/backup/flearn_mongo_db
```

## 📊 Monitoring & Logging

### Service Health Monitoring

#### Built-in Health Checks
```bash
# Backend API health
curl http://localhost:8099/health

# Webhook service health  
curl http://localhost:3001/health

# Frontend accessibility
curl http://localhost:3000
```

#### Docker Health Status
```bash
# Check all services
docker compose ps

# View service resource usage
docker stats

# Check specific service health
docker compose logs flearn-backend --tail=50
```

### Centralized Logging

#### View All Service Logs
```bash
# Follow all logs
docker compose logs -f

# View logs with timestamps
docker compose logs -f --timestamps

# Filter logs by service
docker compose logs -f flearn-backend flearn-frontend
```

#### Deployment Logging
```bash
# View webhook deployment logs
tail -f logs/deployment.log

# View webhook service logs
docker compose logs -f flearn-webhook

# Check deployment history
cat logs/deployment.log | grep "Deployment completed"
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. Port Conflicts
```bash
# Check what's using ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8099

# Kill processes using ports (if needed)
sudo kill -9 $(lsof -t -i:3000)
sudo kill -9 $(lsof -t -i:8099)
```

#### 2. Database Connection Issues
```bash
# Check database container status
docker compose ps postgres mongodb

# View database logs
docker compose logs postgres
docker compose logs mongodb

# Restart database services
docker compose restart postgres mongodb
```

#### 3. Webhook Deployment Failures
```bash
# Check webhook service logs
docker compose logs flearn-webhook

# Test webhook manually
curl -X POST http://localhost:3001/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=test" \
  -d '{"ref":"refs/heads/main"}'

# Restart webhook service
docker compose restart flearn-webhook
```

#### 4. Memory/Resource Issues
```bash
# Check Docker resource usage
docker stats

# Clean up Docker resources
docker system prune -f

# Restart with fresh containers
docker compose down
docker compose up -d --force-recreate
```

### Complete System Reset
```bash
# Nuclear option: reset everything
docker compose down -v
docker system prune -af
docker compose up -d --build
```

## 🏭 Production Deployment

### Production Environment Setup

#### 1. Server Requirements
- **CPU**: 2+ cores (4+ recommended)
- **RAM**: 4GB minimum (8GB+ recommended) 
- **Storage**: 20GB+ SSD storage
- **Network**: Static IP address
- **OS**: Ubuntu 20.04+ or similar Linux distribution

#### 2. Security Configuration
```bash
# Enable firewall
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Frontend
sudo ufw allow 8099  # API
sudo ufw allow 3001  # Webhook

# Install fail2ban for brute force protection
sudo apt install fail2ban
```

#### 3. Domain and SSL Setup
```bash
# Install Nginx for reverse proxy
sudo apt install nginx

# Install Certbot for SSL certificates
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com
```

#### 4. Production Environment Variables
```env
NODE_ENV=production
FRONTEND_PORT=3000
API_PORT=8099

# Use production URLs
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
AUTH0_BASE_URL=https://your-domain.com

# Strong production passwords
POSTGRES_PASSWORD=very_secure_production_password
MONGO_PASSWORD=very_secure_production_mongo_password
```

### CI/CD Pipeline Enhancement

#### GitHub Actions Integration
```yaml
# .github/workflows/production-deploy.yml
name: Production Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/FLEARN
            git pull origin main
            docker compose down
            docker compose up -d --build
```

## 📈 Performance Optimization

### Docker Optimization

#### Multi-stage Builds
```dockerfile
# Optimized Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Resource Limits
```yaml
# docker-compose.yml optimization
services:
  flearn-backend:
    build: ./FLEARN-back
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Production Scaling

#### Load Balancing (Future)
```yaml
# docker-compose.prod.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - flearn-backend
      - flearn-frontend
```

---

This Docker & Deployment guide provides everything needed to deploy FLEARN in both development and production environments with automated deployment capabilities.