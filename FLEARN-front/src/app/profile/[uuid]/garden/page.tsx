"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Footer } from "@/components/footer";
import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useAPIWithCORSHandling } from '@/hooks/useCORS';
import { CORSErrorDisplay } from '@/components/CORSErrorHandler';
import { useAuth } from "@/hooks/useAuth";
import { userAPI } from '@/lib/api';
import { UserRoundPlus } from 'lucide-react';

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

interface ProfilePageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default function garden({ params }: ProfilePageProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [uuid, setUuid] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileNotFound, setProfileNotFound] = useState<boolean>(false);

  const fetchProfileByUuid = async (userId: string) => {
      if (!userId) return;
  
      setProfileLoading(true);
      setProfileError(null);
      setProfileNotFound(false);
  
      try {
        const data = await userAPI.getProfileById(userId);
        setProfileData(data.user);
        setProfileNotFound(false);
      } catch (err) {
        if (err instanceof Error) {
          if (err.message.includes('404')) {
            setProfileNotFound(true);
            setProfileData(null);
          } else if (err.message.includes('401') || err.message.includes('Unauthorized')) {
            setProfileError('Authentication required. Please login again.');
          } else {
            setProfileError(err.message);
          }
        } else {
          setProfileError('Failed to fetch profile');
        }
      } finally {
        setProfileLoading(false);
      }
    };

    useEffect(() => {
      params.then((resolvedParams) => {
        setUuid(resolvedParams.uuid);
        // Fetch profile data when UUID is available
        if (resolvedParams.uuid) {
          fetchProfileByUuid(resolvedParams.uuid);
        }
      });
    }, [params]);

    useEffect(() => {
      if (profileNotFound && !profileLoading) {
        const timer = setTimeout(() => {
          router.push('/not-found');
        }, 10); // 0.01 second delay to show the error message
        return () => clearTimeout(timer);
      }

      // Only redirect on severe errors, not authentication errors
      if (profileError && !profileError.includes('Authentication') && !profileLoading) {
        const timer = setTimeout(() => {
          router.push('/not-found');
        }, 10); // 0.01 second delay to show the error message
        return () => clearTimeout(timer);
      }
    }, [profileNotFound, profileError, profileLoading, router]);

  return (
    <ProtectedRoute redirectTo="/">
      <div className="min-h-screen bg-white">
        <Nav />
        {/* Infomation here */}
        <div className="my-2 p-4 h-auto w-full flex items-center justify-center align-center z-1 bg-white flex-col min-h-screen">
          <div className="w-full max-w-[1620px] items-center flex flex-col px-25 py-7">
            <p className="text-5xl font-bold mb-4 text-[#9A41FF] text-center w-full">{profileData?.name}&rsquo;s Garden</p>

            {/* Garden List */}
            <ul className="h-4/5 min-h-[calc(75vh)] flex flex-row flex-wrap justify-center gap-6 w-full max-w-[1420px] px-24 py-4 place-items-start auto-rows-max">
              {/* Template */}
              <li className="w-full max-w-[300px] min-w-[300px] min-h-[370px] rounded-lg flex flex-col gap-4 items-center p-5 justify-between" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                <p className="text-2xl font-semibold mb-4 text-center text-[#454545]">Name</p>
                <div className="flex flex-col items-center gap-2">
                  <Image
                    src="/garden/plant1.png"
                    alt="Plant 1"
                    width={140}
                    height={140}
                  />
                  <div className="items-center align-center justify-center flex flex-row gap-4">
                    <Image
                      src="/stopSteak.png"
                      alt="Plant 1"
                      width={35}
                      height={35}
                    />
                    <p className="text-center text-lg text-[#454545] h-max">Steak: NA</p>
                  </div>
                </div>
              </li>

              {/* Add/Invite/Accept/Request */}
              <li className="w-full max-w-[300px] min-w-[300px] min-h-[370px] rounded-lg flex flex-col gap-4 items-center p-5 justify-center border border-dashed border-2 border-[#9A41FF]">
                <button className="text-[#454545] cursor-pointer hover:scale-105 transition flex flex-col items-center">
                  <div className="flex flex-col items-center gap-2">
                    <UserRoundPlus 
                      height={50}
                      width={50}
                    />
                    <p className="text-center text-lg text-[#454545] h-max">Invite Friend</p>
                  </div>
                </button>
              </li>

            </ul>
            <div className="h-1/5 my-10 justify-start flex w-full max-w-[1420px] px-24">
              <button
                onClick={() => profileData?.user_id && router.push(`/profile/${profileData.user_id}`)}
                className={`bg-[#ffffff] text-[#454545] border border-[#454545] py-2 px-4 w-50 rounded transition h-10 cursor-pointer`}
              >
                To Profile
              </button>
            </div>
          </div>
          <div className="py-5"></div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
