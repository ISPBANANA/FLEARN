'use client';

import { Nav } from "@/components/nav";
import Image from "next/image";
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white">
            <Nav />

            <main className="p-6 max-w-md mx-auto z-10 relative flex flex-col h-[calc(100vh-64px)] items-center justify-center">
                <div className="flex flex-col items-center mb-2">
                    <Image
                        src="/Chr/cry.png"
                        alt="Logo"
                        width={220}
                        height={220}
                    />
                </div>

                <h1 className="text-2xl text-[#454545] mb-5">
                    Sorry, we couldn&rsquo;t find that page.
                </h1>

                <Link
                    href="/"
                >
                    <button className="bg-purple-400 text-white py-2 px-4 w-50 rounded hover:bg-purple-500 transition">
                        Home
                    </button>
                </Link>
            </main>
        </div>
    );
}