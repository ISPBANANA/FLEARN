import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

export default function Layout({ children }) {
  const { user, isLoading } = useUser();

  return (
    <div className="layout">
      <header className="header">
        <nav className="nav">
          <div className="nav-brand">
            <Link href="/" className="brand-link">
              <span className="logo">🌱 FLEARN</span>
            </Link>
          </div>
          
          <div className="nav-links">
            <Link href="/" className="nav-link">
              Home
            </Link>
            
            {user && (
              <>
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </>
            )}
          </div>
          
          <div className="nav-auth">
            {!isLoading && (
              <>
                {user ? (
                  <div className="user-nav">
                    <span className="user-greeting">
                      Hi, {user.name || user.email}!
                    </span>
                    <LogoutButton />
                  </div>
                ) : (
                  <LoginButton />
                )}
              </>
            )}
          </div>
        </nav>
      </header>
      
      <main className="main">
        {children}
      </main>
      
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 FLEARN. Built with Auth0 and Next.js.</p>
          <div className="footer-links">
            <a href="https://auth0.com" target="_blank" rel="noopener noreferrer">
              Powered by Auth0
            </a>
            <a href="https://github.com/ISPBANANA/FLEARN" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
