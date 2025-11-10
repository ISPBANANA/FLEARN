import { NextRequest, NextResponse } from 'next/server';

// Debug route to test different Google OAuth configurations
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const testType = url.searchParams.get('test') || 'default';
  
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`;
  const state = Math.random().toString(36).substring(7);
  
  let authUrl: URL;
  
  switch (testType) {
    case 'v1':
      // Test with older endpoint
      authUrl = new URL('https://accounts.google.com/oauth2/auth');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'profile email');
      authUrl.searchParams.set('state', state);
      break;
      
    case 'v2':
      // Test with v2 endpoint
      authUrl = new URL('https://accounts.google.com/oauth2/v2/auth');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'openid profile email');
      authUrl.searchParams.set('state', state);
      break;
      
    case 'minimal':
      // Test with minimal scopes
      authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'email');
      authUrl.searchParams.set('state', state);
      break;
      
    default:
      // Current implementation
      authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', 'openid profile email');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      break;
  }
  
  //console.log(`Testing OAuth with ${testType}:`, authUrl.toString());
  
  return NextResponse.json({
    testType,
    authUrl: authUrl.toString(),
    clientId,
    redirectUri,
    message: 'Copy the authUrl and test it in a new browser tab'
  });
}