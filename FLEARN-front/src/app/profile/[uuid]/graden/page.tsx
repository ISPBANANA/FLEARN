"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";
import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { FileUp, Asterisk } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SessionManager } from '@/lib/session';
import SignupSearchParamsHandler from '@/components/SignupSearchParamsHandler';
import { useAPIWithCORSHandling } from '@/hooks/useCORS';
import { CORSErrorDisplay } from '@/components/CORSErrorHandler';

// Force dynamic rendering to avoid build-time issues with useSearchParams
export const dynamic = 'force-dynamic';

// Get API base URL for backend calls
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099';
};

const API_BASE_URL = getApiBaseUrl();

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Infomation here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">

      <div className="py-10"></div>
      </div>

      <Footer />
    </div>
  );
}
