# 🔐 Auth0 Frontend Login Implementation Guide

This guide provides step-by-step instructions for implementing Auth0 authentication in your frontend login page for the FLEARN application.

## 📋 Prerequisites

Before implementing Auth0 login, ensure you have:

- ✅ Auth0 account and application configured
- ✅ FLEARN backend API running with Auth0 integration
- ✅ Frontend framework ready (React, Next.js, Vue, etc.)
- ✅ Auth0 credentials from your dashboard

## 🚀 Quick Setup Overview

1. **Install Auth0 SDK**
2. **Configure Environment Variables**
3. **Set up Auth0 Provider**
4. **Create Login Page**
5. **Handle Authentication State**
6. **Make Authenticated API Calls**

---

## 1️⃣ Install Auth0 SDK

### For Next.js:
```bash
npm install @auth0/nextjs-auth0
```

### For React (SPA):
```bash
npm install @auth0/auth0-react
```

### For Vanilla JavaScript:
```bash
npm install @auth0/auth0-spa-js
```

---

## 2️⃣ Configure Environment Variables

Create a `.env.local` file (Next.js) or `.env` file (React) with your Auth0 configuration:

```env
# Auth0 Configuration
AUTH0_SECRET='your-secret-key-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://genai-5051199463733487.jp.auth0.com'
AUTH0_CLIENT_ID='lcf2KrgpqZCw0XzHtKvOn1cCTnDJQH1m'
AUTH0_CLIENT_SECRET='9dhc65x9ZWTjZSbUJ2EHKTB6ao9mwJcXGo6U8xJVyaw9vMvk-CsdLzoH3Dlu4MPD'
AUTH0_AUDIENCE='https://FLEARN-api.com'

# FLEARN API Configuration
NEXT_PUBLIC_API_BASE_URL='http://localhost:8099'
```

> 🔐 **Security Note**: Never commit `.env` files to version control. Add them to `.gitignore`.

---

## 3️⃣ Set up Auth0 Provider

### Next.js Implementation

#### `pages/_app.js`:
```jsx
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
```

#### Configure Auth0 API Route `pages/api/auth/[...auth0].js`:
```javascript
import { handleAuth } from '@auth0/nextjs-auth0';

export default handleAuth();
```

### React SPA Implementation

#### `src/index.js` or `src/main.jsx`:
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';

ReactDOM.render(
  <Auth0Provider
    domain="genai-5051199463733487.jp.auth0.com"
    clientId="lcf2KrgpqZCw0XzHtKvOn1cCTnDJQH1m"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "https://FLEARN-api.com"
    }}
  >
    <App />
  </Auth0Provider>,
  document.getElementById('root')
);
```

---

## 4️⃣ Create Login Page Components

### Next.js Login Button:
```jsx
// components/LoginButton.js
import { useUser } from '@auth0/nextjs-auth0/client';

export default function LoginButton() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div className="user-info">
        <img src={user.picture} alt={user.name} width="50" height="50" />
        <h2>Welcome, {user.name}!</h2>
        <p>{user.email}</p>
        <a href="/api/auth/logout" className="logout-btn">
          Logout
        </a>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Welcome to FLEARN</h1>
      <p>Please log in to access your learning dashboard</p>
      <a href="/api/auth/login" className="login-btn">
        🔐 Login with Auth0
      </a>
    </div>
  );
}
```

### React SPA Login Button:
```jsx
// components/LoginButton.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return (
      <div className="user-info">
        <img src={user.picture} alt={user.name} width="50" height="50" />
        <h2>Welcome, {user.name}!</h2>
        <p>{user.email}</p>
        <button 
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="logout-btn"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Welcome to FLEARN</h1>
      <p>Please log in to access your learning dashboard</p>
      <button onClick={() => loginWithRedirect()} className="login-btn">
        🔐 Login with Auth0
      </button>
    </div>
  );
};

export default LoginButton;
```

---

## 5️⃣ Create Complete Login Page

### Next.js Login Page (`pages/login.js`):
```jsx
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Login() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Authentication Error</h2>
        <p>{error.message}</p>
        <a href="/api/auth/login" className="retry-btn">Try Again</a>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">
          <h1>🌱 FLEARN</h1>
          <p>Your Personal Learning Garden</p>
        </div>
        
        <div className="login-content">
          <h2>Welcome Back!</h2>
          <p>Sign in to continue your learning journey</p>
          
          <div className="login-options">
            <a href="/api/auth/login" className="auth0-login-btn">
              <span className="icon">🔐</span>
              Continue with Auth0
            </a>
          </div>
          
          <div className="features">
            <div className="feature">
              <span className="emoji">📚</span>
              <span>Personalized Learning</span>
            </div>
            <div className="feature">
              <span className="emoji">👥</span>
              <span>Study with Friends</span>
            </div>
            <div className="feature">
              <span className="emoji">🏆</span>
              <span>Track Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6️⃣ Handle Authentication State

