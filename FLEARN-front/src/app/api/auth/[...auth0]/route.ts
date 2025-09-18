import { NextRequest, NextResponse } from 'next/server';

// Simple Google OAuth route handler for App Router
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
  const nonce = Math.random().toString(36).substring(7);
  
  const authUrl = new URL('https://accounts.google.com/oauth2/v2/auth');
  
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/callback`);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('auth_state', state, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  });
  response.cookies.set('auth_nonce', nonce, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  });
  
  return response;
}

function handleLogout() {
  const response = NextResponse.redirect(process.env.NEXTAUTH_URL!);
  
  // Clear all auth-related cookies
  response.cookies.delete('auth0_access_token');
  response.cookies.delete('auth0_user');
  response.cookies.delete('auth_state');
  response.cookies.delete('auth_nonce');
  
  return response;
}

async function handleCallback(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  
  // Check for OAuth error
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=oauth_error`);
  }
  
  // Verify state parameter
  const storedState = request.cookies.get('auth_state')?.value;
  if (!state || state !== storedState) {
    console.error('State mismatch or missing state');
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=state_mismatch`);
  }
  
  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=no_code`);
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=token_exchange_failed`);
    }
    
    const tokens = await tokenResponse.json();
    const { access_token, id_token } = tokens;
    
    // Get user info using the access token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('Failed to get user info');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=user_info_failed`);
    }
    
    const userInfo = await userResponse.json();
    
    // Create user object compatible with existing frontend code
    const user = {
      sub: `google|${userInfo.id}`,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      email_verified: userInfo.verified_email
    };
    
    const response = NextResponse.redirect(process.env.NEXTAUTH_URL!);
    
    // Set cookies with authentication info (keeping same names for compatibility)
    response.cookies.set('auth0_access_token', id_token, { // Using id_token as access_token for backend compatibility
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });
    
    response.cookies.set('auth0_user', encodeURIComponent(JSON.stringify(user)), {
      httpOnly: false, // Frontend needs to read this
      path: '/',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });
    
    // Clear temporary cookies
    response.cookies.delete('auth_state');
    response.cookies.delete('auth_nonce');
    
    return response;
    
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=callback_error`);
  }
}