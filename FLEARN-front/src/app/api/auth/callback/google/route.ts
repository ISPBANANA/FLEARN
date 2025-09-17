import { google } from '@/lib/auth0-google';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('google_oauth_state')?.value;
  const codeVerifier = cookieStore.get('google_code_verifier')?.value;

  if (!code || !state || state !== storedState || !codeVerifier) {
    return new Response('Invalid OAuth flow', { status: 400 });
  }

  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  const userInfoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userInfoResponse.ok) {
    return new Response('Failed to fetch user info', { status: 500 });
  }

  const user = await userInfoResponse.json();
  console.log('Google User:', user); // You can store this in your DB or session

  return redirect('/profile'); // Redirect to a profile or dashboard page
}