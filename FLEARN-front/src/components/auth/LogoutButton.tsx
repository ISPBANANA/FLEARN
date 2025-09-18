'use client';

import Link from 'next/link';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function LogoutButton({ className = '', children }: LogoutButtonProps) {
  return (
    <Link
      href="/api/auth/logout"
      className={`inline-flex items-center justify-center ${className}`}
    >
      {children || (
        <>
          <span className="icon">👋</span>
          Logout
        </>
      )}
    </Link>
  );
}

export default LogoutButton;