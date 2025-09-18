'use client';

import Link from 'next/link';

interface LoginButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LoginButton({ className = '', children }: LoginButtonProps) {
  return (
    <Link
      href="/api/auth/login"
      className={`inline-flex items-center justify-center ${className}`}
    >
      {children || (
        <>
          <span className="icon">🔐</span>
          Login
        </>
      )}
    </Link>
  );
}

export default LoginButton;