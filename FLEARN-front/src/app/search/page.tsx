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
        <div className="relative w-full max-w-6xl mt-8">
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

        {/* Action Buttons */}
        <div className="w-full max-w-6xl mt-12 flex justify-start">
          <div className="flex gap-2">
            <button className="px-8 py-1 bg-white text-gray-400 border border-gray-400 rounded-xl hover:border-gray-600 hover:text-gray-600 transition-colors shadow-md">
              Search
            </button>
            <button className="px-8 py-1 bg-white text-gray-400 border border-gray-400 rounded-xl hover:border-gray-600 hover:text-gray-600 transition-colors shadow-md">
              Request
            </button>
          </div>
        </div>

        {/* Profile Boxes */}
        <div className="w-full max-w-7xl mt-8 grid grid-cols-3 gap-6">
          {/* Profile Box 1 */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-purple-600 font-medium truncate">AiTarlnwza007</p>
                <p className="text-sm text-gray-500 truncate">UUID: xxxx</p>
                <p className="text-xs text-gray-400">Join since: 02/02/2022</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-1 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-full text-sm">
                Pending
              </button>
            </div>
          </div>

          {/* Profile Box 2 */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-purple-600 font-medium truncate">AiTarlnwza007</p>
                <p className="text-sm text-gray-500 truncate">UUID: xxxx</p>
                <p className="text-xs text-gray-400">Join since: 02/02/2022</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-1 text-gray-600 bg-white border border-gray-300 rounded-full text-sm hover:border-purple-400 hover:text-purple-500 transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Profile Box 3 */}
          <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-purple-600 font-medium truncate">AiTarlnwza007</p>
                <p className="text-sm text-gray-500 truncate">UUID: xxxx</p>
                <p className="text-xs text-gray-400">Join since: 02/02/2022</p>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button className="px-4 py-1 text-gray-600 bg-white border border-gray-300 rounded-full text-sm hover:border-purple-400 hover:text-purple-500 transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
