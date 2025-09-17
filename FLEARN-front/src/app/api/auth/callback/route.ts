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
    // In a production app, you would exchange the code for tokens here
    // For now, just redirect to the home page
    const response = NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/`);
    
    // Set a simple auth cookie (in production, you'd set proper JWT tokens)
    response.cookies.set('auth0_authenticated', 'true', {
      httpOnly: true,
      path: '/',
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}