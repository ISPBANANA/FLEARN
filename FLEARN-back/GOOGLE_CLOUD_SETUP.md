# Google Cloud Authentication Setup Guide

This guide will help you set up Google Cloud authentication for the FLEARN backend API.

## Prerequisites

1. Node.js and npm installed
2. PostgreSQL database running
3. Google Cloud Console account

## Google Cloud Setup

### 1. Create Google Cloud Project and OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity APIs:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Identity and Access Management (IAM) API"
   - Click "Enable"

### 2. Create OAuth 2.0 Client ID

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Configure the following settings:
   - **Name**: FLEARN Application
   - **Authorized JavaScript origins**: 
     - `http://localhost:3001` (for development)
     - Your production domain
   - **Authorized redirect URIs**: 
     - `http://localhost:3001/api/auth/callback` (for development)
     - Your production callback URL

### 3. Get Your Client ID

1. After creating the OAuth client, copy the **Client ID**
2. You'll use this in your environment variables

## Backend Configuration

### 1. Environment Variables

Create a `.env` file in your `FLEARN-back` directory:

```env
# Google Cloud Authentication
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/flearn

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Important Environment Variables:**
- **GOOGLE_CLIENT_ID**: Your Google OAuth 2.0 client ID from the Google Cloud Console

### 2. Install Dependencies

```bash
cd FLEARN-back
npm install
```

### 3. Database Setup

1. Make sure PostgreSQL is running
2. Create the database:
   ```sql
   CREATE DATABASE flearn;
   ```

3. Run the schema initialization:
   ```bash
   # If using Docker
   npm run docker:up
   
   # Or manually run the SQL scripts in init-scripts/
   ```

4. If migrating from Auth0, run the migration script:
   ```sql
   -- Run init-scripts/03-migration-google-auth.sql
   ```

## Frontend Configuration

### 1. Environment Variables

Create a `.env.local` file in your `examples/frontend-auth0` directory:

```env
# Google Authentication
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3001
```

### 2. Install Dependencies

```bash
cd examples/frontend-auth0
npm install
```

## Testing the Setup

### 1. Start the Backend

```bash
cd FLEARN-back
npm run dev
```

The server should start on `http://localhost:3000` and show:
```
🔑 Google Client ID: Configured
```

### 2. Start the Frontend

```bash
cd examples/frontend-auth0
npm run dev
```

The frontend should start on `http://localhost:3001`

### 3. Test Authentication

1. Open `http://localhost:3001`
2. Click "Sign in with Google"
3. Complete the Google OAuth flow
4. You should be redirected back to the application
5. Try accessing the user profile to test API integration

## API Usage Examples

### Authenticated Requests

All API requests to protected endpoints must include the Google ID token:

```javascript
const token = localStorage.getItem('google-token');

const response = await fetch('http://localhost:3000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### User Profile Creation

```javascript
const response = await fetch('http://localhost:3000/api/users/profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    birthdate: '1990-01-01',
    edu_level: 'Bachelor'
  })
});
```

## Security Considerations

1. **Token Validation**: The backend validates Google ID tokens using Google's verification library
2. **HTTPS**: Always use HTTPS in production
3. **Token Storage**: Store tokens securely (HttpOnly cookies recommended for production)
4. **CORS**: Configure CORS properly for your domain
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Troubleshooting

### Common Issues

1. **"Invalid token"**: 
   - Check that your GOOGLE_CLIENT_ID is correct
   - Ensure the token hasn't expired
   - Verify that the client ID matches between frontend and backend

2. **"User not found"**: 
   - The user needs to complete profile setup first
   - Check database connection and schema

3. **CORS errors**: 
   - Add your frontend domain to authorized origins in Google Cloud Console
   - Check CORS configuration in the backend

4. **OAuth redirect errors**:
   - Verify redirect URIs in Google Cloud Console
   - Check that the callback URL matches exactly

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed authentication logs in the console.

## Migration from Auth0

If you're migrating from Auth0:

1. Run the migration script: `init-scripts/03-migration-google-auth.sql`
2. Update environment variables
3. Replace Auth0 frontend components with Google authentication
4. Test all authentication flows

## Production Deployment

1. Update Google Cloud Console with production domains
2. Use HTTPS for all endpoints
3. Set secure environment variables
4. Implement proper session management
5. Enable security headers and CORS policies

## Support

For issues with this setup:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check the browser console and server logs for error messages
4. Ensure Google Cloud APIs are properly enabled