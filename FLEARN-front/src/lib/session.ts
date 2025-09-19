// Session management utilities
// Note: This file is for client-side use only

export interface UserSession {
  user: {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    email_verified?: boolean;
  };
  access_token: string;
  id_token: string;
  expires_at: number;
}

// Client-side session management
export const SessionManager = {
  // Set user session
  setSession: (sessionData: Omit<UserSession, 'expires_at'>) => {
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour from now
    const session: UserSession = {
      ...sessionData,
      expires_at: expiresAt
    };
    
    localStorage.setItem('user_session', JSON.stringify(session));
    
    // Also set a more accessible current user object
    localStorage.setItem('current_user', JSON.stringify(session.user));
  },

  // Get user session
  getSession: (): UserSession | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem('user_session');
      if (!sessionData) return null;
      
      const session: UserSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (Date.now() > session.expires_at) {
        SessionManager.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error reading session:', error);
      SessionManager.clearSession();
      return null;
    }
  },

  // Get current user
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('current_user');
      if (!userData) return null;
      
      // Verify session is still valid
      const session = SessionManager.getSession();
      if (!session) {
        localStorage.removeItem('current_user');
        return null;
      }
      
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error reading current user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return SessionManager.getSession() !== null;
  },

  // Get auth token for API calls
  getAuthToken: (): string | null => {
    const session = SessionManager.getSession();
    return session ? session.id_token : null;
  },

  // Clear session
  clearSession: () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('user_session');
    localStorage.removeItem('current_user');
    
    // Also clear any signup data
    localStorage.removeItem('signup_data');
  },

  // Refresh session expiry
  refreshSession: () => {
    const session = SessionManager.getSession();
    if (session) {
      SessionManager.setSession({
        user: session.user,
        access_token: session.access_token,
        id_token: session.id_token
      });
    }
  }
};

// Session validation utility
export const validateSession = async (session: UserSession): Promise<boolean> => {
  try {
    // Check if token is still valid by making a test API call
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099'}/api/users/profile`, {
      headers: {
        'Authorization': `Bearer ${session.id_token}`,
      },
    });
    
    return response.ok || response.status === 404; // 404 is OK (new user)
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
};