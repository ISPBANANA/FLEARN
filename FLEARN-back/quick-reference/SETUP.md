# Setup & Configuration Quick Reference

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### Start Everything
```bash
# Clone repository
git clone <repository-url>
cd FLEARN

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Stop Everything
```bash
docker-compose down

# Stop and remove volumes (reset databases)
docker-compose down -v
```

---

## 📁 Project Structure

```
FLEARN/
├── FLEARN-back/          # Backend API (Node.js/Express)
├── FLEARN-front/         # Frontend (Next.js)
├── webhook-service/      # Auto-deployment service
├── logs/                 # Application logs
├── docker-compose.yml    # Docker orchestration
├── .env                  # Environment variables
└── scripts/              # Utility scripts
```

---

## 🔧 Environment Variables

### Required Variables (.env file)

```env
# Server Configuration
PORT=8099                      # Backend API port
NODE_ENV=development           # development | production
FRONT_PORT=3000               # Frontend port

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# PostgreSQL
POSTGRES_DB=flearn_db
POSTGRES_USER=flearn_user
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost        # Use 'postgres' in Docker
POSTGRES_PORT=5432

# MongoDB
MONGO_URL=mongodb://admin:password@localhost:27017/flearn_db?authSource=admin
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=flearn_db

# Webhook Service (Optional)
WEBHOOK_PORT=3001
WEBHOOK_SECRET=your-webhook-secret

# Frontend (CORS)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8099
```

### Docker vs Local Development

**Docker (docker-compose):**
```env
POSTGRES_HOST=postgres
MONGO_URL=mongodb://admin:password@mongodb:27017/flearn_db?authSource=admin
```

**Local Development:**
```env
POSTGRES_HOST=localhost
MONGO_URL=mongodb://localhost:27017/flearn-db
```

---

## 🐳 Docker Setup

### Services

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| flearn-backend | flearn_backend | 8099 | Backend API |
| flearn-frontend | flearn_frontend | 3000 | Next.js frontend |
| postgres | flearn_postgres | 5432 | PostgreSQL database |
| mongodb | flearn_mongodb | 27017 | MongoDB database |
| webhook-service | flearn_webhook | 3001 | Auto-deployment |

### Docker Compose Commands

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d flearn-backend

# View logs
docker-compose logs -f flearn-backend

# Restart service
docker-compose restart flearn-backend

# Stop all services
docker-compose down

# Rebuild service
docker-compose up -d --build flearn-backend

# Reset everything (including data)
docker-compose down -v
docker-compose up -d --build
```

### Docker Compose Configuration

```yaml
services:
  flearn-backend:
    build:
      context: ./FLEARN-back
      dockerfile: Dockerfile.dev
    container_name: flearn_backend
    restart: unless-stopped
    env_file:
      - .env
    ports:
      - "${PORT}:8099"
    depends_on:
      - postgres
      - mongodb
    networks:
      - flearn_network
```

---

## 📦 Backend Setup

### Installation

**Using Docker (Recommended):**
```bash
docker-compose up -d flearn-backend
```

**Local Development:**
```bash
cd FLEARN-back
npm install
npm run dev
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:reset": "docker-compose down -v && docker-compose up -d"
  }
}
```

### Dependencies

**Core:**
- `express` - Web framework
- `pg` - PostgreSQL client
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables
- `cors` - Cross-origin support

**Authentication:**
- `google-auth-library` - Google OAuth

**Development:**
- `nodemon` - Auto-restart on changes
- `jest` - Testing framework
- `supertest` - API testing

---

## 🗄️ Database Setup

### PostgreSQL Initialization

**Docker (automatic):**
```bash
# Init script runs automatically
./FLEARN-back/init-scripts/01-init.sql
```

**Manual:**
```sql
-- Create database
CREATE DATABASE flearn_db;

-- Create user
CREATE USER flearn_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE flearn_db TO flearn_user;

-- Run init script
\i FLEARN-back/init-scripts/01-init.sql
```

