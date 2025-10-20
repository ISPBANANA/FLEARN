"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import Link from 'next/link';
import { Suspense } from 'react';
import SearchParamsHandler from '@/components/SearchParamsHandler';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';

// Force dynamic rendering to avoid build-time issues with useSearchParams
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, refetchProfile } = useUserProfile();

  useEffect(() => {

    // Wait for both auth and profile to finish loading
    if (!authLoading && !profileLoading) {
      if (!isAuthenticated || !profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        notFound();
      } else {
      }
    }
  }, [isAuthenticated, profile, authLoading, profileLoading]);

  // Show loading while checking authentication and role
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <Nav />

      {/* Infomation here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
        
        {/* User Management */}
        <div className="w-full max-w-[1320px] h-[500px] items-center flex flex-col px-25 py-2 rounded-lg" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
          {/* header */}
          <div className="w-full flex flex-row justify-between items-center mb-4 my-4 w-full">
            <h2 className="text-2xl font-bold text-[#454545]">User Dashboard</h2>
            <div className="flex flex-row gap-4">
              {/* Action */}
              <button className="bg-white border border-green-400 text-green-800 py-1 px-4 w-30 rounded hover:border-green-500 transition">
                Add User
              </button>
              {/* Search bar */}
              <input
                type="text"
                placeholder="Search users..."
                className="border border-gray-300 rounded px-4 py-1 w-60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545]"
              />
            </div>
          </div>
          {/* Show */}
          <div className="flex flex-col overflow-y-auto w-full h-max-[400px] gap-1">
            {/* Temporary table structure */}
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 py-1 px-4 m-1 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 rounded-lg" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                <div className="text-left">UUID</div>
                <div className="text-left">Username</div>
                <div className="text-left">Email</div>
                <div className="text-left">Role</div>
                <div className="text-left">Create Date</div>
              </div>
              {/* Sample data row */}
              <div className="grid grid-cols-6 gap-4 py-1 px-4 m-1 border-b border-gray-100 hover:bg-gray-50 rounded-lg" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                <div
                  className="text-gray-900 flex items-center relative overflow-hidden whitespace-nowrap"
                  title="d96b75d6-adc5-41fb-a399-15079425d281"
                  style={{
                    background: 'linear-gradient(to right, currentColor 0%, currentColor 70%, transparent 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  <span className="text-gray-900">d96b75d6-adc5-41fb-a399-15079425d281</span>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                </div>
                <div className="text-gray-900 flex items-center">Test</div>
                <div className="text-gray-900 flex items-center">test@example.com</div>
                <div className="text-gray-900 flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Admin
                  </span>
                </div>
                <div className="text-gray-900 flex items-center">2024-10-20</div>
                <div className="flex gap-2 items-center text-right">
                  <button className="text-blue-500 hover:text-blue-600 p-2 rounded transition-colors flex items-center justify-center">
                    <Edit size={20} />
                  </button>
                  <button className="text-red-500 hover:text-red-600 p-2 rounded transition-colors flex items-center justify-center">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
        </div>

        <div className="py-10"></div>
      </div>

      <Footer />
    </div>
  );
}
