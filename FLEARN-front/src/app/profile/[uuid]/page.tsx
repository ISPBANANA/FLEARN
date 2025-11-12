"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useUserProfile } from '@/hooks/useUserProfile';
import { userAPI, friendsAPI, gardensAPI } from '@/lib/api';
import Link from "next/link";
import { UserRound, LogOut, Users, TreePine, LayoutDashboard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

// Get current date in Bangkok timezone
const getBangkokDate = () => {
  return new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Bangkok' });
};

interface ProfilePageProps {
  params: Promise<{
    uuid: string;
  }>;
}

interface FriendData {
  friend_user_id: string;
  friend_name: string;
  friend_email: string;
  friend_profile_pic: string;
  status: string;
  created_at: string;
  row_id: string;
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
  const [friendsData, setFriendsData] = useState<FriendData[]>([]);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [pendingFriendRequestsCount, setPendingFriendRequestsCount] = useState<number>(0);
  const [pendingGardenInvitesCount, setPendingGardenInvitesCount] = useState<number>(0);
  const { profile, isLoading, error } = useUserProfile();
  const pathname = usePathname();
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

  // Fetch friends data for the current profile user
  const fetchFriends = async (userId: string) => {
    if (!userId) return;

    setFriendsLoading(true);
    setFriendsError(null);

    try {
      // Get friends for the specific user using the new API endpoint
      const friendsResponse = await friendsAPI.getFriendsByUserId(userId);
      const friendships = friendsResponse.friends || [];
      
      // The backend already filters for accepted status and returns the correct friend data
      // No additional filtering needed since we're getting friends for a specific user
      const friendsData = friendships.map((friendship: any) => ({
        friend_user_id: friendship.friend_user_id,
        friend_name: friendship.friend_name,
        friend_email: friendship.friend_email,
        friend_profile_pic: friendship.friend_profile_pic,
        status: friendship.status,
        created_at: friendship.created_at,
        row_id: friendship.row_id
      }));

      setFriendsData(friendsData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch friends";
      setFriendsError(errorMessage);
      setFriendsData([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  // Fetch pending friend requests count for the authenticated user
  const fetchPendingFriendRequests = async () => {
    if (!profile?.user_id) return;

    try {
      // Get all friendships for the authenticated user
      const friendsResponse = await friendsAPI.getFriends();
      const friendships = friendsResponse.friends || [];
      
      // Count pending requests where the current user is user1_id (receiver)
      const pendingCount = friendships.filter((friendship: any) => 
        friendship.status === 'pending' && friendship.user1_id === profile.user_id
      ).length;

      setPendingFriendRequestsCount(pendingCount);
    } catch (err: unknown) {
      console.error("Failed to fetch pending friend requests:", err);
      setPendingFriendRequestsCount(0);
    }
  };

  // Fetch pending garden invitations count for the authenticated user
  const fetchPendingGardenInvites = async () => {
    if (!profile?.user_id) return;

    try {
      // Get all gardens for the authenticated user
      const gardensResponse = await gardensAPI.getGardens();
      const gardens = gardensResponse.gardens || [];
      
      // Count pending invitations where the current user is user1_id (receiver)
      const pendingCount = gardens.filter((garden: any) => 
        garden.status === 'pending' && garden.user1_id === profile.user_id
      ).length;

      setPendingGardenInvitesCount(pendingCount);
    } catch (err: unknown) {
      console.error("Failed to fetch pending garden invites:", err);
      setPendingGardenInvitesCount(0);
    }
  };

  useEffect(() => {
    params.then((resolvedParams) => {
      setUuid(resolvedParams.uuid);
      // Fetch profile data when UUID is available
      if (resolvedParams.uuid) {
        fetchProfileByUuid(resolvedParams.uuid);
        // Fetch friends data for this user
        fetchFriends(resolvedParams.uuid);
      }
    });
    // Fetch leaderboard data
    fetchLeaderboard();
    
    // Fetch pending requests for authenticated user (only if profile is loaded)
    if (profile?.user_id) {
      fetchPendingFriendRequests();
      fetchPendingGardenInvites();
    }
  }, [params, profile]);

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
        
      //   // Optional: Show success message
      //   console.log('Profile updated successfully:', response.user);
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
      <div className="min-h-screen bg-white flex flex-col">
        <Nav />

        {/* Main Profile Content */}
        <div className="flex-1 flex justify-center items-start py-4 px-4 lg:py-8 overflow-y-auto">
          <div className="flex flex-col gap-4 max-w-6xl w-full mx-auto lg:grid lg:gap-4" style={{ 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gridTemplateRows: 'auto',
          }}>
            {/* Loading state */}
            {profileLoading && (
              <div className="flex justify-center items-center py-12 lg:col-span-5 lg:row-span-5">
                <div className="text-lg text-[#454545]">Loading profile...</div>
              </div>
            )}

            {/* Profile not found */}
            {profileNotFound && (
              <div className="flex justify-center items-center py-12 lg:col-span-5 lg:row-span-5">
                <div className="text-lg text-red-600">Profile not found</div>
              </div>
            )}

            {/* Profile Data */}
            {profileData && !profileLoading && !profileNotFound && (
              <>
                {/* Profile Header - div1 */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 rounded-lg p-4 px-4 sm:px-8 lg:col-start-1 lg:col-end-4 lg:row-start-1 lg:row-end-2" style={{ 
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
                }}>
                    <div className="relative w-20 h-20 sm:w-30 sm:h-30 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image
                        src={profileData.profile_pic || "/Chr/cry.png"}
                        alt="Profile"
                        width={120}
                        height={120}
                        className="rounded-full object-cover"
                      />
                    </div>
                  <div className="flex flex-col justify-around text-center sm:text-left min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 py-2 sm:py-4">
                      <h1 className="text-2xl sm:text-4xl font-bold text-purple-600 break-words">{profileData.name}</h1>
                      {isOwnProfile && (
                        <button 
                          onClick={() => {
                            setEditDisplayName(profileData.name || '');
                            setTempProfilePicture(''); // Reset temporary profile picture
                            setShowEditPopup(true);
                          }}
                          className="cursor-pointer text-purple-600 hover:text-purple-800 text-sm mt-1 sm:mt-0"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-[#454545] text-xs sm:text-sm mb-1 break-all">UUID: {profileData.user_id}</p>
                    <p className="text-[#454545] text-xs sm:text-sm opacity-70">Join since: {new Date(profileData.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                

                {/* Friends Section - div2 */}
                <div className="rounded-lg p-4 flex flex-col lg:col-start-1 lg:col-end-4 lg:row-start-2 lg:row-end-3" style={{ 
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-[#454545]">
                      Friends ({friendsLoading ? '...' : friendsData.length})
                    </h2>
                    {isOwnProfile && (
                      <Link href="/search">
                        <button className="cursor-pointer text-purple-600 hover:text-purple-800 text-sm flex items-center gap-1">
                          Add Friend
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </Link>
                    )}
                  </div>
                  <ul className="gap-3 flex flex-row overflow-x-auto overflow-y-hidden min-h-[10rem] sm:min-h-[13rem] max-h-[13rem] sm:max-h-[15rem] items-center py-4 px-1">
                    {friendsLoading ? (
                      <li className="flex items-center justify-center w-full">
                        <span className="text-sm text-[#454545]">Loading friends...</span>
                      </li>
                    ) : friendsError ? (
                      <li className="flex items-center justify-center w-full">
                        <span className="text-sm text-red-500">Failed to load friends</span>
                      </li>
                    ) : friendsData.length === 0 ? (
                      <li className="flex items-center justify-center w-full">
                        <span className="text-sm text-[#454545]">No friends yet</span>
                      </li>
                    ) : (
                      friendsData.map((friend, index) => (
                        <li 
                          key={friend.friend_user_id} 
                          className="text-center h-32 w-24 min-w-24 sm:h-40 sm:w-32 sm:min-w-32 flex-shrink-0 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" 
                          style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'}}
                          onClick={() => router.push(`/profile/${friend.friend_user_id}`)}
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden">
                            <Image
                              src={friend.friend_profile_pic || "/Chr/cry.png"}
                              alt={friend.friend_name}
                              width={80}
                              height={80}
                              className="rounded-full object-cover"
                            />
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-[#454545] truncate w-full px-1 sm:px-2" title={friend.friend_name}>
                            {friend.friend_name}
                          </p>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Milestones Section - div6 */}
                <div className="rounded-lg p-4 lg:col-start-1 lg:col-end-6 lg:row-start-3 lg:row-end-5 lg:-mt-2 overflow-hidden" style={{ 
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
                }}>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-around mb-4 py-2 flex-wrap">
                    <div className="flex items-center justify-start gap-3 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={(() => {
                            if (!profileData?.uptime_streak) return "/stopSteak.png";
                            const today = getBangkokDate();
                            const streakDate = new Date(profileData.uptime_streak).toLocaleDateString('en-US', { timeZone: 'Asia/Bangkok' });
                            return streakDate === today ? "/onSteak.png" : "/stopSteak.png";
                          })()}
                          alt="Streak"
                          width={64}
                          height={64}
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className="text-sm sm:text-base text-[#454545]">Streak:</p>
                        <p className="font-semibold text-base sm:text-lg text-[#454545]">{profileData.streak}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-start gap-3 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
                        <Image
                          src="/Chr/Clap.PNG"
                          alt="Completed Tasks"
                          width={64}
                          height={64}
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className="text-sm sm:text-base text-[#454545]">Completed Tasks:</p>
                        <p className="font-semibold text-base sm:text-lg text-[#454545]">{profileData.completed_task}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-start gap-3 min-w-0">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={`/rank/${profileData.rank}.PNG`}
                          alt="Rank"
                          width={64}
                          height={64}
                          className="w-full h-full object-contain rounded-full"
                        />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <p className="text-sm sm:text-base text-[#454545]">Rank:</p>
                        <p className="font-semibold text-base sm:text-lg text-[#454545]">{profileData.rank}</p>
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
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${Math.floor(profileData.math_exp % 1000)/10}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#454545]">Physics ({Math.floor(profileData.phy_exp / 1000)})</span>
                        <span className="text-sm text-[#454545]">{profileData.phy_exp % 1000}/1000 EXPs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${Math.floor(profileData.phy_exp % 1000)/10}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#454545]">Chemistry ({Math.floor(profileData.chem_exp / 1000)})</span>
                        <span className="text-sm text-[#454545]">{profileData.chem_exp % 1000}/1000 EXPs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${Math.floor(profileData.chem_exp % 1000)/10}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-[#454545]">Biology ({Math.floor(profileData.bio_exp / 1000)})</span>
                        <span className="text-sm text-[#454545]">{profileData.bio_exp % 1000}/1000 EXPs</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${Math.floor(profileData.bio_exp % 1000)/10}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top FLearners of the Day - div4 */}
                <div className="rounded-lg p-4 flex flex-col lg:col-start-4 lg:col-end-6 lg:row-start-1 lg:row-end-3" style={{ 
                  boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)'
                }}>
                  <h2 className="text-lg font-semibold mb-4 text-[#454545]">Top FLearners of the Day</h2>
                  {/* Scoreboard top 50 */}
                  <ul className="space-y-2 flex-grow mb-4 overflow-y-auto pr-2 max-h-40 sm:max-h-52">
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
                            <span className="flex-1 text-sm text-[#454545] truncate">{user.name || 'Unknown User'}</span>
                            <span className="text-sm font-bold text-[#454545]">{user.daily_exp || 0}</span>
                          </li>
                        );
                      })
                    )}
                  </ul>

                  <div className="space-y-3 flex flex-col gap-1">
                    {isOwnProfile && (
                      <>
                        <Link href="/search">
                          <button className="cursor-pointer w-full bg-purple-50 text-purple-600 py-3 px-4 rounded border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium relative">
                            <Users size={18} />
                            Find Friend
                            {pendingFriendRequestsCount > 0 && (
                              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                            <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </Link>
                        <Link href={`${pathname}/dashboard`}>
                          <button className="cursor-pointer w-full bg-purple-50 text-purple-600 py-3 px-4 rounded border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                            <LayoutDashboard size={18} />
                            Learning Dashboard
                            <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </Link>
                      </>
                    )}

                    <Link href={`${pathname}/garden`}>
                      <button className="cursor-pointer w-full bg-green-50 text-green-600 py-3 px-4 rounded border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium relative">
                        <TreePine size={18} />
                        Garden
                        {pendingGardenInvitesCount > 0 && (
                          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Logout/Profile and Learn Buttons Section - div7 */}
                <div className="py-4 flex gap-4 flex-col sm:flex-row justify-between lg:col-start-1 lg:col-end-6 lg:row-start-5 lg:row-end-6">
                  {isOwnProfile ? (
                    <button type="button" onClick={handleLogout} className={`cursor-pointer bg-[#ffffff] text-red-500 border border-red-500 hover:text-red-600 hover:border-red-600 py-2 px-4 w-full rounded transition h-10`}>
                    Logout
                  </button>
                  ) : (
                    <button
                      onClick={() => profile?.user_id && router.push(`/profile/${profile.user_id}`)}
                      className={`cursor-pointer bg-[#ffffff] text-red-500 border border-red-500 hover:text-red-600 hover:border-red-600 py-2 px-4 w-full rounded transition h-10`}
                    >
                      To Profile
                    </button>
                  )}
                  <Link href="/learn" className="w-full">
                    <button className={`cursor-pointer bg-purple-500 text-white hover:text-white hover:bg-purple-600 py-2 px-4 w-full rounded transition h-10`}>
                      Learn
                    </button>
                  </Link>
                </div>
              </>
            )}
        </div>
        </div>
        <Footer />

        {/* Profile Edit Popup */}
        {showEditPopup && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditPopup(false);
            }
          }}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-xl relative my-auto" onClick={(e) => e.stopPropagation()}>
              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-purple-600 text-center mb-6 sm:mb-8">Edit Profile</h2>
              
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden mb-4">
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
                  className="cursor-pointer text-purple-600 hover:text-purple-800 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Upload file
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3 3-3M12 12l0 9" />
                  </svg>
                </button>
              </div>

              {/* Display Name Input */}
              <div className="mb-6 sm:mb-8">
                <label className="block text-[#454545] font-medium mb-2 text-sm sm:text-base">Display Name :</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Ex: FunLearn"
                  maxLength={15}
                  disabled={isSaving}
                  className="text-[#454545] w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-[#454545] text-xs sm:text-sm mt-1">{editDisplayName.length}/15 characters</p>
                {saveError && (
                  <p className="text-red-500 text-xs sm:text-sm mt-2">{saveError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setShowEditPopup(false);
                    setSaveError(null);
                    setTempProfilePicture('');
                  }}
                  disabled={isSaving}
                  className="cursor-pointer w-full py-2 sm:py-3 px-4 sm:px-6 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="cursor-pointer w-full py-2 sm:py-3 px-4 sm:px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
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
