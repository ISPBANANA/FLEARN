"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserProfile } from '@/hooks/useUserProfile';
import { userAPI } from '@/lib/api';
import Link from "next/link";
import { UserRound, LogOut, Users, TreePine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePageProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [uuid, setUuid] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileNotFound, setProfileNotFound] = useState<boolean>(false);
  const { profile, isLoading, error } = useUserProfile();
  const router = useRouter();

  // Fetch profile by UUID
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

  // Handle redirects when profile is not found or there's an error
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

  const handleLogout = async () => {
      await logout();
      // Redirect to home page
      window.location.href = '/';
  };

  // Check if the user is viewing their own profile
  const isOwnProfile = profile && profileData && profile.user_id === profileData.user_id;

  return (
    <ProtectedRoute redirectTo="/">
      <div className="min-h-screen bg-white">
        <Nav />

        {/* Main Profile Content */}
        <div className="min-h-screen flex justify-center items-start py-8 px-4">
          <div className="grid gap-4 max-w-6xl w-full mx-auto" style={{ 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gridTemplateRows: 'repeat(5, 1fr)', 
            minHeight: '600px',
            aspectRatio: '5/5' 
          }}>
            {/* Loading state */}
            {profileLoading && (
              <div className="col-span-5 row-span-5 flex justify-center items-center">
                <div className="text-lg text-[#454545]">Loading profile...</div>
              </div>
            )}

            {/* Profile not found */}
            {profileNotFound && (
              <div className="col-span-5 row-span-5 flex justify-center items-center">
                <div className="text-lg text-red-600">Profile not found</div>
              </div>
            )}

            {/* Profile Data */}
            {profileData && !profileLoading && !profileNotFound && (
              <>
                {/* Profile Header - div1 */}
                <div className="flex items-center gap-8 rounded-lg p-4 px-8" style={{ gridArea: '1 / 1 / 2 / 4', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                  <div className="relative w-30 h-30 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    <Image
                      src={profileData.profile_pic || "/Chr/cry.png"}
                      alt="Profile"
                      width={120}
                      height={120}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="mb-6 flex flex-col justify-around">
                    <div className="flex items-center gap-2 py-4">
                      <h1 className="text-4xl font-bold text-purple-600">{profileData.name}</h1>
                      {isOwnProfile && (
                        <button className="text-purple-600 hover:text-purple-800 text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-[#454545] text-sm mb-1">UUID: {profileData.user_id}</p>
                    <p className="text-[#454545] text-sm opacity-70">Join since: {new Date(profileData.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                

                {/* Friends Section - div2 */}
                <div className="rounded-lg p-4 flex flex-col h-full" style={{ gridArea: '2 / 1 / 3 / 4', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#454545]">Friends (NA)</h2>
                    {isOwnProfile && (
                      <button className="text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1">
                        Add Friend
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <ul className="gap-3 flex flex-row overflow-x-auto overflow-y-hidden h-52 items-center py-4 px-1">
                    {['Takoyaki', 'Hong', 'Chiriew', 'RoteeBoy', 'NewFriend', "test"].map((name, index) => (
                      <li key={index} className="text-center h-40 w-32 min-w-32 flex-shrink-0 rounded-lg flex flex-col items-center justify-center" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'}}>
                        <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                          <Image
                            src="/Chr/cry.png"
                            alt={name}
                            width={100}
                            height={100}
                            className="rounded-full object-cover"
                          />
                        </div>
                        <p className="text-sm font-medium text-[#454545]">{name}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Milestones Section - div6 */}
                <div className="rounded-lg p-4" style={{ gridArea: '3 / 1 / 5 / 6', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)', marginTop: '-8px' }}>
                  <div className="flex gap-6 justify-around mb-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-auto h-auto items-center justify-center">
                        <Image
                          src="/Chr/cry.png"
                          alt="Rank"
                          width={100}
                          height={100}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="text-lg text-[#454545]">Streak:</p>
                        <p className="font-semibold text-lg text-[#454545]">{profileData.streak}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-auto h-auto items-center justify-center">
                        <Image
                          src="/Chr/cry.png"
                          alt="Rank"
                          width={100}
                          height={100}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="text-lg text-[#454545]">Completed Tasks:</p>
                        <p className="font-semibold text-lg text-[#454545]">{profileData.completed_task}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-auto h-auto items-center justify-center">
                        <Image
                          src="/Chr/cry.png"
                          alt="Rank"
                          width={100}
                          height={100}
                          className="rounded-full"
                        />
                      </div>
                      <div>
                        <p className="text-lg text-[#454545]">Rank:</p>
                        <p className="font-semibold text-lg text-[#454545]">{profileData.rank}</p>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold mb-4 text-[#454545]">Milestones</h2>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#454545]">Mathematics ({Math.floor(profileData.math_exp / 1000)})</span>
                        <span className="text-sm text-[#454545]">{profileData.math_exp % 1000}/1000 EXPs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${Math.floor(profileData.math_exp / 1000) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#454545]">Physics ({Math.floor(profileData.phy_exp / 1000)})</span>
                        <span className="text-sm text-[#454545]">{profileData.phy_exp % 1000}/1000 EXPs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${Math.floor(profileData.phy_exp / 1000) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#454545]">Chemistry ({Math.floor(profileData.chem_exp / 1000)})</span>
                        <span className="text-sm text-[#454545]">{profileData.chem_exp % 1000}/1000 EXPs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${Math.floor(profileData.chem_exp / 1000) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#454545]">Biology ({Math.floor(profileData.bio_exp / 1000)})</span>
                        <span className="text-sm text-[#454545]">{profileData.bio_exp % 1000}/1000 EXPs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${Math.floor(profileData.bio_exp / 1000) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top FLearners of the Day - div4 */}
                <div className="rounded-lg p-4 flex flex-col h-full" style={{ gridArea: '1 / 4 / 3 / 6', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                  <h2 className="text-lg font-semibold mb-4 text-[#454545]">Top FLearners of the Day</h2>
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-200">
                      <span className="text-sm font-bold text-[#454545]">#1</span>
                      <span className="flex-1 text-sm text-[#454545]">AiTarInwza007</span>
                      <span className="text-sm font-bold text-[#454545]">2950</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <span className="text-sm font-bold text-[#454545]">#2</span>
                      <span className="flex-1 text-sm text-[#454545]">Hong</span>
                      <span className="text-sm font-bold text-[#454545]">1112</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-orange-100 to-orange-200">
                      <span className="text-sm font-bold text-[#454545]">#3</span>
                      <span className="flex-1 text-sm text-[#454545]">Chiriew</span>
                      <span className="text-sm font-bold text-[#454545]">1000</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                      <span className="text-sm font-bold text-[#454545]">#4</span>
                      <span className="flex-1 text-sm text-[#454545]">RoteeBoy</span>
                      <span className="text-sm font-bold text-[#454545]">880</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <span className="text-sm font-bold text-[#454545]">#5</span>
                      <span className="flex-1 text-sm text-[#454545]">Takoyaki</span>
                      <span className="text-sm font-bold text-[#454545]">580</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                      <span className="text-sm font-bold text-[#454545]">#6</span>
                      <span className="flex-1 text-sm text-[#454545]">KanJomKrnnon</span>
                      <span className="text-sm font-bold text-[#454545]">520</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {isOwnProfile && (
                      <button className="w-full bg-purple-50 text-purple-600 py-3 px-4 rounded border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        <Users size={18} />
                        Find Friend
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    )}
                    <button className="w-full bg-green-50 text-green-600 py-3 px-4 rounded border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                      <TreePine size={18} />
                      Garden
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Logout/Profile and Learn Buttons Section - div7 */}
                <div className="rounded-lg py-4 flex gap-4 flex flex-row justify-between" style={{ gridArea: '5 / 1 / 6 / 6'}}>
                  {isOwnProfile ? (
                    <button type="button" onClick={handleLogout} className={`bg-[#ffffff] text-red-500 border border-red-500 hover:text-red-600 hover:border-red-600 py-2 px-4 w-50 rounded transition h-10`}>
                    Logout
                  </button>
                  ) : (
                    <button
                      onClick={() => profile?.user_id && router.push(`/profile/${profile.user_id}`)}
                      className={`bg-[#ffffff] text-red-500 border border-red-500 hover:text-red-600 hover:border-red-600 py-2 px-4 w-50 rounded transition h-10`}
                    >
                      To Profile
                    </button>
                  )}
                  <button className={`bg-purple-500 text-white hover:text-white hover:bg-purple-600 py-2 px-4 w-50 rounded transition h-10`}>
                    Learn
                  </button>
                </div>
              </>
            )}
        </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
