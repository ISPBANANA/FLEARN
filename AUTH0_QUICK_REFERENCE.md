# 🔐 Auth0 Frontend Quick Reference

## 🚀 Essential Configuration

### Environment Variables
```env
AUTH0_SECRET='your-secret-key'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://genai-5051199463733487.jp.auth0.com'
AUTH0_CLIENT_ID='lcf2KrgpqZCw0XzHtKvOn1cCTnDJQH1m'
AUTH0_AUDIENCE='https://FLEARN-api.com'
```

### Auth0 Dashboard Settings
- **Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Logout URLs**: `http://localhost:3000`
- **Web Origins**: `http://localhost:3000`

## ⚡ Quick Implementation

### Next.js Setup
```bash
npm install @auth0/nextjs-auth0
```

```jsx
// _app.js
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
```

### Login Button
```jsx
import { useUser } from '@auth0/nextjs-auth0/client';

export default function LoginButton() {
  const { user } = useUser();
  
  return user ? (
    <a href="/api/auth/logout">Logout</a>
  ) : (
    <a href="/api/auth/login">Login</a>
  );
}
```

### API Calls
```javascript
// Server-side
const { accessToken } = await getAccessToken(req, res);

// Client-side proxy
const response = await fetch('/api/flearn-proxy/users/profile');
```

## 🔗 Key URLs
- **Login**: `/api/auth/login`
- **Logout**: `/api/auth/logout`  
- **Profile**: `/api/auth/me`
- **FLEARN API**: `http://localhost:8099`

## 📋 Testing Checklist
- [ ] Login redirects to Auth0
- [ ] Successful authentication redirects back
- [ ] User info displays correctly
- [ ] Logout clears session
- [ ] Protected routes work
- [ ] API calls include JWT token

## 🐛 Common Issues
- **Invalid state**: Clear browser storage
- **CORS error**: Check backend CORS config
- **Token expired**: Implement refresh logic
- **Access denied**: Verify audience setting
