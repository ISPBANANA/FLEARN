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
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false);
  const [editDisplayName, setEditDisplayName] = useState<string>('');
  const [tempProfilePicture, setTempProfilePicture] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState<boolean>(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
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

  // Fetch leaderboard data
  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    setLeaderboardError(null);

    try {
      const data = await userAPI.getLeaderboard();
      setLeaderboardData(data.users || []);
    } catch (err) {
      if (err instanceof Error) {
        setLeaderboardError(err.message);
      } else {
        setLeaderboardError('Failed to fetch leaderboard');
      }
    } finally {
      setLeaderboardLoading(false);
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
    // Fetch leaderboard data
    fetchLeaderboard();
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

  // Handle file upload and convert to base64
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setTempProfilePicture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle saving profile changes
  const handleSaveProfile = async () => {
    try {
      // Validation: Check if current user is authorized to edit this profile
      if (!profile || !profileData) {
        setSaveError('Unable to verify user permissions');
        return;
      }

      // Check if the current user's ID matches the profile being edited
      if (profile.user_id !== profileData.user_id) {
        setSaveError('You can only edit your own profile');
        return;
      }

      // Check if there are any changes to save
      const hasNameChange = editDisplayName.trim() !== (profileData.name || '');
      const hasPictureChange = tempProfilePicture !== '';

      if (!hasNameChange && !hasPictureChange) {
        // No changes, just close the popup
        setShowEditPopup(false);
        return;
      }

      setIsSaving(true);
      setSaveError(null);

      // Prepare update data - only send the fields that are being changed
      const updateData: any = {};

      if (hasNameChange) {
        updateData.name = editDisplayName.trim();
      }

      if (hasPictureChange) {
        updateData.profile_pic = tempProfilePicture;
      }

      // Call the new API endpoint that only updates profile picture and name
      const response = await userAPI.updateProfileBasic(updateData);

      // Update local profile data with the response
      if (response.user) {
        setProfileData(response.user);
        
        // Reset temporary states
        setTempProfilePicture('');
        setEditDisplayName('');
        
        // Close popup
        setShowEditPopup(false);
        
        // Optional: Show success message
        console.log('Profile updated successfully:', response.user);
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('Failed to save profile changes');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Check if the user is viewing their own profile
  const isOwnProfile = profile && profileData && profile.user_id === profileData.user_id;

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showEditPopup) {
        setShowEditPopup(false);
      }
    };

    if (showEditPopup) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showEditPopup]);

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
                    <div className="flex items-start gap-2 py-4">
                      <h1 className="text-4xl font-bold text-purple-600">{profileData.name}</h1>
                      {isOwnProfile && (
                        <button 
                          onClick={() => {
                            setEditDisplayName(profileData.name || '');
                            setTempProfilePicture(''); // Reset temporary profile picture
                            setShowEditPopup(true);
                          }}
                          className="text-purple-600 hover:text-purple-800 text-sm"
                        >
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
                          src={(() => {
                            if (!profileData?.uptime_streak) return "/stopSteak.png";
                            const today = new Date().toDateString();
                            const streakDate = new Date(profileData.uptime_streak).toDateString();
                            return streakDate === today ? "/onSteak.png" : "/stopSteak.png";
                          })()}
                          alt="Streak"
                          width={70}
                          height={70}
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
                          src="/Chr/Clap.png"
                          alt="Rank"
                          width={120}
                          height={120}
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
                          src={`/rank/${profileData.rank}.png`}
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
                  {/* Scoreboard top 50 */}
                  <ul className="space-y-2 flex-grow mb-4 overflow-y-auto pr-2 h-52">
                    {leaderboardLoading ? (
                      <li className="flex items-center justify-center p-4">
                        <span className="text-sm text-[#454545]">Loading leaderboard...</span>
                      </li>
                    ) : leaderboardError ? (
                      <li className="flex items-center justify-center p-4">
                        <span className="text-sm text-red-500">Failed to load leaderboard</span>
                      </li>
                    ) : leaderboardData.length === 0 ? (
                      <li className="flex items-center justify-center p-4">
                        <span className="text-sm text-[#454545]">No data available</span>
                      </li>
                    ) : (
                      leaderboardData.map((user, index) => {
                        // Get the background color based on rank
                        const getBackgroundClass = (rank: number) => {
                          switch (rank) {
                            case 1:
                              return 'bg-gradient-to-r from-yellow-100 to-yellow-200';
                            case 2:
                              return 'bg-gradient-to-r from-red-100 to-red-200';
                            case 3:
                              return 'bg-gradient-to-r from-orange-100 to-orange-200';
                            default:
                              return 'bg-gradient-to-r from-gray-100 to-gray-200';
                          }
                        };

                        return (
                          <li key={index} className={`flex items-center gap-3 p-2 rounded-lg ${getBackgroundClass(index + 1)}`}>
                            <span className="text-sm font-bold text-[#454545]">#{index + 1}</span>
                            <span className="flex-1 text-sm text-[#454545]">{user.name || 'Unknown User'}</span>
                            <span className="text-sm font-bold text-[#454545]">{user.daily_exp || 0}</span>
                          </li>
                        );
                      })
                    )}
                  </ul>

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

        {/* Profile Edit Popup */}
        {showEditPopup && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditPopup(false);
            }
          }}>
            <div className="bg-white rounded-2xl p-8 w-96 shadow-xl relative" onClick={(e) => e.stopPropagation()}>
              {/* Title */}
              <h2 className="text-2xl font-bold text-purple-600 text-center mb-8">Edit Profile</h2>
              
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mb-4">
                  <Image
                    src={tempProfilePicture || profileData?.profile_pic || "/Chr/cry.png"}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                  {/* Default user icon overlay if no profile pic and no temp pic */}
                  {!tempProfilePicture && !profileData?.profile_pic && (
                    <UserRound size={40} className="text-gray-600 absolute" />
                  )}
                </div>
                <input
                  type="file"
                  id="profile-pic-upload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isSaving}
                  className="hidden"
                />
                <button 
                  onClick={() => document.getElementById('profile-pic-upload')?.click()}
                  disabled={isSaving}
                  className="text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload file
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3 3-3M12 12l0 9" />
                  </svg>
                </button>
              </div>

              {/* Display Name Input */}
              <div className="mb-8">
                <label className="block text-[#454545] font-medium mb-2">Display Name :</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Ex: FunLearn"
                  maxLength={15}
                  disabled={isSaving}
                  className="text-[#454545] w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-[#454545] text-sm mt-1">{editDisplayName.length}/15 characters</p>
                {saveError && (
                  <p className="text-red-500 text-sm mt-2">{saveError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowEditPopup(false);
                    setSaveError(null);
                    setTempProfilePicture('');
                  }}
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
