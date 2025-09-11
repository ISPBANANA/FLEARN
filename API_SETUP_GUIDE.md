# 🚀 FLEARN API Setup Guide

This guide will walk you through setting up the FLEARN backend API with Auth0 authentication and PostgreSQL database.

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/download/) (v12 or higher)
- [Git](https://git-scm.com/)
- Auth0 account (free tier available)

## 🔧 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd FLEARN-back
npm install
```

### Step 2: Database Setup (PostgreSQL)

#### 2.1 Install PostgreSQL
1. Download PostgreSQL from https://www.postgresql.org/download/
2. During installation, remember your postgres user password
3. Install pgAdmin (usually included) for database management

#### 2.2 Create Database and User
Open pgAdmin or use command line:

```sql
-- Connect as postgres user
psql -U postgres

-- Create database
CREATE DATABASE flearn_db;

-- Create user
CREATE USER flearn_user WITH PASSWORD 'your_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE flearn_db TO flearn_user;
GRANT USAGE ON SCHEMA public TO flearn_user;
GRANT CREATE ON SCHEMA public TO flearn_user;

-- Connect to the database
\c flearn_db

-- Run the schema
\i D:/UNI/ISPBANANA/FLEARN/FLEARN-back/init-scripts/02-schema.sql
```

Or using Windows GUI (pgAdmin):
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `flearn_db`
4. Right-click "Login/Group Roles" → Create → Login/Group Role
5. Name: `flearn_user`, Password: `your_password_here`
6. In Privileges tab, check "Can login?" and "Create databases?"

### Step 3: Auth0 Setup

#### 3.1 Create Auth0 Account
1. Go to [auth0.com](https://auth0.com)
2. Sign up for free account
3. Create a new tenant (e.g., "flearn-dev")

#### 3.2 Create Auth0 Application
1. Go to Applications → Create Application
2. Name: "FLEARN Frontend"
3. Type: "Single Page Web Applications"
4. Click Create

#### 3.3 Configure Application Settings
In your Auth0 application settings:
- **Allowed Callback URLs**: `http://localhost:3001/callback`
- **Allowed Logout URLs**: `http://localhost:3001`
- **Allowed Web Origins**: `http://localhost:3001`
- **Allowed Origins (CORS)**: `http://localhost:3001`

#### 3.4 Create Auth0 API
1. Go to APIs → Create API
2. Name: "FLEARN API"
3. Identifier: `https://flearn-api.com` (this becomes your AUTH0_AUDIENCE)
4. Signing Algorithm: RS256

#### 3.5 Enable Google Social Login
1. Go to Authentication → Social
2. Click Google
3. Enable the connection
4. Add your Google OAuth credentials (optional for now)

### Step 4: Environment Configuration

#### 4.1 Update .env file
Edit `FLEARN-back/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=flearn_db
POSTGRES_USER=flearn_user
POSTGRES_PASSWORD=your_actual_password_here

# Auth0 Configuration - Replace with your actual values
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://flearn-api.com
AUTH0_CLIENT_ID=your_client_id_from_auth0
AUTH0_CLIENT_SECRET=your_client_secret_from_auth0

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173

# MongoDB (Optional - can be disabled)
MONGO_URL=mongodb://localhost:27017/flearn-db
```

#### 4.2 Get Auth0 Values
From your Auth0 dashboard:
- **AUTH0_DOMAIN**: Found in Application Settings
- **AUTH0_CLIENT_ID**: Found in Application Settings  
- **AUTH0_CLIENT_SECRET**: Found in Application Settings
- **AUTH0_AUDIENCE**: The identifier from your API settings

### Step 5: Start the Server

```bash
cd FLEARN-back
npm start
```

You should see:
```
🚀 FLEARN Backend Server Started!
📍 Server URL: http://localhost:3000
🌍 Environment: development
🔐 Auth0 Domain: your-actual-domain.auth0.com
🎯 Auth0 Audience: https://flearn-api.com
✅ PostgreSQL connected successfully
```

## 🧪 Testing the API

### Test Health Endpoint
```bash
curl http://localhost:3000/health
```

### Test with Mock Authentication (Development Mode)
If Auth0 is not configured, the API uses mock authentication:

```bash
# Get user profile (works with mock auth)
curl -X GET http://localhost:3000/api/users/profile

# Create user profile
curl -X POST http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "edu_level": "High School"
  }'
```

### Test with Real Auth0 Token
Once Auth0 is configured, you'll need a JWT token:

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 📚 Available API Endpoints

### User Management
- `GET /api/users/profile` - Get user profile
- `POST /api/users/profile` - Create/update profile
- `GET /api/users/preferences` - Get preferences
- `POST /api/users/preferences` - Add preference
- `PATCH /api/users/experience` - Update experience

### Friends System
- `GET /api/friends` - Get friends list
- `POST /api/friends/request` - Send friend request
- `PATCH /api/friends/:id/status` - Accept/reject request
- `DELETE /api/friends/:id` - Remove friend

### Garden System
- `GET /api/gardens` - Get gardens
- `POST /api/gardens` - Create garden
- `PATCH /api/gardens/:id/streak` - Update streak
- `PATCH /api/gardens/:id/status` - Update status
- `DELETE /api/gardens/:id` - Delete garden

## 🐛 Troubleshooting

### Common Issues

#### 1. PostgreSQL Connection Error
```
❌ PostgreSQL connection failed
```
**Solutions:**
- Check if PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database `flearn_db` exists
- Check firewall/port settings

#### 2. Auth0 Token Error
```
UnauthorizedError: Invalid token
```
**Solutions:**
- Verify AUTH0_DOMAIN and AUTH0_AUDIENCE in `.env`
- Check token format: `Bearer <token>`
- Ensure Auth0 API is configured correctly

#### 3. Database Schema Error
```
relation "user" does not exist
```
**Solutions:**
- Run the schema file: `\i init-scripts/02-schema.sql`
- Check database permissions
- Verify you're connected to the right database

### Debugging Tips

1. **Enable Debug Mode:**
   ```env
   NODE_ENV=development
   ```

2. **Check Server Logs:**
   - Look for database connection messages
   - Check for Auth0 configuration warnings

3. **Test Database Connection:**
   ```bash
   psql -h localhost -U flearn_user -d flearn_db
   ```

4. **Verify Auth0 Configuration:**
   - Check your Auth0 dashboard settings
   - Verify CORS settings match your frontend URL

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use strong passwords for database
- Enable HTTPS in production
- Regularly rotate Auth0 secrets
- Monitor Auth0 logs for suspicious activity

## 🎯 Next Steps

1. Set up the frontend Auth0 integration
2. Configure production environment
3. Set up database backups
4. Implement API rate limiting
5. Add comprehensive logging

## 💡 Development Tips

- Use `npm run dev` for auto-restart during development
- Check `AUTH0_SETUP.md` for detailed Auth0 configuration
- Use pgAdmin to view/manage database
- Monitor server logs for issues
- Test API endpoints with Postman or curl

---

Need help? Check the troubleshooting section or create an issue in the repository!
