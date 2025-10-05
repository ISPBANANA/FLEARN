'use client';

import React, { useState, useEffect } from 'react';
import { CORSError, diagnoseCORSIssue } from '@/lib/api';

interface CORSErrorDisplayProps {
  error: CORSError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function CORSErrorDisplay({ error, onRetry, onDismiss }: CORSErrorDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);

  const runDiagnostics = async () => {
    setRunningDiagnostics(true);
    try {
      const results = await diagnoseCORSIssue();
      setDiagnostics(results);
    } catch (err) {
      console.error('Failed to run CORS diagnostics:', err);
    } finally {
      setRunningDiagnostics(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            CORS Configuration Error
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>The frontend cannot connect to the backend server due to CORS (Cross-Origin Resource Sharing) restrictions.</p>
          </div>
          
          <div className="mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-red-600 hover:text-red-500 underline"
            >
              {showDetails ? 'Hide Details' : 'Show Details & Solutions'}
            </button>
          </div>

          {showDetails && (
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium text-red-800">Error Details:</h4>
                <div className="mt-1 bg-red-100 rounded p-2 text-xs font-mono text-red-700">
                  <p><strong>URL:</strong> {error.requestUrl}</p>
                  <p><strong>Error:</strong> {error.originalError.message}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-red-800">Recommended Solutions:</h4>
                <ul className="mt-1 list-disc list-inside text-sm text-red-700 space-y-1">
                  {error.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={runDiagnostics}
                  disabled={runningDiagnostics}
                  className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                >
                  {runningDiagnostics ? 'Running...' : 'Run Diagnostics'}
                </button>
                
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                  >
                    Retry Request
                  </button>
                )}
              </div>

              {diagnostics && (
                <div>
                  <h4 className="text-sm font-medium text-red-800">Diagnostic Results:</h4>
                  <div className="mt-1 bg-red-100 rounded p-2 text-xs">
                    <div className="space-y-1">
                      <p>
                        <span className="font-medium">Backend Connection:</span>
                        <span className={`ml-2 ${diagnostics.canConnect ? 'text-green-600' : 'text-red-600'}`}>
                          {diagnostics.canConnect ? '✅ OK' : '❌ Failed'}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">CORS Configuration:</span>
                        <span className={`ml-2 ${diagnostics.corsConfigured ? 'text-green-600' : 'text-red-600'}`}>
                          {diagnostics.corsConfigured ? '✅ OK' : '❌ Not Configured'}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Health Check:</span>
                        <span className={`ml-2 ${diagnostics.healthCheck ? 'text-green-600' : 'text-red-600'}`}>
                          {diagnostics.healthCheck ? '✅ OK' : '❌ Failed'}
                        </span>
                      </p>
                    </div>
                    
                    {diagnostics.suggestions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <p className="font-medium text-red-800">Diagnostic Suggestions:</p>
                        <ul className="mt-1 list-disc list-inside text-red-700 space-y-1">
                          {diagnostics.suggestions.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {onDismiss && (
            <div className="mt-3">
              <button
                onClick={onDismiss}
                className="text-xs text-red-600 hover:text-red-500 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for handling CORS errors in components
export function useCORSErrorHandler() {
  const [corsError, setCorsError] = useState<CORSError | null>(null);

  const handleError = (error: Error) => {
    if (error instanceof CORSError) {
      setCorsError(error);
      return true; // Indicates the error was handled
    }
    return false; // Indicates the error was not a CORS error
  };

  const clearError = () => setCorsError(null);

  return {
    corsError,
    handleError,
    clearError,
    CORSErrorComponent: corsError ? (
      <CORSErrorDisplay 
        error={corsError} 
        onDismiss={clearError}
      />
    ) : null
  };
}

// Global CORS error boundary component
export function CORSErrorBoundary({ children }: { children: React.ReactNode }) {
  const { corsError, handleError, CORSErrorComponent } = useCORSErrorHandler();

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason instanceof CORSError) {
        event.preventDefault();
        handleError(event.reason);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [handleError]);

  return (
    <div>
      {CORSErrorComponent}
      {children}
    </div>
  );
}