'use client';

import React from 'react';
import { CORSStatusIndicator, CORSAwareAPIExample } from '@/components/CORSStatus';
import { useCORSDebugger } from '@/hooks/useCORS';

export default function CORSTestPage() {
  const { logCORSInfo, testCORSEndpoint } = useCORSDebugger();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            CORS Error Detection & Debugging
          </h1>
          <p className="text-gray-600 mb-6">
            This page demonstrates the CORS error detection and handling system implemented in the FLEARN frontend.
            Use this page to test and debug CORS issues with the backend API.
          </p>
        </div>

        <div className="grid gap-6">
          {/* CORS Status Monitor */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Real-time CORS Status Monitor
            </h2>
            <p className="text-gray-600 mb-4">
              This component automatically monitors the backend connection and CORS configuration.
            </p>
            <CORSStatusIndicator showDetails={true} autoCheck={false} checkInterval={60000} />
          </div>

          {/* API Testing with CORS Handling */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              CORS-Aware API Testing
            </h2>
            <p className="text-gray-600 mb-4">
              Test API endpoints with automatic CORS error detection and helpful error messages.
            </p>
            <CORSAwareAPIExample />
          </div>

          {/* Manual Debugging Tools */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Manual CORS Debugging Tools
            </h2>
            <p className="text-gray-600 mb-4">
              Additional debugging tools for developers to diagnose CORS issues.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={logCORSInfo}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Log CORS Environment Info
              </button>
              
              <button
                onClick={() => testCORSEndpoint('/health')}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Test Health Endpoint
              </button>
              
              <button
                onClick={() => testCORSEndpoint('/api/users/profile')}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Test Protected Endpoint
              </button>
              
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).corsDebug) {
                    (window as any).corsDebug.logInfo();
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                Global CORS Debug
              </button>
            </div>
          </div>

          {/* CORS Configuration Guide */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              CORS Configuration Guide
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Common CORS Issues & Solutions
                </h3>
                <div className="bg-gray-50 rounded p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-red-700">❌ "Access blocked by CORS policy"</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Solution:</strong> Add your frontend URL to the backend's ALLOWED_ORIGINS environment variable.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-red-700">❌ "Failed to fetch" or "Network Error"</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Solution:</strong> Check if the backend server is running and the API_BASE_URL is correct.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-red-700">❌ "Preflight request failed"</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Solution:</strong> Ensure the backend handles OPTIONS requests and returns proper CORS headers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Backend CORS Configuration
                </h3>
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Add these environment variables to your backend .env file:
                  </p>
                  <pre className="text-xs bg-gray-800 text-gray-100 rounded p-2 overflow-x-auto">
{`# For development (allow localhost with any port)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# For production (use your actual domain)
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Frontend Environment Variables
                </h3>
                <div className="bg-gray-50 rounded p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Set these in your frontend .env.local file:
                  </p>
                  <pre className="text-xs bg-gray-800 text-gray-100 rounded p-2 overflow-x-auto">
{`# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8099

# Frontend URL (for auth callbacks)
NEXTAUTH_URL=http://localhost:3000`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Implementation Examples */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Implementation Examples
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  1. Using CORS Error Handling in Components
                </h3>
                <pre className="text-xs bg-gray-800 text-gray-100 rounded p-3 overflow-x-auto">
{`import { useAPIWithCORSHandling } from '@/hooks/useCORS';
import { CORSErrorDisplay } from '@/components/CORSErrorHandler';

function MyComponent() {
  const { executeAPI, corsError, clearErrors } = useAPIWithCORSHandling();
  
  const fetchData = async () => {
    await executeAPI(async () => {
      return await api.userAPI.getProfile();
    });
  };
  
  return (
    <div>
      {corsError && (
        <CORSErrorDisplay 
          error={corsError} 
          onRetry={fetchData}
          onDismiss={clearErrors}
        />
      )}
      <button onClick={fetchData}>Fetch Profile</button>
    </div>
  );
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  2. Adding CORS Status Monitor
                </h3>
                <pre className="text-xs bg-gray-800 text-gray-100 rounded p-3 overflow-x-auto">
{`import { CORSStatusIndicator } from '@/components/CORSStatus';

// Add to your layout or main component
<CORSStatusIndicator 
  showDetails={true} 
  autoCheck={true} 
  checkInterval={30000} 
/>`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  3. Global CORS Error Boundary
                </h3>
                <pre className="text-xs bg-gray-800 text-gray-100 rounded p-3 overflow-x-auto">
{`import { CORSErrorBoundary } from '@/components/CORSErrorHandler';

// Wrap your app in layout.tsx
<CORSErrorBoundary>
  {children}
</CORSErrorBoundary>`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}