import { NextRequest, NextResponse } from 'next/server';

// Simple Auth0 route handler for App Router
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (pathname.includes('/login')) {
    return handleLogin();
  }
  
  if (pathname.includes('/logout')) {
    return handleLogout();
  }
  
  if (pathname.includes('/callback')) {
    return handleCallback(request);
  }
  
  return NextResponse.json({ error: 'Route not found' }, { status: 404 });
}

function handleLogin() {
  const state = Math.random().toString(36).substring(7);
  const authUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/authorize`);
  
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', `${process.env.AUTH0_BASE_URL}/api/auth/callback`);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('auth0_state', state, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax'
  });
  
  return response;
}

function handleLogout() {
  const logoutUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout`);
  
  logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
  logoutUrl.searchParams.set('returnTo', process.env.AUTH0_BASE_URL!);
  
  const response = NextResponse.redirect(logoutUrl);
  response.cookies.delete('auth0_token');
  response.cookies.delete('auth0_state');
  
  return response;
}

function handleCallback(request: NextRequest) {
  // Simplified callback - in production you'd exchange code for tokens
  const response = NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/`);
  return response;
}