# 🚀 API Setup Guide

This comprehensive guide will walk you through setting up the FLEARN backend API with Auth0 authentication and PostgreSQL database integration.

## 📋 Prerequisites

Ensure you have the following installed before proceeding:

- **[Node.js](https://nodejs.org/)** (v18 or higher) 
- **[PostgreSQL](https://www.postgresql.org/download/)** (v15 or higher)
- **[Git](https://git-scm.com/)** (latest version)
- **Auth0 account** ([free tier available](https://auth0.com))
- **Code editor** (VS Code recommended)

## 🎯 Overview

The FLEARN API provides:
- **User Management**: Profile creation, preferences, experience tracking
- **Social Features**: Friends system with requests and status management  
- **Learning Progress**: Garden-based learning with streak tracking
- **Authentication**: Secure Auth0 JWT integration
- **Database Integration**: PostgreSQL for relational data, MongoDB for documents

## 🔧 Step-by-Step Backend Setup

### Step 1: Install Dependencies

Navigate to the backend directory and install required packages:

```bash
cd FLEARN-back
npm install
```

**Key Dependencies Installed**:
```json
{
  "express": "^4.18.2",
  "express-jwt": "^8.4.1", 
  "jwks-rsa": "^3.0.1",
  "pg": "^8.11.3",
  "mongoose": "^7.5.0",
  "uuid": "^9.0.0",
  "cors": "^2.8.5",
  "helmet": "^7.0.0"
}
```

### Step 2: PostgreSQL Database Setup

#### 2.1 Install PostgreSQL

**Windows**:
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and remember the postgres password
3. Install pgAdmin (usually included)

**macOS**:
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2.2 Create Database and User

**Option A: Using psql command line**
```bash
# Connect as postgres user
sudo -u postgres psql

# Create database
CREATE DATABASE flearn_db;

# Create user with password
CREATE USER flearn_user WITH PASSWORD 'your_secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE flearn_db TO flearn_user;
GRANT USAGE ON SCHEMA public TO flearn_user;
GRANT CREATE ON SCHEMA public TO flearn_user;

# Connect to the database
\c flearn_db

# Exit psql
\q
```

**Option B: Using pgAdmin GUI**
1. Open pgAdmin → Connect to PostgreSQL server
2. Right-click "Databases" → Create → Database
   - Name: `flearn_db`
   - Owner: `postgres`
3. Right-click "Login/Group Roles" → Create → Login/Group Role
   - General tab: Name `flearn_user`
   - Definition tab: Password `your_secure_password_here`
   - Privileges tab: Check "Can login?" and "Create databases?"

#### 2.3 Initialize Database Schema

Run the schema initialization script:
```bash
# From project root directory
psql -h localhost -U flearn_user -d flearn_db -f FLEARN-back/init-scripts/02-schema.sql
```

**Schema Overview**:
- `user`: User profiles and experience points
- `prefered`: User learning preferences  
- `garden`: Learning progress tracking
- `friend`: Social connections and requests

### Step 3: Auth0 Configuration

#### 3.1 Create Auth0 Account
1. Visit [auth0.com](https://auth0.com) and sign up
2. Create a new tenant (e.g., "flearn-dev")
3. Complete the initial setup wizard

#### 3.2 Create Auth0 Application
1. Go to **Applications** → **Create Application**
2. **Name**: "FLEARN Frontend"
3. **Application Type**: "Single Page Web Applications"
4. Click **Create**

#### 3.3 Configure Application Settings

In your Auth0 application **Settings** tab:

```bash
# Application URIs (adjust ports as needed)
Allowed Callback URLs: 
http://localhost:3000/callback,http://localhost:3001/callback

Allowed Logout URLs:
http://localhost:3000,http://localhost:3001

Allowed Web Origins:
http://localhost:3000,http://localhost:3001

Allowed Origins (CORS):
http://localhost:3000,http://localhost:3001
```

**Save Changes** at the bottom of the page.

#### 3.4 Create Auth0 API

1. Go to **APIs** → **Create API**
2. **Name**: "FLEARN API"  
3. **Identifier**: `https://flearn-api.com` *(this becomes your AUTH0_AUDIENCE)*
4. **Signing Algorithm**: RS256
5. Click **Create**

#### 3.5 Enable Social Login (Optional)

For Google OAuth integration:
1. Go to **Authentication** → **Social**
2. Click the **Google** provider
3. Toggle **Enable** 
4. Add your Google OAuth credentials (can be configured later)

### Step 4: Environment Configuration

#### 4.1 Create Environment File

Copy the example environment file:
```bash
cd FLEARN-back
cp .env.example .env
```

#### 4.2 Configure Environment Variables

Edit the `.env` file with your specific values:

> 🔒 **SECURITY FIRST**: Never use the example values below in production! Replace ALL placeholders with secure, unique values.

```env
# ===========================================
# Server Configuration
# ===========================================
NODE_ENV=development
PORT=8099

# ===========================================
# PostgreSQL Database Configuration
# ===========================================
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=flearn_db
POSTGRES_USER=flearn_user
POSTGRES_PASSWORD=generate_strong_password_here

# ===========================================
# Auth0 Configuration - REPLACE WITH YOUR VALUES
# ===========================================
AUTH0_DOMAIN=YOUR-TENANT.auth0.com
AUTH0_AUDIENCE=https://flearn-api.com
AUTH0_CLIENT_ID=your_client_id_from_auth0_dashboard
AUTH0_CLIENT_SECRET=your_client_secret_from_auth0_dashboard

# ===========================================
# CORS Configuration
# ===========================================
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# ===========================================
# MongoDB Configuration (Optional)
# ===========================================
MONGO_URL=mongodb://localhost:27017/flearn-db
# Or for Docker: mongodb://flearn_admin:password@localhost:27017/flearn_mongo_db?authSource=admin

# ===========================================
# Development Settings
# ===========================================
DEBUG=flearn:*
LOG_LEVEL=debug
```

#### 4.3 Retrieve Auth0 Values

From your Auth0 dashboard:

**Application Settings**:
- `AUTH0_DOMAIN`: Found in Application → Settings → Basic Information
- `AUTH0_CLIENT_ID`: Found in Application → Settings → Basic Information  
- `AUTH0_CLIENT_SECRET`: Found in Application → Settings → Basic Information

**API Settings**:
- `AUTH0_AUDIENCE`: Found in APIs → FLEARN API → Settings → Identifier

### Step 5: Start and Test the API Server

#### 5.1 Start the Development Server

```bash
cd FLEARN-back
npm run dev
```

**Expected startup output**:
```
🚀 FLEARN Backend Server Started!
📍 Server URL: http://localhost:8099
🌍 Environment: development
🔐 Auth0 Domain: your-tenant.auth0.com
🎯 Auth0 Audience: https://flearn-api.com
✅ PostgreSQL connected successfully
✅ Server is ready to accept connections
```

#### 5.2 Health Check Test

Test the server is running:
```bash
curl http://localhost:8099/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-09-13T13:00:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

## 🧪 API Testing

### Mock Authentication (Development Mode)

When Auth0 is not fully configured, the API uses mock authentication for development:

#### Test User Profile Endpoints
```bash
# Get user profile (mock auth)
curl -X GET http://localhost:8099/api/users/profile

# Create user profile  
curl -X POST http://localhost:8099/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "edu_level": "High School",
    "birthdate": "1995-01-01"
  }'

# Update experience points
curl -X PATCH http://localhost:8099/api/users/experience \
  -H "Content-Type: application/json" \
  -d '{
    "math_exp": 150,
    "daily_exp": 50
  }'
```

#### Test Friends System
```bash
# Get friends list
curl -X GET http://localhost:8099/api/friends

# Send friend request
curl -X POST http://localhost:8099/api/friends/request \
  -H "Content-Type: application/json" \
  -d '{
    "friend_email": "friend@example.com"
  }'
```

#### Test Gardens System  
```bash
# Get user gardens
curl -X GET http://localhost:8099/api/gardens

# Create new garden
curl -X POST http://localhost:8099/api/gardens \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Math Mastery Garden",
    "subject": "Mathematics"
  }'
```

### Real Auth0 Token Testing

Once Auth0 is configured, obtain a JWT token for testing:

#### Option A: Use Auth0 Management API
```bash
# Get machine-to-machine token for testing
curl -X POST https://YOUR_DOMAIN.auth0.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET", 
    "audience": "https://flearn-api.com",
    "grant_type": "client_credentials"
  }'
```

#### Option B: Use Frontend Login Flow
1. Start the frontend application
2. Complete login flow 
3. Extract JWT token from browser developer tools
4. Use token in API requests:

```bash
curl -X GET http://localhost:8099/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 📚 Available API Endpoints

### User Management (`/api/users`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/profile` | ✅ | Get user profile information |
| `POST` | `/profile` | ✅ | Create or update user profile |
| `GET` | `/preferences` | ✅ | Get user learning preferences |
| `POST` | `/preferences` | ✅ | Add learning preference |  
| `PATCH` | `/experience` | ✅ | Update experience points |

### Friends System (`/api/friends`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | ✅ | Get friends list and requests |
| `POST` | `/request` | ✅ | Send friend request |
| `PATCH` | `/:id/status` | ✅ | Accept/reject friend request |
| `DELETE` | `/:id` | ✅ | Remove friend or cancel request |

### Gardens System (`/api/gardens`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | ✅ | Get user's learning gardens |
| `POST` | `/` | ✅ | Create new learning garden |
| `PATCH` | `/:id/streak` | ✅ | Update garden streak |
| `PATCH` | `/:id/status` | ✅ | Update garden status |
| `DELETE` | `/:id` | ✅ | Delete garden |

### Health & Utility (`/`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/health` | ❌ | Server health check |
| `GET` | `/` | ❌ | API welcome message |

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. PostgreSQL Connection Failed
```
❌ Error: PostgreSQL connection failed
   Could not connect to database
```

**Solutions**:
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check connection settings in `.env` file
- Test manual connection: `psql -h localhost -U flearn_user -d flearn_db`
- Ensure user has correct permissions

#### 2. Auth0 JWT Verification Error  
```
❌ UnauthorizedError: Invalid token
   JWT verification failed
```

**Solutions**:
- Verify `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` in `.env`
- Check token format: must be `Bearer <token>` 
- Ensure Auth0 API is configured with RS256 algorithm
- Verify token hasn't expired

#### 3. Database Schema Missing
```
❌ Error: relation "user" does not exist
   Table not found
```

**Solutions**:
- Run schema initialization: `psql -U flearn_user -d flearn_db -f init-scripts/02-schema.sql`
- Check if connected to correct database
- Verify user has CREATE permissions

#### 4. CORS Issues
```
❌ Access to fetch at 'http://localhost:8099/api/users/profile' 
   from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions**:
- Add frontend URL to `ALLOWED_ORIGINS` in `.env`
- Restart backend server after `.env` changes
- Check browser developer console for detailed CORS errors

### Debugging Tips

#### Enable Debug Mode
```env
NODE_ENV=development
DEBUG=flearn:*
LOG_LEVEL=debug  
```

#### Check Server Logs
Look for these startup messages:
```
✅ PostgreSQL connected successfully
✅ Auth0 configuration loaded  
✅ Server listening on port 8099
```

#### Test Database Connection Manually
```bash
# Test PostgreSQL connection
psql -h localhost -U flearn_user -d flearn_db -c "SELECT version();"

# List tables to verify schema
psql -h localhost -U flearn_user -d flearn_db -c "\dt"
```

#### Validate Auth0 Configuration
```bash
# Check Auth0 well-known configuration
curl https://YOUR_DOMAIN.auth0.com/.well-known/openid_configuration

# Verify JWKS endpoint
curl https://YOUR_DOMAIN.auth0.com/.well-known/jwks.json
```

## 🔒 Security Best Practices

### Environment Variables & Secrets Management
- 🔒 **NEVER commit** `.env` files to version control
- 🔒 **Use strong, unique passwords** (minimum 16 characters) for all services
- 🔒 **Rotate Auth0 secrets** regularly (at least every 90 days)
- 🔒 **Use different secrets** for development, staging, and production
- 🔒 **Add `.env*` to `.gitignore`** immediately
- 🔒 **Use environment variables** in production, never hardcode secrets
- 🔒 **Enable 2FA** on your Auth0 account for additional security

### Database Security  
- ✅ Use parameterized queries (already implemented)
- ✅ Limit database user permissions
- ✅ Enable PostgreSQL connection encryption in production
- ✅ Regular database backups

### API Security
- ✅ Always validate input data
- ✅ Use HTTPS in production
- ✅ Implement rate limiting (planned)
- ✅ Monitor Auth0 logs for suspicious activity

## 🎯 Next Steps

Once your API is running successfully:

1. **Frontend Integration**: Set up the Next.js frontend with Auth0
2. **Database Population**: Add test data for development  
3. **API Documentation**: Generate API docs with Swagger (planned)
4. **Testing**: Write comprehensive API tests
5. **Production Deployment**: Configure production environment

## 💡 Development Tips

### Hot Reloading
Use `npm run dev` for automatic server restart on file changes:
```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  }
}
```

### Database GUI Tools
- **pgAdmin**: Web-based PostgreSQL administration
- **VS Code Extensions**: PostgreSQL extension for inline queries
- **TablePlus**: Native database client (paid)

### API Testing Tools
- **Postman**: Full-featured API testing suite
- **Insomnia**: Lightweight REST client  
- **curl**: Command-line testing (as shown above)
- **VS Code REST Client**: HTTP requests in editor

### Monitoring & Logging
```javascript
// Custom logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

---

🎉 **Congratulations!** Your FLEARN API should now be running successfully. 

For frontend integration, proceed to the [Authentication & Auth0](Authentication-Auth0) guide.