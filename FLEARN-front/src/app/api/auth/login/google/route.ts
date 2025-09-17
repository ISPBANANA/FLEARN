// src/app/api/auth/login/google/route.ts
import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '@/lib/auth0-google';
import { cookies } from 'next/headers';

export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

  const cookieStore = await cookies();
  cookieStore.set('google_oauth_state', state, { path: '/', httpOnly: true });
  cookieStore.set('google_code_verifier', codeVerifier, { path: '/', httpOnly: true });

  // ✅ This is a redirect, not a fetch
  return Response.redirect(url.toString());
}