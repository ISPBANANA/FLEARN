'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Privacy Policy', path: '/policy' },
        { name: 'Terms of Service', path: '/tos' },
    ];

    return (
        <div
          className="w-full bg-white z-50 py-6"
          style={{ boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.25)' }}
        >
          <div className="flex justify-between items-start px-10 w-full max-w-[1920px] mx-auto">
            <div className="flex items-center h-full">
              <p className="text-[#9A41FF] text-lg mt-[calc(1rem+1.25rem)]">
                &copy; 2025 FLearn ISPBanana. All Rights Reserved.
              </p>
            </div>

            <ul className="flex flex-col gap-4 items-end">
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
            </ul>
          </div>
        </div>
    );
}