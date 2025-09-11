# FLEARN Frontend Auth0 Integration Example

This example demonstrates how to integrate Auth0 authentication with the FLEARN backend API in a Next.js frontend application.

## 🚀 Quick Start

```bash
# Navigate to the example directory
cd examples/frontend-auth0

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your Auth0 configuration

# Start the development server
npm run dev

# Visit http://localhost:3000
```

## 📋 Features Demonstrated

### 🔐 Authentication
- ✅ Auth0 login/logout
- ✅ User profile management
- ✅ Protected routes
- ✅ JWT token handling

### 🌐 API Integration
- ✅ Authenticated API calls to FLEARN backend
- ✅ User profile CRUD operations
- ✅ Friends management
- ✅ Gardens (shared learning spaces)
- ✅ Error handling and loading states

### 🎨 UI Components
- ✅ Login/Logout buttons
- ✅ User profile display
- ✅ Protected dashboard
- ✅ API response display
- ✅ Loading indicators

## 📁 Project Structure

```
frontend-auth0/
├── package.json
├── next.config.js
├── .env.local.example
├── pages/
│   ├── _app.js           # Auth0 Provider setup
│   ├── index.js          # Public home page
│   ├── login.js          # Login page
│   ├── dashboard.js      # Protected dashboard
│   └── api/
│       └── auth/
│           └── [...auth0].js  # Auth0 API routes
├── components/
│   ├── Layout.js         # Main layout with navigation
│   ├── LoginButton.js    # Login component
│   ├── LogoutButton.js   # Logout component
│   ├── UserProfile.js    # User profile display
│   └── ApiTester.js      # FLEARN API testing component
└── lib/
    └── api.js            # API utility functions
```

## 🔧 Configuration

### 1. Auth0 Setup
Create an Auth0 Application with these settings:
- **Application Type**: Single Page Application
- **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and configure:

```env
# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR-AUTH0-DOMAIN.auth0.com'
AUTH0_CLIENT_ID='your_auth0_client_id'
AUTH0_CLIENT_SECRET='your_auth0_client_secret'
AUTH0_AUDIENCE='https://FLEARN-api.com'

# FLEARN API Configuration
NEXT_PUBLIC_API_BASE_URL='http://localhost:8099'
```

## 🧪 Testing

### Prerequisites
1. FLEARN backend must be running on `http://localhost:8099`
2. Auth0 configuration must be complete
3. Database must be initialized

### Test Flow
1. Visit `http://localhost:3000`
2. Click "Login" to authenticate with Auth0
3. Access the protected dashboard
4. Test FLEARN API endpoints
5. Create/update user profile
6. Test friends and gardens functionality

## 📚 API Integration Examples

### Get User Profile
```javascript
const response = await fetch('/api/flearn/user/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Create User Profile
```javascript
const response = await fetch('/api/flearn/user/profile', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    edu_level: 'University'
  })
});
```

## 🔒 Security Features

- **JWT Token Management**: Automatic token refresh and storage
- **Protected Routes**: Route-level authentication guards
- **API Security**: All FLEARN API calls include valid JWT tokens
- **Error Handling**: Proper error responses for authentication failures

## 🎯 Next Steps

1. **Styling**: Add your preferred CSS framework (Tailwind, Material-UI, etc.)
2. **State Management**: Integrate Redux or Zustand for complex state
3. **Real-time Features**: Add WebSocket support for live updates
4. **Mobile Support**: Ensure responsive design for mobile devices
5. **Testing**: Add unit and integration tests

## 🐛 Troubleshooting

### Common Issues
1. **"Invalid token"**: Check Auth0 configuration and audience settings
2. **CORS errors**: Ensure backend CORS settings include frontend URL
3. **404 on API calls**: Verify FLEARN backend is running on correct port
4. **Auth0 callback error**: Check callback URLs in Auth0 dashboard

### Debug Mode
Set `NODE_ENV=development` to enable detailed error messages.

## 📞 Support

For issues related to:
- **Auth0**: Check Auth0 documentation and dashboard logs
- **FLEARN API**: Use the test scripts in `/scripts/` directory
- **Next.js**: Refer to Next.js documentation

---

**Ready to integrate Auth0 with your FLEARN frontend!** 🚀
