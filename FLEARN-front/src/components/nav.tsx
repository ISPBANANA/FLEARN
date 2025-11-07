'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRound, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useState } from 'react';

export function Nav() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();
    const { profile, isLoading: profileLoading } = useUserProfile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className="w-full bg-white z-50 relative" style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }}>
          <nav className="flex justify-between items-center p-4 px-10 w-full max-w-[1920px] mx-auto">
            <p className="text-[#9A41FF] text-2xl font-bold">
              <Link href="/">FLearn</Link>
            </p>
            
            {/* Desktop Navigation */}
            <ul className="hidden lg:flex gap-8 items-center">
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
                    <Link 
                        href="/search"
                        className={`text-[#9A41FF] transition-all duration-200 ${
                          pathname === '/search'
                          ? 'opacity-100 border-b-2 border-[#9A41FF] pb-1'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      Search
                    </Link>
                    {profileLoading && (
                      <div className="w-2 h-2 bg-[#9A41FF] rounded-full animate-pulse"></div>
                    )}
                  </li>
                  <li className="flex items-center gap-2">
                    <Link 
                      href={profile?.user_id ? `/profile/${profile.user_id}` : '#'}
                      className="cursor-pointer"
                    >
                      <img 
                        src={
                          // Priority: 1. API profile picture, 2. Session user picture, 3. Default fallback
                          profile?.profile_pic || 
                          user.picture || 
                          '/profile-icon.svg'
                        } 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-[#9A41FF] transition-all duration-200"
                        onError={(e) => {
                          // If image fails to load, fallback to default
                          e.currentTarget.src = '/profile-icon.svg';
                        }}
                      />
                    </Link>
                    {profileLoading && (
                      <div className="w-2 h-2 bg-[#9A41FF] rounded-full animate-pulse"></div>
                    )}
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

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden text-[#9A41FF] p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X width={24} height={24} />
              ) : (
                <Menu width={24} height={24} />
              )}
            </button>
          </nav>

          {/* Mobile Dropdown Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
              <ul className="flex flex-col p-4 space-y-4">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.path}
                      onClick={closeMenu}
                      className={`block text-[#9A41FF] transition-all duration-200 py-2 ${
                        pathname === item.path
                          ? 'opacity-100 font-semibold'
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
                    <li>
                      <Link 
                        href="/search"
                        onClick={closeMenu}
                        className={`block text-[#9A41FF] transition-all duration-200 py-2 ${
                          pathname === '/search'
                          ? 'opacity-100 font-semibold'
                          : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        Search
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={profile?.user_id ? `/profile/${profile.user_id}` : '#'}
                        onClick={closeMenu}
                        className="flex items-center gap-3 py-2 text-[#9A41FF] opacity-70 hover:opacity-100 transition-all duration-200"
                      >
                        <img 
                          src={
                            // Priority: 1. API profile picture, 2. Session user picture, 3. Default fallback
                            profile?.profile_pic || 
                            user.picture || 
                            '/profile-icon.svg'
                          } 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            // If image fails to load, fallback to default
                            e.currentTarget.src = '/profile-icon.svg';
                          }}
                        />
                        <span>Profile</span>
                        {profileLoading && (
                          <div className="w-2 h-2 bg-[#9A41FF] rounded-full animate-pulse"></div>
                        )}
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="flex items-center gap-3 py-2 text-[#9A41FF] opacity-70 hover:opacity-100 transition-all duration-200 w-full text-left"
                      >
                        <LogOut width={20} height={20} />
                        <span>Logout</span>
                      </button>
                    </li>
                  </>
                ) : (
                  // Show login for non-authenticated users
                  <li>
                    <Link
                      href="/api/auth/login"
                      onClick={closeMenu}
                      className="flex items-center gap-3 py-2 text-[#9A41FF] opacity-70 hover:opacity-100 transition-all duration-200"
                    >
                      <UserRound width={24} height={24} />
                      <span>Login</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
    );
}