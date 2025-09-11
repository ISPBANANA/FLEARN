import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <h2>Authentication Error</h2>
          <p>{error.message}</p>
          <a href="/api/auth/login" className="retry-btn">Try Again</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="login-page">
        <div className="login-card">
          <div className="logo-section">
            <h1 className="logo">🌱 FLEARN</h1>
            <p className="tagline">Your Personal Learning Garden</p>
          </div>
          
          <div className="login-content">
            <h2>Welcome Back!</h2>
            <p>Sign in to continue your learning journey</p>
            
            <div className="login-options">
              <a href="/api/auth/login" className="auth0-login-btn">
                <span className="icon">🔐</span>
                Continue with Auth0
              </a>
            </div>
            
            <div className="features-preview">
              <div className="feature">
                <span className="emoji">📚</span>
                <span>Personalized Learning</span>
              </div>
              <div className="feature">
                <span className="emoji">👥</span>
                <span>Study with Friends</span>
              </div>
              <div className="feature">
                <span className="emoji">🏆</span>
                <span>Track Progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
