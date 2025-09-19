import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response that redirects to home
    const response = NextResponse.json({ 
      message: 'Logged out successfully' 
    }, { status: 200 });
    
    // Clear all authentication cookies
    response.cookies.delete('auth0_access_token');
    response.cookies.delete('auth0_user');
    response.cookies.delete('auth_state');
    response.cookies.delete('auth_nonce');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ 
      error: 'Logout failed' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Handle GET request for logout (redirect)
  const response = NextResponse.redirect(process.env.NEXTAUTH_URL!);
  
  // Clear all auth-related cookies
  response.cookies.delete('auth0_access_token');
  response.cookies.delete('auth0_user');
  response.cookies.delete('auth_state');
  response.cookies.delete('auth_nonce');
  
  return response;
}