// Server-side session utilities
// ⚠️ IMPORTANT: This file can ONLY be used in Server Components!
// For Client Components, use './session.ts' instead.

import { cookies } from 'next/headers';
import { UserSession } from './session';

// Server-side session utilities (only use in Server Components)
export const getServerSession = async (): Promise<UserSession | null> => {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('auth0_user');
    const tokenCookie = cookieStore.get('auth0_access_token');
    
    if (!userCookie || !tokenCookie) {
      return null;
    }
    
    const user = JSON.parse(decodeURIComponent(userCookie.value));
    const id_token = tokenCookie.value;
    
    return {
      user,
      access_token: id_token, // For compatibility
      id_token,
      expires_at: Date.now() + (60 * 60 * 1000) // 1 hour
    };
  } catch (error) {
    console.error('Error reading server session:', error);
    return null;
  }
};

// Check if user is authenticated on server-side
export const isAuthenticatedOnServer = async (): Promise<boolean> => {
  const session = await getServerSession();
  return session !== null;
};

// Get user from server-side session
export const getServerUser = async () => {
  const session = await getServerSession();
  return session?.user || null;
};