### Protected Route Component:
```jsx
// components/ProtectedRoute.js
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return children;
}
```

### Usage in Dashboard:
```jsx
// pages/dashboard.js
import ProtectedRoute from '../components/ProtectedRoute';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Dashboard() {
  const { user } = useUser();

  return (
    <ProtectedRoute>
      <div className="dashboard">
        <h1>Welcome to your Dashboard, {user.name}!</h1>
        {/* Dashboard content */}
      </div>
    </ProtectedRoute>
  );
}
```

---

## 7️⃣ Make Authenticated API Calls

### API Utility Function:
```javascript
// lib/api.js
import { getAccessToken } from '@auth0/nextjs-auth0';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099';

export async function makeAuthenticatedRequest(endpoint, options = {}) {
  try {
    // For server-side requests
    const { accessToken } = await getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Client-side API calls
export async function clientSideApiCall(endpoint, options = {}) {
  const response = await fetch(`/api/flearn-proxy${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}
```

### API Proxy for Client-Side Calls (`pages/api/flearn-proxy/[...path].js`):
```javascript
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(req, res) {
  try {
    const { accessToken } = await getAccessToken(req, res);
    const { path } = req.query;
    const apiPath = Array.isArray(path) ? path.join('/') : path;
    
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${apiPath}`;
    
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

---

## 8️⃣ CSS Styling Example

```css
/* styles/auth.css */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', sans-serif;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.logo h1 {
  color: #4c51bf;
  margin: 0;
  font-size: 2.5rem;
}

.logo p {
  color: #718096;
  margin: 0.5rem 0 2rem;
}

.auth0-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #4c51bf;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
  margin: 1rem 0;
}

.auth0-login-btn:hover {
  background: #3c366b;
  transform: translateY(-2px);
}

.features {
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4c51bf;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## 9️⃣ Testing Your Implementation

### 1. Start Your Development Server:
```bash
npm run dev
```

### 2. Test Authentication Flow:
1. Visit `http://localhost:3000/login`
2. Click "Continue with Auth0"
3. Complete Auth0 login process
4. Verify redirect to dashboard
5. Test logout functionality

### 3. Test API Integration:
```javascript
// Example: Test user profile API
useEffect(() => {
  async function fetchUserProfile() {
    try {
      const profile = await clientSideApiCall('/users/profile');
      console.log('User profile:', profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }
  
  if (user) {
    fetchUserProfile();
  }
}, [user]);
```

---

## 🔧 Auth0 Dashboard Configuration

### Required Settings:

1. **Application Settings**:
   - Application Type: `Single Page Application` (for React) or `Regular Web Application` (for Next.js)
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

2. **API Settings**:
   - Identifier: `https://FLEARN-api.com`
   - Signing Algorithm: `RS256`
   - Allow Skipping User Consent: `Enabled` (for development)

3. **Social Connections** (Optional):
   - Enable Google, GitHub, or other providers
   - Configure OAuth settings

---

## 🐛 Common Issues & Solutions

### Issue: "Invalid state parameter"
**Solution**: Clear browser storage and ensure callback URLs are correct.

### Issue: "Access denied"
**Solution**: Check audience parameter and API authorization settings.

### Issue: "CORS error"
**Solution**: Ensure backend CORS settings include your frontend URL.

### Issue: "Token expired"
**Solution**: Implement token refresh or handle expired tokens gracefully.

---

## 🚀 Next Steps

1. **Add Loading States**: Implement better loading indicators
2. **Error Handling**: Add comprehensive error boundaries
3. **User Onboarding**: Create user profile setup flow
4. **Social Login**: Add additional social providers
5. **Multi-Factor Auth**: Enable MFA for enhanced security

---

## 📞 Support Resources

- **Auth0 Documentation**: https://auth0.com/docs
- **FLEARN API Docs**: Check `API_SETUP_GUIDE.md`
- **Test Scripts**: Use scripts in `/scripts/` directory
- **Community**: Join Auth0 community forums

---

**🎉 You're ready to implement Auth0 login in your FLEARN frontend!**

This guide provides everything you need to create a secure, user-friendly authentication experience.
