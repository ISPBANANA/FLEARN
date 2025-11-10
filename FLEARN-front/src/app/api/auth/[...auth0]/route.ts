import { NextRequest, NextResponse } from 'next/server';

// Simple Google OAuth route handler for App Router
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (pathname.includes('/login')) {
    return handleLogin();
  }
  
  if (pathname.includes('/signup')) {
    return handleLogin(); // Same OAuth flow for both login and signup
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
  // Check if required environment variables are set
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || !process.env.NEXTAUTH_URL) {
    console.error('Missing required environment variables:', {
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL
    });
    return NextResponse.json({ 
      error: 'OAuth configuration error',
      message: 'Missing required environment variables' 
    }, { status: 500 });
  }
  
  const state = Math.random().toString(36).substring(7);
  const nonce = Math.random().toString(36).substring(7);
  
  // Debug environment variables
  // console.log('All environment variables for NEXTAUTH:', {
  //   NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  //   NODE_ENV: process.env.NODE_ENV,
  //   NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  //   HOSTNAME: process.env.HOSTNAME,
  //   HOST: process.env.HOST
  // });

  // Force the correct URL if NEXTAUTH_URL is not set properly
  const baseUrl = process.env.NEXTAUTH_URL || 'http://hongrocker49.thddns.net:2725';
  const redirectUri = `${baseUrl}/api/auth/callback`;
  // console.log('OAuth redirect URI:', redirectUri);
  
  // Use the newer OAuth 2.0 endpoint
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  
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
  const baseUrl = process.env.NEXTAUTH_URL || 'http://hongrocker49.thddns.net:2725';
  const response = NextResponse.redirect(baseUrl);
  
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
  
  // Force the correct URL if NEXTAUTH_URL is not set properly
  const baseUrl = process.env.NEXTAUTH_URL || 'http://hongrocker49.thddns.net:2725';
  
  // Check for OAuth error
  if (error) {
    console.error('OAuth error:', error, 'URL:', request.url);
    return NextResponse.redirect(`${baseUrl}/?error=oauth_error&details=${encodeURIComponent(error)}`);
  }
  
  // Verify state parameter
  const storedState = request.cookies.get('auth_state')?.value;
  if (!state || state !== storedState) {
    console.error('State mismatch or missing state');
    return NextResponse.redirect(`${baseUrl}/?error=state_mismatch`);
  }
  
  if (!code) {
    console.error('No authorization code received');
    return NextResponse.redirect(`${baseUrl}/?error=no_code`);
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
        redirect_uri: `${baseUrl}/api/auth/callback`,
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(`${baseUrl}/?error=token_exchange_failed`);
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
      return NextResponse.redirect(`${baseUrl}/?error=user_info_failed`);
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
    
    // Check if user exists in the database
    let isNewUser = false;
    let userData = null;
    try {
      const userCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${id_token}`,
        },
      });

      if (userCheckResponse.status === 404) {
        isNewUser = true;
      } else {
        const responseData = await userCheckResponse.json();
        userData = responseData.user; // Extract user data from response
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // If we can't check, assume existing user to avoid breaking login
      isNewUser = false;
      userData = null; // Make sure userData is null if there's an error
    }
    
    let response;
    
    if (isNewUser) {
      // Redirect new users to signup page with their Google OAuth data
      const signupData = {
        user,
        access_token,
        id_token
      };
      
      const encodedData = Buffer.from(JSON.stringify(signupData)).toString('base64');
      response = NextResponse.redirect(`${baseUrl}/signup?data=${encodedData}`);
    } else {
      // For existing users, redirect to home page with minimal session data
      const existingUserSession = {
        sub: user.sub,
        email: user.email,
        name: (userData && userData.name) ? userData.name : user.name,
        picture: (userData && userData.profile_pic) ? userData.profile_pic : user.picture,
        email_verified: user.email_verified
      };
      
      // Create minimal session data (without large profile picture to avoid URL length issues)
      const sessionData = {
        user: {
          sub: existingUserSession.sub,
          email: existingUserSession.email,
          name: existingUserSession.name,
          picture: existingUserSession.picture && existingUserSession.picture.length > 500 ? '' : existingUserSession.picture, // Skip large pictures
          email_verified: existingUserSession.email_verified
        },
        access_token,
        id_token
      };
      const encodedSessionData = Buffer.from(JSON.stringify(sessionData)).toString('base64');
      response = NextResponse.redirect(`${baseUrl}/?session=${encodedSessionData}`);
    }
    
    // Only set cookies and session for existing users
    if (!isNewUser) {
      // Set cookies with authentication info (keeping same names for compatibility)
      response.cookies.set('auth0_access_token', id_token, { // Using id_token as access_token for backend compatibility
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 3600 // 1 hour
      });
      
      // Use database user data for existing users (with picture size check for cookies)
      const cookieUserData = {
        sub: user.sub,
        email: user.email,
        name: (userData && userData.name) ? userData.name : user.name,
        picture: (userData && userData.profile_pic && userData.profile_pic.length <= 500) ? userData.profile_pic : 
                 (user.picture && user.picture.length <= 500) ? user.picture : '', // Skip large pictures for cookies
        email_verified: user.email_verified
      };
      
      response.cookies.set('auth0_user', encodeURIComponent(JSON.stringify(cookieUserData)), {
        httpOnly: false, // Frontend needs to read this
        path: '/',
        sameSite: 'lax',
        maxAge: 3600 // 1 hour
      });
    }
    // New users don't get cookies/session until they complete signup
    
    // Clear temporary cookies
    response.cookies.delete('auth_state');
    response.cookies.delete('auth_nonce');
    
    return response;
    
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${baseUrl}/?error=callback_error`);
  }
}