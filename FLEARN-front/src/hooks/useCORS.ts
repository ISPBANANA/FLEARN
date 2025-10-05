import { useState, useCallback, useEffect } from 'react';
import { CORSError, diagnoseCORSIssue } from '@/lib/api';

export interface CORSStatus {
  isHealthy: boolean;
  lastChecked: Date | null;
  error: CORSError | null;
  diagnostics: any | null;
}

export function useCORSMonitor(checkInterval?: number) {
  const [corsStatus, setCorsStatus] = useState<CORSStatus>({
    isHealthy: true,
    lastChecked: null,
    error: null,
    diagnostics: null
  });

  const [isChecking, setIsChecking] = useState(false);
  const [hasInitialCheck, setHasInitialCheck] = useState(false);

  const checkCORSHealth = useCallback(async () => {
    if (isChecking) {
      console.log('CORS check already in progress, skipping...');
      return;
    }
    
    // Prevent excessive calls - minimum 5 seconds between checks
    const now = new Date();
    if (corsStatus.lastChecked && (now.getTime() - corsStatus.lastChecked.getTime()) < 5000) {
      console.log('CORS check called too recently, skipping...');
      return;
    }
    
    setIsChecking(true);
    try {
      // Use silent mode for automatic checks to reduce console spam
      const diagnostics = await diagnoseCORSIssue(undefined, true);
      setCorsStatus({
        isHealthy: diagnostics.canConnect && diagnostics.corsConfigured,
        lastChecked: new Date(),
        error: null,
        diagnostics
      });
    } catch (error) {
      const corsError = error instanceof CORSError ? error : null;
      setCorsStatus({
        isHealthy: false,
        lastChecked: new Date(),
        error: corsError,
        diagnostics: null
      });
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, corsStatus.lastChecked]);

  // Automatic periodic checking - only if interval is provided and reasonable
  useEffect(() => {
    if (checkInterval && checkInterval >= 10000) { // Minimum 10 seconds
      const interval = setInterval(() => {
        if (!isChecking) {
          checkCORSHealth();
        }
      }, checkInterval);
      return () => clearInterval(interval);
    }
  }, [checkInterval]); // Removed checkCORSHealth from dependencies

  // Initial check on mount - only once
  useEffect(() => {
    if (!hasInitialCheck && !isChecking) {
      setHasInitialCheck(true);
      // Delay initial check to avoid immediate execution
      const timeout = setTimeout(() => {
        checkCORSHealth();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, []); // Empty dependency array for one-time execution

  return {
    corsStatus,
    isChecking,
    checkCORSHealth,
    clearError: () => setCorsStatus(prev => ({ ...prev, error: null }))
  };
}

// Hook for wrapping API calls with CORS error handling
export function useAPIWithCORSHandling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [corsError, setCorsError] = useState<CORSError | null>(null);

  const executeAPI = useCallback(async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    setCorsError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (error instanceof CORSError) {
        setCorsError(error);
        console.group('🚫 CORS Error in API Call');
        console.error('CORS Error Details:', error.message);
        console.error('Request URL:', error.requestUrl);
        console.error('Suggestions:', error.suggestions);
        console.groupEnd();
      } else {
        setError(error);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    executeAPI,
    isLoading,
    error,
    corsError,
    clearErrors: () => {
      setError(null);
      setCorsError(null);
    }
  };
}

// Development-only CORS debugging utilities
export function useCORSDebugger() {
  const logCORSInfo = useCallback(() => {
    if (typeof window === 'undefined') return;

    console.group('🔍 CORS Debug Information');
    console.log('Current Origin:', window.location.origin);
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
    console.log('Environment:', process.env.NODE_ENV);
    
    // Check common CORS-related environment variables
    const envVars = [
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXTAUTH_URL',
      'NODE_ENV'
    ];
    
    console.group('Environment Variables:');
    envVars.forEach(varName => {
      console.log(`${varName}:`, process.env[varName] || 'NOT SET');
    });
    console.groupEnd();

    // Check cookies for auth tokens
    if (document.cookie) {
      console.group('Auth Cookies:');
      const cookies = document.cookie.split(';');
      const authCookies = cookies.filter(cookie => 
        cookie.trim().includes('auth0') || 
        cookie.trim().includes('token') ||
        cookie.trim().includes('session')
      );
      authCookies.forEach(cookie => console.log(cookie.trim()));
      console.groupEnd();
    }

    console.groupEnd();
  }, []);

  const testCORSEndpoint = useCallback(async (endpoint: string = '/health') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099');
    const fullUrl = `${origin}${endpoint}`;
    
    console.group(`🧪 Testing CORS for: ${fullUrl}`);
    
    try {
      // Test with different CORS configurations
      const tests = [
        { name: 'Basic fetch', options: {} },
        { name: 'CORS enabled', options: { mode: 'cors' as RequestMode } },
        { name: 'With credentials', options: { mode: 'cors' as RequestMode, credentials: 'include' as RequestCredentials } },
        { name: 'No CORS', options: { mode: 'no-cors' as RequestMode } }
      ];

      for (const test of tests) {
        try {
          console.log(`Testing: ${test.name}`);
          const response = await fetch(fullUrl, test.options);
          console.log(`✅ ${test.name}: Status ${response.status}, Type: ${response.type}`);
        } catch (error) {
          console.log(`❌ ${test.name}:`, error instanceof Error ? error.message : String(error));
        }
      }
    } catch (error) {
      console.error('Test failed:', error);
    }
    
    console.groupEnd();
  }, []);

  return {
    logCORSInfo,
    testCORSEndpoint
  };
}

// Add to window object for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).corsDebug = {
    checkHealth: diagnoseCORSIssue,
    logInfo: () => {
      console.group('🔍 CORS Debug Information');
      console.log('Current Origin:', window.location.origin);
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      console.groupEnd();
    }
  };
}