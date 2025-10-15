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
      <div className="p-4 h-auto w-full flex items-center z-1 bg-white flex-col z-1" style={{ boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.25)' }}>
        
        <h1 className="text-2xl font-bold">Welcome to the Admin Panel</h1>
        <p className="mt-2">Here you can manage your application settings and user accounts.</p>

        <div className="py-10"></div>
      </div>

      <Footer />
    </div>
  );
}
