import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Home() {
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
      <div className="home-page">
        <div className="hero-section">
          <div className="hero-content">
            <div className="logo-section">
              <h1 className="logo">🌱 FLEARN</h1>
              <p className="tagline">Your Personal Learning Garden</p>
            </div>
            
            <div className="hero-text">
              <h2>Welcome to FLEARN!</h2>
              <p>
                Join thousands of learners growing their knowledge together. 
                Create study groups, track your progress, and achieve your learning goals.
              </p>
            </div>
            
            <div className="cta-section">
              <a href="/api/auth/login" className="cta-button primary">
                🚀 Get Started
              </a>
              <a href="/login" className="cta-button secondary">
                Learn More
              </a>
            </div>
          </div>
        </div>
        
        <div className="features-section">
          <h3>Why Choose FLEARN?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h4>Personalized Learning</h4>
              <p>Adaptive learning paths tailored to your goals and preferences</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h4>Study with Friends</h4>
              <p>Create gardens with friends and learn together</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h4>Track Progress</h4>
              <p>Monitor your learning streaks and achievements</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h4>Goal Setting</h4>
              <p>Set and achieve your learning milestones</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
