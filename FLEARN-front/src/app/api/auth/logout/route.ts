import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Handle Auth0 logout directly
  const logoutUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout`);
  
  logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
  logoutUrl.searchParams.set('returnTo', process.env.AUTH0_BASE_URL!);
  
  const response = NextResponse.redirect(logoutUrl);
  response.cookies.delete('auth0_token');
  response.cookies.delete('auth0_state');
  
  return response;
}