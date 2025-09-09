'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { use } from 'react';

export function Nav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Learn', path: '/learn' },
        { name: 'About Us', path: '/about' },
    ];

    return (
        <nav style={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)' }} className="flex justify-between items-center p-4 w-full">
            <p className="text-[#9A41FF] text-2xl font-bold"><Link href="/">FLearn</Link></p>
            <ul className="flex gap-8 items-center">
                {navItems.map((item) => (
                    <li key={item.name}>
                        <Link
                            href={item.path}
                            className={`text-[#9A41FF] transition-all duration-200
                                ${pathname === item.path
                                    ? 'opacity-100 border-b-2 border-[#9A41FF] pb-1'
                                    : 'opacity-70 hover:opacity-100'
                                }`}
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}
                <li>
                    <Image
                        src="/profile-icon.svg"
                        alt="ProfileIcon"
                        width={32}
                        height={32}
                        className="text-[#9A41FF]"
                    />
                </li>
            </ul>
        </nav>
    );
}