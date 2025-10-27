# Authentication Quick Reference

## 🔐 Overview

FLEARN Backend uses **Google OAuth 2.0** for authentication via ID tokens.

---

## 🚀 Setup

### Environment Variables
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Import Middleware
```javascript
const { checkJwt, optionalJwt } = require('../middleware/auth');
```

---

## 🔧 Middleware Usage

### Protected Routes (Required Auth)
```javascript
router.get('/profile', checkJwt, async (req, res) => {
    const googleId = req.user.sub || req.user.id;
    const email = req.user.email;
    // ... your code
});
```

### Optional Auth Routes
```javascript
router.get('/public-data', optionalJwt, async (req, res) => {
    if (req.user) {
        // User is authenticated
    } else {
        // Anonymous access
    }
});
```

---

## 📨 Request Format

### Headers
```
Authorization: Bearer <GOOGLE_ID_TOKEN>
```

### Example Request
```bash
curl -X GET http://localhost:8099/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI..."
```

### PowerShell Example
```powershell
$headers = @{
    "Authorization" = "Bearer $idToken"
}
Invoke-RestMethod -Uri "http://localhost:8099/api/users/profile" `
  -Headers $headers
```

---

## 👤 User Object

After authentication, `req.user` contains:

```javascript
{
  id: "google|1234567890",
  sub: "google|1234567890",
  email: "user@example.com",
  email_verified: true,
  name: "John Doe",
  picture: "https://lh3.googleusercontent.com/..."
}
```

### Accessing User Data
```javascript
// Get Google ID
const googleId = req.user.sub || req.user.id;

// Get email
const email = req.user.email;

// Get name
const name = req.user.name;

// Get profile picture
const profilePic = req.user.picture;
```

---

## 🛠️ Implementation Details

### Google Token Verification
```javascript
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const verifyGoogleToken = async (token) => {
    const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    return {
        id: `google|${payload.sub}`,
        email: payload.email,
        email_verified: payload.email_verified,
        name: payload.name,
        picture: payload.picture,
        sub: `google|${payload.sub}`
    };
};
```

### Middleware Flow
```
Request → Extract Token → Verify with Google → Set req.user → Next()
```

---

## 🔄 Development Mode

If `GOOGLE_CLIENT_ID` is not configured, the middleware automatically uses **mock authentication**:

```javascript
// Mock user for development
{
  id: 'google|mock-user-id',
  email: 'test@example.com',
  email_verified: true,
  name: 'Test User',
  picture: 'https://via.placeholder.com/150'
}
```

**Console Output:**
```
⚠️  Using mock authentication middleware - Google Cloud not configured
```

---

## ❌ Error Handling

### No Token Provided
```json
{
  "error": "Unauthorized",
  "message": "No token provided"
}
```
**Status Code:** `401`

### Invalid Token
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```
**Status Code:** `401`

### Example Error Handler
```javascript
const handleAuthError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token'
        });
    } else {
        next(err);
    }
};
```

---

## 🔍 Debug Mode

Enable auth debugging:
```javascript
const debugAuth = (req, res, next) => {
    console.log('✅ User authenticated:', req.user?.email);
    next();
};
```

---

## 🌐 Frontend Integration

### Obtaining Google ID Token
```javascript
// React/Next.js example
import { GoogleLogin } from '@react-oauth/google';

<GoogleLogin
  onSuccess={(credentialResponse) => {
    const idToken = credentialResponse.credential;
    // Send idToken to backend
    fetch('http://localhost:8099/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
  }}
/>
```

### Storing Token
```javascript
// Store in localStorage or secure cookie
localStorage.setItem('google_id_token', idToken);

// Use in API calls
const token = localStorage.getItem('google_id_token');
fetch('/api/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🔒 Security Best Practices

1. **Always validate tokens server-side** - Never trust client-sent user data
2. **Use HTTPS in production** - Protect tokens in transit
3. **Set short token expiration** - Google ID tokens expire after 1 hour
4. **Verify audience** - Ensure token is meant for your app
5. **Check email_verified** - Ensure email is verified if required

### Example Security Check
```javascript
router.post('/admin-action', checkJwt, async (req, res) => {
    // Verify email is verified
    if (!req.user.email_verified) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Email must be verified'
        });
    }
    
    // Check admin status in database
    const user = await getUserByGoogleId(req.user.sub);
    if (!user.is_admin) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
        });
    }
    
    // Proceed with admin action
});
```

---

## 📚 Related Documentation

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google ID Token Verification](https://developers.google.com/identity/sign-in/web/backend-auth)
- API Endpoints Reference: `API_ENDPOINTS.md`
- Database Reference: `DATABASE.md`
