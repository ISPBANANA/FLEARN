import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle Auth0 callback - exchange code for tokens
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }
  
  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code: code,
        redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();
    
    // Get user info from Auth0
    const userResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const user = await userResponse.json();

    // Send user data to FLEARN backend to create/update profile
    try {
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`,
        },
        body: JSON.stringify({
          name: user.name || user.nickname,
          email: user.email,
          profile_pic: user.picture,
        }),
      });

      if (backendResponse.ok) {
        console.log('✅ User profile synced with FLEARN backend');
      } else {
        console.warn('⚠️ Failed to sync user profile with backend:', backendResponse.statusText);
      }
    } catch (backendError) {
      console.warn('⚠️ Backend sync error:', backendError instanceof Error ? backendError.message : 'Unknown error');
      // Continue even if backend sync fails
    }
    
    // Redirect to home page with auth tokens stored in cookies
    const response = NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/`);
    
    // Store tokens securely in httpOnly cookies
    response.cookies.set('auth0_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 86400, // 24 hours default
    });

    if (tokens.id_token) {
      response.cookies.set('auth0_id_token', tokens.id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
        maxAge: tokens.expires_in || 86400,
      });
    }

    // Store user info for client-side access
    response.cookies.set('auth0_user', JSON.stringify({
      sub: user.sub,
      name: user.name || user.nickname,
      email: user.email,
      picture: user.picture,
    }), {
      httpOnly: false, // Allow client-side access for UI
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 86400,
    });
    
    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ 
      error: 'Authentication failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}