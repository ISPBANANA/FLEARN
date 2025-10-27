"use client";

import { useEffect, useState, ReactNode } from 'react';

interface StylesLoadedWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that ensures all CSS is loaded before rendering children
 * Prevents Flash of Unstyled Content (FOUC)
 */
export function StylesLoadedWrapper({ children, fallback }: StylesLoadedWrapperProps) {
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    // Check if stylesheets are loaded
    const checkStylesLoaded = () => {
      if (typeof window === 'undefined') return;

      try {
        const styleSheets = Array.from(document.styleSheets);
        const allLoaded = styleSheets.every(sheet => {
          try {
            // Access cssRules to verify the stylesheet is loaded
            return sheet.cssRules !== null || sheet.cssRules !== undefined;
          } catch (e) {
            // Cross-origin stylesheets might throw, consider them loaded
            return true;
          }
        });

        if (allLoaded) {
          setStylesLoaded(true);
        } else {
          // Retry after a short delay
          setTimeout(checkStylesLoaded, 50);
        }
      } catch (error) {
        // If any error occurs, assume styles are loaded to prevent infinite loading
        console.warn('Error checking stylesheet status:', error);
        setStylesLoaded(true);
      }
    };

    // Start checking after a minimal delay to ensure DOM is ready
    const timer = setTimeout(checkStylesLoaded, 100);

    // Fallback: always show content after 1 second even if check fails
    const fallbackTimer = setTimeout(() => {
      setStylesLoaded(true);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  if (!stylesLoaded) {
    return fallback || (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" style={{ width: '3rem', height: '3rem', borderRadius: '9999px', borderBottomWidth: '2px', borderColor: '#a855f7', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}></div>
          <p className="text-gray-600" style={{ color: '#4b5563' }}>Loading styles...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