### MongoDB Initialization

**Docker (automatic):**
```bash
# Init script runs automatically
./FLEARN-back/mongo-init/01-init.js
```

**Manual:**
```javascript
// Connect to MongoDB
use flearn_db

// Create collections
db.createCollection('question_contents')

// Create indexes
db.question_contents.createIndex({ "question_type": 1 })
```

---

## 🚦 Starting the Backend

### Development Mode

**With Docker:**
```bash
docker-compose up -d flearn-backend
docker-compose logs -f flearn-backend
```

**Without Docker:**
```bash
cd FLEARN-back
npm run dev
```

### Production Mode

```bash
cd FLEARN-back
npm start
```

### Verification

```bash
# Check health
curl http://localhost:8099/health

# Expected response:
{
  "status": "OK",
  "uptime": 123.456,
  "timestamp": "2025-10-27T..."
}
```

---

## 🎨 Frontend Setup

### Installation

**Using Docker:**
```bash
docker-compose up -d flearn-frontend
```

**Local Development:**
```bash
cd FLEARN-front
npm install
npm run dev
```

### Environment Variables

Create `FLEARN-front/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8099
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🔒 Google OAuth Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "FLEARN"
3. Enable Google+ API

### 2. Create OAuth Credentials
1. Navigate to: APIs & Services → Credentials
2. Click: Create Credentials → OAuth 2.0 Client ID
3. Application type: Web application
4. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:8099`
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`

### 3. Configure Backend
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

### 4. Configure Frontend
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

---

## 🔍 Debugging

### View Backend Logs
```bash
# Docker
docker-compose logs -f flearn-backend

# Local
# Logs appear in console
```

### View Database Logs
```bash
# PostgreSQL
docker-compose logs -f postgres

# MongoDB
docker-compose logs -f mongodb
```

### Connect to Databases

**PostgreSQL:**
```bash
# Docker
docker exec -it flearn_postgres psql -U flearn_user -d flearn_db

# Local
psql -U flearn_user -d flearn_db -h localhost
```

**MongoDB:**
```bash
# Docker
docker exec -it flearn_mongodb mongosh -u admin -p password --authenticationDatabase admin

# Local
mongosh mongodb://localhost:27017/flearn_db
```

---

## 🧪 Testing

### Run Tests
```bash
cd FLEARN-back
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### Manual API Testing
```bash
# Using PowerShell
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:8099/api/users/profile" -Headers $headers

# Using curl
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8099/api/users/profile
```

---

## 🔄 Common Issues

### Port Already in Use
```bash
# Find process using port 8099
netstat -ano | findstr :8099

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Database Connection Failed
```bash
# Check if containers are running
docker-compose ps

# Restart database containers
docker-compose restart postgres mongodb
```

### CORS Errors
```env
# Add frontend URL to ALLOWED_ORIGINS
ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

### Docker Build Issues
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

---

## 📝 NPM Scripts Reference

### Backend (FLEARN-back)
```bash
npm start              # Start production server
npm run dev            # Start development server with auto-reload
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage
npm run docker:up      # Start Docker containers
npm run docker:down    # Stop Docker containers
npm run docker:reset   # Reset Docker containers and volumes
```

---

## 🌐 Network Configuration

### Default Ports
- Backend API: `8099`
- Frontend: `3000`
- PostgreSQL: `5432`
- MongoDB: `27017`
- Webhook: `3001`

### Change Ports
Edit `.env`:
```env
PORT=9000              # Backend
FRONT_PORT=4000        # Frontend
POSTGRES_PORT=5433     # PostgreSQL
```

---

## 📚 Additional Resources

- API Documentation: `API_ENDPOINTS.md`
- Database Guide: `DATABASE.md`
- Authentication Guide: `AUTHENTICATION.md`
- Docker Guide: `../wiki-content/Docker-Deployment.md`
- Architecture Overview: `../wiki-content/Architecture.md`
