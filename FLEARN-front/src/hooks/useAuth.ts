import { useState, useEffect } from 'react';
import { SessionManager, UserSession } from '@/lib/session';

interface UseAuthReturn {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: UserSession | null;
  login: (sessionData: Omit<UserSession, 'expires_at'>) => void;
  logout: () => Promise<void>;
  refreshSession: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const currentSession = SessionManager.getSession();
      const currentUser = SessionManager.getCurrentUser();
      const authenticated = SessionManager.isAuthenticated();

      setSession(currentSession);
      setUser(currentUser);
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };

    checkAuth();

    // Set up periodic session validation
    const interval = setInterval(checkAuth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const login = (sessionData: Omit<UserSession, 'expires_at'>) => {
    SessionManager.setSession(sessionData);
    setSession(SessionManager.getSession());
    setUser(sessionData.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // Call logout API to clear server-side cookies
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
    }

    // Clear client-side session
    SessionManager.clearSession();
    setSession(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshSession = () => {
    SessionManager.refreshSession();
    setSession(SessionManager.getSession());
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    session,
    login,
    logout,
    refreshSession
  };
}