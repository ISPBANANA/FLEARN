// Google OAuth Configuration
export const googleAuthConfig = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  redirectUri: process.env.NEXTAUTH_URL! + '/api/auth/callback',
  scope: 'openid profile email'
};

// Google OAuth endpoints
export const googleAuthEndpoints = {
  authorize: 'https://accounts.google.com/oauth2/v2/auth',
  token: 'https://oauth2.googleapis.com/token',
  userinfo: 'https://www.googleapis.com/oauth2/v2/userinfo',
  // For logout, we'll clear local state and redirect to a logout page
  logout: process.env.NEXTAUTH_URL + '/'
};

// Backwards compatibility - keeping the same interface as auth0-config
export const auth0Config = googleAuthConfig;
export const auth0Endpoints = googleAuthEndpoints;