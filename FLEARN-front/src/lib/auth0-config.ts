// Auth0 Configuration
export const auth0Config = {
  domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', ''),
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  audience: process.env.AUTH0_AUDIENCE!,
  redirectUri: process.env.AUTH0_BASE_URL! + '/api/auth/callback',
  scope: 'openid profile email'
};

// Auth0 API endpoints
export const auth0Endpoints = {
  authorize: `${process.env.AUTH0_ISSUER_BASE_URL}/authorize`,
  token: `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
  userinfo: `${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`,
  logout: `${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout`
};