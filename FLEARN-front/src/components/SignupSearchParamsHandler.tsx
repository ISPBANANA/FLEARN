"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SignupSearchParamsHandlerProps {
  onDataLoaded: (encodedData: string) => void;
}

export default function SignupSearchParamsHandler({ onDataLoaded }: SignupSearchParamsHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadSignupData = () => {
      // Try to get data from URL first
      const encodedData = searchParams.get('data');
      
      if (!encodedData) {
        // If not in URL, try localStorage
        const storedData = localStorage.getItem('signup_data');
        if (!storedData) {
          router.replace('/');
          return null;
        }
        return storedData;
      }
      
      return encodedData;
    };

    try {
      const encodedData = loadSignupData();
      if (encodedData) {
        onDataLoaded(encodedData);
        
        // If data was from URL, remove it
        if (searchParams.get('data')) {
          router.replace('/signup');
        }
      }
    } catch (e) {
      console.error('Failed to parse signup data:', e);
      localStorage.removeItem('signup_data');
      router.replace('/');
    }
  }, [searchParams, router, onDataLoaded]);

  return null; // This component doesn't render anything
}