'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Factory, UserRound, LogOut } from 'lucide-react';
import { use, useState, useEffect } from 'react';
import { AuthButton } from './auth';
import { SessionManager } from '@/lib/session';
import { useAuth } from '@/hooks/useAuth';

export function Nav() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Learn', path: '/learn' },
        { name: 'About Us', path: '/about' },
    ];

    const handleLogout = async () => {
        await logout();
        // Redirect to home page
        window.location.href = '/';
    };

    return (
        <div className="w-full bg-white z-50" style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
          <nav className="flex justify-between items-center p-4 px-10 w-full max-w-[1920px] mx-auto">
            <p className="text-[#9A41FF] text-2xl font-bold">
              <Link href="/">FLearn</Link>
            </p>
            <ul className="flex gap-8 items-center">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.path}
                    className={`text-[#9A41FF] transition-all duration-200 ${
                      pathname === item.path
                        ? 'opacity-100 border-b-2 border-[#9A41FF] pb-1'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              {isAuthenticated && user ? (
                // Show user profile and logout for authenticated users
                <>
                  <li className="flex items-center gap-2">
                    <img 
                      src={user.picture || '/profile-icon.svg'} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full"
                    />
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="text-[#9A41FF] opacity-70 hover:opacity-100 duration-200 flex items-center gap-1"
                      title="Logout"
                    >
                      <LogOut width={20} height={20} />
                    </button>
                  </li>
                </>
              ) : (
                // Show login for non-authenticated users
                <li>
                  <Link
                    href="/api/auth/login"
                    className={`text-[#9A41FF] duration-200 ${
                      pathname === '/profile'
                        ? 'opacity-100'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    title="Login"
                  >
                    <UserRound
                      width={30}
                      height={30}
                    />
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
    );
}