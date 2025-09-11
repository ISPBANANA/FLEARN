'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Factory, UserRound } from 'lucide-react';
import { use } from 'react';

export function Nav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Learn', path: '/learn' },
        { name: 'About Us', path: '/about' },
    ];

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
              <li>
                <UserRound
                  width={30}
                  height={30}
                  className={`text-[#9A41FF] duration-200 ${
                    pathname === '/profile'
                      ? 'opacity-100'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              </li>
            </ul>
          </nav>
        </div>
    );
}