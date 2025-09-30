import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Debug: Environment Variables:', {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    // Don't expose secrets, just check if they exist
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
    // Additional debugging info
    access_method: 'Make sure you access via hongrocker49.thddns.net:2725, not localhost:3000',
    oauth_redirect_should_be: 'http://hongrocker49.thddns.net:2725/api/auth/callback'
  });
}