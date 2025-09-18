import { NextRequest, NextResponse } from 'next/server';

// Simple test route to verify if the signup flow works without OAuth
export async function GET() {
  // Create mock user data for testing
  const mockUser = {
    sub: 'test|123456789',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://via.placeholder.com/150',
    email_verified: true
  };

  const mockTokens = {
    access_token: 'mock_access_token',
    id_token: 'mock_id_token'
  };

  // Create signup data
  const signupData = {
    user: mockUser,
    access_token: mockTokens.access_token,
    id_token: mockTokens.id_token
  };

  const encodedData = Buffer.from(JSON.stringify(signupData)).toString('base64');
  
  // Redirect to signup page with test data
  const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/signup?data=${encodedData}`);
  
  // Set test cookies
  response.cookies.set('auth0_access_token', mockTokens.id_token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 3600
  });
  
  response.cookies.set('auth0_user', encodeURIComponent(JSON.stringify(mockUser)), {
    httpOnly: false,
    path: '/',
    sameSite: 'lax',
    maxAge: 3600
  });
  
  return response;
}