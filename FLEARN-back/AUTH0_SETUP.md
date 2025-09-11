# Auth0 Integration Setup Guide

This guide will help you set up Auth0 authentication for the FLEARN backend API.

## Prerequisites

1. Node.js and npm installed
2. PostgreSQL database running
3. Auth0 account (free tier available)

## Auth0 Setup

### 1. Create Auth0 Account and Application

1. Go to [Auth0.com](https://auth0.com) and sign up for an account
2. Create a new application:
   - Go to Applications > Create Application
   - Choose "Single Page Web Applications" for frontend integration
   - Choose "Machine to Machine Applications" for API access

### 2. Configure Auth0 Application

1. In your Auth0 dashboard, go to Applications > [Your App]
2. Configure the following settings:
   - **Allowed Callback URLs**: `http://localhost:3001/callback` (adjust for your frontend URL)
   - **Allowed Logout URLs**: `http://localhost:3001/`
   - **Allowed Web Origins**: `http://localhost:3001`
   - **Allowed Origins (CORS)**: `http://localhost:3001`

### 3. Create Auth0 API

1. Go to APIs > Create API
2. Set the following:
   - **Name**: FLEARN API
   - **Identifier**: `https://flearn-api.com` (this will be your AUTH0_AUDIENCE)
   - **Signing Algorithm**: RS256

### 4. Enable Google Social Connection

1. Go to Authentication > Social
2. Click on Google and configure:
   - Enable the connection
   - Add your Google OAuth credentials (Client ID and Secret)
   - Configure scopes: `openid`, `profile`, `email`

## Environment Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the following variables in your `.env` file:
   ```env
   # Auth0 Configuration
   AUTH0_DOMAIN=your-tenant.auth0.com
   AUTH0_AUDIENCE=https://flearn-api.com
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
   ```

3. Get these values from your Auth0 dashboard:
   - **AUTH0_DOMAIN**: Found in your Auth0 application settings
   - **AUTH0_AUDIENCE**: The identifier you set when creating the API
   - **AUTH0_CLIENT_ID**: Found in your Auth0 application settings
   - **AUTH0_CLIENT_SECRET**: Found in your Auth0 application settings

## Database Setup

1. Make sure PostgreSQL is running
2. Create the database and run the schema:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database and user
   CREATE DATABASE flearn_db;
   CREATE USER flearn_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE flearn_db TO flearn_user;
   
   # Connect to the database
   \c flearn_db
   
   # Run the schema
   \i FLEARN-back/init-scripts/02-schema.sql
   ```

## Installation and Running

1. Install dependencies:
   ```bash
   cd FLEARN-back
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication Required Endpoints

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `POST /api/users/profile` - Create/update user profile
- `GET /api/users/preferences` - Get user preferences
- `POST /api/users/preferences` - Add user preference
- `PATCH /api/users/experience` - Update experience points

### Friends Endpoints
- `GET /api/friends` - Get user's friends
- `POST /api/friends/request` - Send friend request
- `PATCH /api/friends/:friendshipId/status` - Accept/reject friend request
- `DELETE /api/friends/:friendshipId` - Remove friend

### Gardens Endpoints
- `GET /api/gardens` - Get user's gardens
- `POST /api/gardens` - Create new garden with friend
- `PATCH /api/gardens/:gardenId/streak` - Update garden streak
- `PATCH /api/gardens/:gardenId/status` - Update garden status
- `DELETE /api/gardens/:gardenId` - Delete garden

## Frontend Integration

To integrate with your frontend (Next.js), you'll need to:

1. Install Auth0 SDK for your frontend framework
2. Configure Auth0 in your frontend application
3. Include the JWT token in API requests
4. Handle token refresh and logout

Example for Next.js:
```bash
npm install @auth0/nextjs-auth0
```

## Testing

Test the API endpoints using tools like Postman or curl:

```bash
# Get user profile (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:3000/api/users/profile
```

## Security Notes

1. Never commit your `.env` file to version control
2. Use strong, unique secrets for production
3. Enable HTTPS in production
4. Configure proper CORS settings
5. Regularly rotate your Auth0 secrets
6. Monitor Auth0 logs for suspicious activity

## Troubleshooting

### Common Issues

1. **"Invalid token"**: Check that your AUTH0_DOMAIN and AUTH0_AUDIENCE are correct
2. **"User not found"**: Make sure the user has completed profile setup first
3. **CORS errors**: Check your CORS configuration and allowed origins
4. **Database connection errors**: Verify PostgreSQL is running and credentials are correct

### Debugging

Enable debug mode by setting:
```env
NODE_ENV=development
```

This will provide more detailed error messages in the API responses.
