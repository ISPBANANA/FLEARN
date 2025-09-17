'use client';

import { useState, useEffect } from 'react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

interface User {
  name?: string;
  email?: string;
  picture?: string;
}

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user authentication state
    // This is a simplified check - in production you'd verify JWT tokens
    const checkAuthState = () => {
      // For now, we'll simulate checking auth state
      // In a real app, you'd check for valid tokens in cookies or localStorage
      setIsLoading(false);
      // setUser(null); // No user by default
    };

    checkAuthState();
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