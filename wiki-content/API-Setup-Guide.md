# 🚀 API Setup Guide

This comprehensive guide will walk you through setting up the FLEARN backend API with Google OAuth authentication and PostgreSQL/MongoDB database integration.

## 📋 Prerequisites

Ensure you have the following installed before proceeding:

- **[Node.js](https://nodejs.org/)** (v18 or higher) 
- **[PostgreSQL](https://www.postgresql.org/download/)** (v15 or higher)
- **[MongoDB](https://www.mongodb.com/try/download/community)** (v7.0 or higher)
- **[Git](https://git-scm.com/)** (latest version)
- **Google Cloud account** ([free tier available](https://console.cloud.google.com))
- **Code editor** (VS Code recommended)

## 🎯 Overview

The FLEARN API provides:
- **User Management**: Profile creation, experience tracking, streaks, and rankings
- **Social Features**: Friends system with requests and status management  
- **Learning Progress**: Garden-based learning with streak tracking
- **Question Management**: Multi-subject question bank with topics
- **Backlog System**: Save questions for later review
- **Authentication**: Secure Google OAuth integration via NextAuth
- **Database Integration**: PostgreSQL for relational data, MongoDB for flexible content
- **Automatic Updates**: Streak reset, rank calculation, and daily exp reset

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
  "google-auth-library": "^9.0.0",
  "pg": "^8.11.3",
  "pg-pool": "^3.6.1",
  "mongoose": "^7.0.3",
  "uuid": "^9.0.1",
  "cors": "^2.8.5",
  "dotenv": "^17.2.1",
  "katex": "^0.16.25"
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
- `user`: User profiles, experience points, streaks, and rankings
- `garden`: Learning progress tracking with subject-specific gardens
- `friend`: Social connections and friend requests
- `question`: Multi-subject question bank
- `topic`: Question organization by topics
- MongoDB `backlog` collection: Saved questions for later

### Step 3: Google OAuth Configuration

#### 3.1 Access Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Create a new project or select an existing one

#### 3.2 Enable Google+ API (if needed)
1. Go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable** if not already enabled

#### 3.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the OAuth consent screen first:
   - User Type: **External** (for testing) or **Internal** (for organization)
   - App name: "FLEARN"
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through scopes and test users

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "FLEARN Web Client"
   
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:8099
   ```

6. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

7. Click **CREATE**
8. **Copy your Client ID and Client Secret** - you'll need these!

#### 3.4 Configure NextAuth in Frontend
The frontend uses NextAuth for Google OAuth integration. Configuration is in `.env.local` (covered in frontend setup).

#### 3.5 Test OAuth Configuration
Once configured, users will see a "Sign in with Google" button that:
1. Redirects to Google's secure login page
2. Requests permission to access basic profile info (name, email, picture)
3. Returns to your app with an ID token
4. Creates/updates user profile in database

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
# Frontend Configuration
# ===========================================
FRONT_PORT=3000

# ===========================================
# PostgreSQL Database Configuration
# ===========================================
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=flearn_test
POSTGRES_USER=flearn_user
POSTGRES_PASSWORD=generate_strong_password_here

# ===========================================
# MongoDB Configuration
# ===========================================
MONGO_URL=mongodb://localhost:27017/flearn-db
# For Docker: mongodb://admin:your_password@localhost:27017/flearn_db?authSource=admin
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_mongo_password_here
MONGO_INITDB_DATABASE=flearn_db
MONGO_PORT=27017

# ===========================================
# Google OAuth Configuration (NextAuth)
# ===========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_strong_random_secret_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# ===========================================
# CORS Configuration
# ===========================================
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8099,http://localhost:3001

# ===========================================
# API Configuration
# ===========================================
NEXT_PUBLIC_API_BASE_URL=http://localhost:8099
API_VERSION=v1

# ===========================================
# Webhook Configuration (Optional)
# ===========================================
WEBHOOK_PORT=3001
WEBHOOK_SECRET=your_github_webhook_secret_here

# ===========================================
# Database Management (Optional - for Docker)
# ===========================================
PGADMIN_DEFAULT_EMAIL=admin@flearn.com
PGADMIN_DEFAULT_PASSWORD=your_pgadmin_password_here
PGADMIN_PORT=8088

MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=your_mongo_express_password_here
MONGO_EXPRESS_PORT=8087

# ===========================================
# Development Settings
# ===========================================
LOG_LEVEL=debug
```

#### 4.3 Retrieve Google OAuth Values

From your Google Cloud Console:

**OAuth 2.0 Client IDs**:
1. Go to **APIs & Services** → **Credentials**
2. Find your "FLEARN Web Client" OAuth 2.0 Client ID
3. Click the client name to view details
4. Copy:
   - `GOOGLE_CLIENT_ID`: Your client ID (ends with .apps.googleusercontent.com)
   - `GOOGLE_CLIENT_SECRET`: Your client secret

**NextAuth Secret**:
Generate a secure random string (minimum 32 characters):
```bash
# On Linux/Mac:
openssl rand -base64 32

# Or use any secure password generator
```

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
✅ PostgreSQL connected successfully
✅ MongoDB connected successfully
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
  "timestamp": "2025-11-22T13:00:00.000Z",
  "environment": "development",
  "database": "connected"
}
```

## 🧪 API Testing

### Development Testing (Without Full OAuth)

For quick development testing, you can test endpoints directly:

#### Test User Profile Endpoints
```bash
# Get user profile
curl -X GET http://localhost:8099/api/users/profile

# Create user profile  
curl -X POST http://localhost:8099/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
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

# Accept friend request
curl -X PATCH http://localhost:8099/api/friends/123/accept
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

#### Test Questions
```bash
# Get random questions
curl -X GET http://localhost:8099/api/questions/random?subject=math&count=5

# Get questions by topic
curl -X GET http://localhost:8099/api/questions/topic/123
```

### Real Google OAuth Token Testing

Once Google OAuth is fully configured with the frontend:

#### Option A: Use Frontend Login Flow
1. Start the frontend application (`npm run dev` in FLEARN-front)
2. Complete Google login flow 
3. Extract token from browser developer tools (Application → Cookies → next-auth.session-token)
4. Backend automatically validates Google ID tokens from NextAuth

#### Option B: Test with Postman/Insomnia
1. Complete login via frontend
2. Get the session cookie
3. Make API requests with the cookie included

## 📚 Available API Endpoints

### User Management (`/api/users`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/profile` | ✅ | Get user profile (auto-updates streak, rank, daily exp) |
| `GET` | `/profilebyid` | ✅ | Get user by ID with auto-updates |
| `POST` | `/profile` | ✅ | Create or update user profile |
| `PATCH` | `/experience` | ✅ | Update experience points |
| `PATCH` | `/streak` | ✅ | Update user streak manually |
| `GET` | `/search` | ✅ | Search users by name or email |
| `GET` | `/leaderboard` | ✅ | Get user rankings |

### Friends System (`/api/friends`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | ✅ | Get friends list and pending requests |
| `POST` | `/request` | ✅ | Send friend request |
| `PATCH` | `/:id/accept` | ✅ | Accept friend request |
| `PATCH` | `/:id/reject` | ✅ | Reject friend request |
| `DELETE` | `/:id` | ✅ | Remove friend or cancel request |

### Gardens System (`/api/gardens`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | ✅ | Get user's learning gardens |
| `GET` | `/user/:userId` | ✅ | Get gardens for specific user |
| `POST` | `/` | ✅ | Create new learning garden |
| `PATCH` | `/:id/streak` | ✅ | Update garden streak |
| `PATCH` | `/:id/status` | ✅ | Update garden status |
| `DELETE` | `/:id` | ✅ | Delete garden |

### Questions (`/api/questions`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | ✅ | Get all questions |
| `GET` | `/:id` | ✅ | Get specific question |
| `GET` | `/random` | ✅ | Get random questions (with filters) |
| `GET` | `/topic/:topicId` | ✅ | Get questions by topic |
| `POST` | `/` | ✅ | Create new question (admin) |
| `PUT` | `/:id` | ✅ | Update question (admin) |
| `DELETE` | `/:id` | ✅ | Delete question (admin) |

### Topics (`/api/topics`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | ✅ | Get all topics |
| `GET` | `/:id` | ✅ | Get specific topic |
| `POST` | `/` | ✅ | Create new topic (admin) |
| `PUT` | `/:id` | ✅ | Update topic (admin) |
| `DELETE` | `/:id` | ✅ | Delete topic (admin) |

### Backlog (`/api/backlog`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/` | ✅ | Get user's backlog |
| `POST` | `/` | ✅ | Add question to backlog |
| `DELETE` | `/:id` | ✅ | Remove from backlog |

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

#### 2. Google OAuth Verification Error  
```
❌ Error: Invalid token
   Google OAuth verification failed
```

**Solutions**:
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Check authorized redirect URIs in Google Cloud Console
- Ensure redirect URI matches exactly: `http://localhost:3000/api/auth/callback/google`
- Verify OAuth consent screen is configured
- Check that token hasn't expired

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
- Verify CORS middleware configuration

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

#### Validate Google OAuth Configuration
```bash
# Test Google OAuth endpoint
curl https://accounts.google.com/.well-known/openid-configuration

# Verify your OAuth client (requires authenticated request)
# Use Google Cloud Console to verify client configuration
```

## 🔒 Security Best Practices

### Environment Variables & Secrets Management
- 🔒 **NEVER commit** `.env` files to version control
- 🔒 **Use strong, unique passwords** (minimum 16 characters) for all services
- 🔒 **Rotate Google OAuth secrets** regularly (at least every 90 days)
- 🔒 **Use different secrets** for development, staging, and production
- 🔒 **Add `.env*` to `.gitignore`** immediately
- 🔒 **Use environment variables** in production, never hardcode secrets
- 🔒 **Enable 2FA** on your Google account for additional security
- 🔒 **Restrict OAuth consent screen** to specific test users during development

### Database Security  
- ✅ Use parameterized queries (already implemented)
- ✅ Limit database user permissions
- ✅ Enable PostgreSQL connection encryption in production
- ✅ Regular database backups

### API Security
- ✅ Always validate input data
- ✅ Use HTTPS in production
- ✅ Implement rate limiting (planned)
- ✅ Monitor Google OAuth logs for suspicious activity
- ✅ Verify tokens server-side always
- ✅ Use secure session cookies (httpOnly, secure, sameSite)

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

For frontend integration, proceed to the [Authentication Guide](Authentication-Auth0) guide for detailed Google OAuth setup with NextAuth.

