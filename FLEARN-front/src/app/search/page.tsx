"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Search bar */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
        <div className="relative w-full max-w-5xl mt-8">
          <input
            type="text"
            placeholder="UUID / Name"
            className="w-full px-6 py-2 text-gray-600 border-1 border-gray-300 rounded-2xl focus:outline-none placeholder-gray-400 shadow-md"
          />
          <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {/* Action Buttons
        <div className="flex gap-4 mt-4">
          <button className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors duration-200 shadow-md">
            Search
          </button>
          <button className="px-6 py-2 bg-white text-gray-600 border border-gray-300 rounded-full hover:border-purple-400 hover:text-purple-500 transition-colors duration-200 shadow-md">
            Request
          </button>
        </div> */}
      </div>
      <Footer />
    </div>
  );
}
