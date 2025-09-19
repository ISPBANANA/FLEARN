import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import { useAuth } from './useAuth';

interface UserProfile {
  user_id: string;
  google_id: string;
  profile_pic?: string;
  name: string;
  email: string;
  birthdate?: string;
  edu_level?: string;
  rank?: string;
  streak?: number;
  completed_task?: number;
  daily_exp?: number;
  math_exp?: number;
  phy_exp?: number;
  bio_exp?: number;
  chem_exp?: number;
  created_at?: string;
  updated_at?: string;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const fetchProfile = async () => {
    if (!isAuthenticated || !user) {
      setProfile(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await userAPI.getProfile();
      setProfile(response.user);
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      // If profile doesn't exist (404), that's okay - user might be new
      if (err.message.includes('404') || err.message.includes('User not found')) {
        setProfile(null);
        setError(null);
      } else {
        setError(err.message || 'Failed to fetch profile');
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isAuthenticated, user]);

  const refetchProfile = async () => {
    await fetchProfile();
  };

  return {
    profile,
    isLoading,
    error,
    refetchProfile
  };
}