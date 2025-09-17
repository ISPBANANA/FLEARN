'use client';

import React, { useState, useEffect } from 'react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';
import { getCurrentUser, isAuthenticated } from '../../lib/api';

interface User {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
}

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = () => {
      try {
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
    
    // Check auth state periodically or on focus
    const interval = setInterval(checkAuthState, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">Hi, {user.name || user.email}!</span>
        <LogoutButton className="text-sm text-red-600 hover:text-red-800" />
      </div>
    );
  }

  return <LoginButton className="text-sm text-blue-600 hover:text-blue-800" />;
}

export default AuthButton;