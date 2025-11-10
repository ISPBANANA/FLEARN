"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SessionManager } from '@/lib/session';

export default function SearchParamsHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle session data from auth callback
    const sessionParam = searchParams.get('session');
    if (sessionParam) {
      try {
        const sessionData = JSON.parse(Buffer.from(sessionParam, 'base64').toString());
        
        // If user picture is missing (due to size constraints), we could fetch it separately
        // For now, just set the session with available data
        SessionManager.setSession({
          user: sessionData.user,
          access_token: sessionData.access_token,
          id_token: sessionData.id_token
        });
        
        //console.log('✅ User session restored from login');
        
        // After successful login, try to get user profile and redirect to profile page
        const fetchProfileAndRedirect = async () => {
          try {
            const response = await fetch('/api/users/profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${sessionData.id_token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const profileData = await response.json();
              const userId = profileData.user.user_id;
              router.replace(`/profile/${userId}`);
              return;
            } else {
              // If profile doesn't exist, redirect to signup
              const encodedData = Buffer.from(JSON.stringify(sessionData)).toString('base64');
              router.replace(`/signup?data=${encodedData}`);
              return;
            }
          } catch (error) {
            console.error('Failed to fetch profile after login:', error);
            // Clean up URL by removing the session parameter and stay on landing page
            const url = new URL(window.location.href);
            url.searchParams.delete('session');
            router.replace(url.pathname + url.search);
          }
        };

        fetchProfileAndRedirect();
        
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }

    // Check if user is already logged in
    const existingSession = SessionManager.getSession();
    if (existingSession) {
      //console.log('User is already logged in:', existingSession.user.name);
      // Optionally redirect logged-in users to dashboard
      // router.replace('/dashboard');
    }
  }, [searchParams, router]);

  return null; // This component doesn't render anything
}