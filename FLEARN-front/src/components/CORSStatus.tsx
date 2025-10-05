'use client';

import React, { useState, useEffect } from 'react';
import { useCORSMonitor, useAPIWithCORSHandling, useCORSDebugger } from '@/hooks/useCORS';
import { CORSErrorDisplay } from './CORSErrorHandler';
import { checkBackendHealth, testCORSConnectivity } from '@/lib/api';

interface CORSStatusIndicatorProps {
  showDetails?: boolean;
  autoCheck?: boolean;
  checkInterval?: number;
}

export function CORSStatusIndicator({ 
  showDetails = false, 
  autoCheck = true, 
  checkInterval = 30000 // 30 seconds
}: CORSStatusIndicatorProps) {
  const { corsStatus, isChecking, checkCORSHealth } = useCORSMonitor(
    autoCheck ? checkInterval : undefined
  );
  
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-600';
    return corsStatus.isHealthy ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    
    if (corsStatus.isHealthy) {
      return (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    return (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <span className="text-sm font-medium">
            Backend Connection
          </span>
          <span className={`text-xs px-2 py-1 rounded ${
            corsStatus.isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isChecking ? 'Checking...' : corsStatus.isHealthy ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={checkCORSHealth}
            disabled={isChecking}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Check Now'}
          </button>
          
          {!corsStatus.isHealthy && (
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded"
            >
              {showFullDetails ? 'Hide' : 'Show'} Details
            </button>
          )}
        </div>
      </div>

      {corsStatus.lastChecked && (
        <div className="text-xs text-gray-500 mt-1">
          Last checked: {corsStatus.lastChecked.toLocaleTimeString()}
        </div>
      )}

      {showFullDetails && corsStatus.error && (
        <div className="mt-3">
          <CORSErrorDisplay 
            error={corsStatus.error}
            onRetry={checkCORSHealth}
          />
        </div>
      )}

      {showFullDetails && corsStatus.diagnostics && (
        <div className="mt-3 bg-gray-50 rounded p-2 text-xs">
          <h4 className="font-medium text-gray-700 mb-2">Connection Status:</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Backend Reachable:</span>
              <span className={corsStatus.diagnostics.canConnect ? 'text-green-600' : 'text-red-600'}>
                {corsStatus.diagnostics.canConnect ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>CORS Configured:</span>
              <span className={corsStatus.diagnostics.corsConfigured ? 'text-green-600' : 'text-red-600'}>
                {corsStatus.diagnostics.corsConfigured ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Health Check:</span>
              <span className={corsStatus.diagnostics.healthCheck ? 'text-green-600' : 'text-red-600'}>
                {corsStatus.diagnostics.healthCheck ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced example component showing how to use CORS error handling in API calls
export function CORSAwareAPIExample() {
  const { executeAPI, isLoading, error, corsError, clearErrors } = useAPIWithCORSHandling();
  const { logCORSInfo, testCORSEndpoint } = useCORSDebugger();
  const [healthResult, setHealthResult] = useState<any>(null);

  const testHealthEndpoint = async () => {
    const result = await executeAPI(async () => {
      const healthData = await checkBackendHealth();
      setHealthResult(healthData);
      return healthData;
    });
  };

  const testConnectivity = async () => {
    const result = await executeAPI(async () => {
      const isConnected = await testCORSConnectivity();
      return { connected: isConnected };
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">CORS-Aware API Testing</h3>
      
      <div className="flex space-x-2">
        <button
          onClick={testHealthEndpoint}
          disabled={isLoading}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Health Endpoint'}
        </button>
        
        <button
          onClick={testConnectivity}
          disabled={isLoading}
          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Connectivity'}
        </button>
        
        {process.env.NODE_ENV === 'development' && (
          <>
            <button
              onClick={logCORSInfo}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Log CORS Info
            </button>
            
            <button
              onClick={() => testCORSEndpoint('/health')}
              className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Debug CORS
            </button>
          </>
        )}
      </div>

      {corsError && (
        <CORSErrorDisplay 
          error={corsError}
          onRetry={() => {
            clearErrors();
            testHealthEndpoint();
          }}
          onDismiss={clearErrors}
        />
      )}

      {error && !corsError && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-700 text-sm">
            <strong>API Error:</strong> {error.message}
          </p>
        </div>
      )}

      {healthResult && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <h4 className="font-medium mb-2">Health Check Result:</h4>
          <pre className="text-xs text-gray-700">
            {JSON.stringify(healthResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}