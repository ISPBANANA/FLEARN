import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🚀 Login route called');
  
  // Handle Auth0 login directly with Google connection
  const state = Math.random().toString(36).substring(7);
  const redirectUri = `${process.env.AUTH0_BASE_URL}/api/auth/callback`;
  
  const authUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/authorize`);
  
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('connection', 'google-oauth2'); // Force Google login

  
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('auth0_state', state, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  });
  
  return response;
}