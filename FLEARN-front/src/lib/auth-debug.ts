// Debug utility to check authentication status
// This can be imported and used in components for debugging

import { SessionManager } from './session';
import { getCurrentUser, isAuthenticated } from './api';

export const AuthDebug = {
  // Check all authentication states
  checkAuthStatus() {
    //console.log('=== Auth Status Debug ===');
    
    // SessionManager status
    //console.log('SessionManager:');
    //console.log('  - isAuthenticated():', SessionManager.isAuthenticated());
    //console.log('  - getSession():', SessionManager.getSession());
    //console.log('  - getCurrentUser():', SessionManager.getCurrentUser());
    //console.log('  - getAuthToken():', SessionManager.getAuthToken() ? 'Token present' : 'No token');
    
    // API utils status
    //console.log('API Utils:');
    //console.log('  - isAuthenticated():', isAuthenticated());
    //console.log('  - getCurrentUser():', getCurrentUser());
    
    // Cookie status
    if (typeof document !== 'undefined') {
      console.log('Cookies:');
      const cookies = document.cookie.split(';').map(c => c.trim());
      const authCookies = cookies.filter(c => c.includes('auth0'));
      console.log('  - auth cookies:', authCookies.length > 0 ? authCookies : 'None found');
    }
    
    // localStorage status
    if (typeof window !== 'undefined') {
      console.log('LocalStorage:');
      console.log('  - user_session:', localStorage.getItem('user_session') ? 'Present' : 'Missing');
      console.log('  - current_user:', localStorage.getItem('current_user') ? 'Present' : 'Missing');
    }
    
    console.log('=== End Debug ===');
  },
  
  // Clear all authentication data
  clearAll() {
    console.log('Clearing all authentication data...');
    SessionManager.clearSession();
    
    // Clear any auth cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'auth0_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'auth0_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    
    console.log('All authentication data cleared.');
  }
};