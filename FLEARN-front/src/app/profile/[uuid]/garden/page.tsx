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
import { userAPI, gardensAPI, friendsAPI } from '@/lib/api';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserRoundPlus, X } from 'lucide-react';

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

interface Garden {
  row_id: string;
  status: 'active' | 'pending' | 'inactive' | 'completed';
  streak: number;
  uptime_streak: string;
  created_at: string;
  updated_at: string;
  user1_id: string;
  user2_id: string;
  partner_name: string;
  partner_email: string;
  partner_profile_pic: string | null;
  partner_user_id: string;
}

interface Friend {
  friend_user_id: string;
  friend_name: string;
  friend_email: string;
  friend_profile_pic: string | null;
  status: string;
}

export default function garden({ params }: ProfilePageProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { profile: currentUserProfile } = useUserProfile();
  const [uuid, setUuid] = useState<string>('');
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileNotFound, setProfileNotFound] = useState<boolean>(false);
  
  // Garden-related state
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Garden[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Garden[]>([]);
  const [gardenLoading, setGardenLoading] = useState<boolean>(false);
  const [gardenError, setGardenError] = useState<string | null>(null);
  
  // Modal state for inviting friends
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState<boolean>(false);
  const [inviteLoading, setInviteLoading] = useState<boolean>(false);

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

    // Fetch gardens for the user
    const fetchGardens = async (userId: string) => {
      if (!userId) return;
      
      setGardenLoading(true);
      setGardenError(null);
      
      try {
        let data;
        const viewingOwnPage = currentUserProfile?.user_id === userId;
        
        // If viewing own garden page, get all gardens including pending
        if (viewingOwnPage) {
          data = await gardensAPI.getGardens();
        } else {
          // If viewing someone else's garden page, only get their active gardens
          data = await gardensAPI.getGardensByUserId(userId);
        }
        
        const allGardens: Garden[] = data.gardens || [];
        
        // Separate different types of gardens
        const activeGardens = allGardens.filter(garden => garden.status === 'active');
        const incomingPending = allGardens.filter(garden => 
          garden.status === 'pending' && garden.user1_id === userId
        );
        const outgoingPending = allGardens.filter(garden => 
          garden.status === 'pending' && garden.user2_id === userId
        );
        
        setGardens(activeGardens);
        setPendingInvitations(incomingPending);
        setSentInvitations(outgoingPending);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch gardens";
        setGardenError(errorMessage);
        setGardens([]);
        setPendingInvitations([]);
        setSentInvitations([]);
      } finally {
        setGardenLoading(false);
      }
    };

    // Fetch user's friends for invitation modal
    const fetchFriends = async () => {
      setFriendsLoading(true);
      try {
        const data = await friendsAPI.getFriends();
        const friendsList: Friend[] = data.friends || [];
        
        // Only show accepted friends
        const acceptedFriends = friendsList.filter(friend => friend.status === 'accepted');
        setFriends(acceptedFriends);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    };

    // Send garden invitation to a friend
    const handleSendInvitation = async (friendEmail: string) => {
      setInviteLoading(true);
      try {
        await gardensAPI.sendGardenInvitation(friendEmail);
        setShowInviteModal(false);
        // Refresh gardens to show the new pending invitation
        if (uuid) fetchGardens(uuid);
        // Show success message
        setGardenError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to send garden invitation";
        setGardenError(errorMessage);
      } finally {
        setInviteLoading(false);
      }
    };

    // Accept garden invitation
    const handleAcceptInvitation = async (gardenId: string) => {
      try {
        await gardensAPI.acceptGardenInvitation(gardenId);
        // Remove from pending invitations and refresh gardens
        setPendingInvitations(prev => prev.filter(inv => inv.row_id !== gardenId));
        if (uuid) fetchGardens(uuid);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to accept garden invitation";
        setGardenError(errorMessage);
      }
    };

    // Reject garden invitation
    const handleRejectInvitation = async (gardenId: string) => {
      try {
        await gardensAPI.rejectGardenInvitation(gardenId);
        // Remove from pending invitations
        setPendingInvitations(prev => prev.filter(inv => inv.row_id !== gardenId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to reject garden invitation";
        setGardenError(errorMessage);
      }
    };

    // Cancel sent garden invitation
    const handleCancelInvitation = async (gardenId: string) => {
      try {
        await gardensAPI.deleteGarden(gardenId);
        // Remove from sent invitations
        setSentInvitations(prev => prev.filter(inv => inv.row_id !== gardenId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to cancel garden invitation";
        setGardenError(errorMessage);
      }
    };

    // Check if current user is the owner of this garden page
    const isOwner = currentUserProfile?.user_id === uuid;

    useEffect(() => {
      params.then((resolvedParams) => {
        setUuid(resolvedParams.uuid);
        // Fetch profile data when UUID is available
        if (resolvedParams.uuid) {
          fetchProfileByUuid(resolvedParams.uuid);
        }
      });
    }, [params]);

    // Separate useEffect for gardens that waits for currentUserProfile
    useEffect(() => {
      if (uuid && currentUserProfile) {
        fetchGardens(uuid);
      }
    }, [uuid, currentUserProfile]);

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
      <div className="min-h-screen bg-white flex flex-col">
        <Nav />
        {/* Infomation here */}
        <div className="flex-1 px-4 py-6 sm:py-8 lg:py-10 w-full bg-white overflow-y-auto">
          <div className="w-full max-w-6xl mx-auto mb-4 sm:mb-6">
            <button
              onClick={() => profileData?.user_id && router.push(`/profile/${profileData.user_id}`)}
              className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Return to Profile
            </button>
          </div>
          <div className="w-full max-w-7xl mx-auto items-center flex flex-col">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8 lg:mb-10 text-[#9A41FF] text-center w-full px-2">{profileData?.name}&rsquo;s Garden</h1>

            {/* Error and Loading States */}
            {gardenError && (
              <div className="w-full max-w-6xl mb-4 sm:mb-6 text-center px-4">
                <p className="text-red-500 text-sm sm:text-base">{gardenError}</p>
              </div>
            )}

            {gardenLoading && (
              <div className="w-full max-w-6xl mb-4 sm:mb-6 text-center px-4">
                <p className="text-gray-600 text-sm sm:text-base">Loading gardens...</p>
              </div>
            )}

            {/* Garden List */}
            <div className="w-full px-2 sm:px-4 lg:px-6">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto justify-items-center">
                {/* Pending Garden Invitations (only show to owner) */}
                {isOwner && pendingInvitations.map((invitation) => (
                  <li key={`pending-${invitation.row_id}`} className="w-full max-w-[320px] sm:max-w-none min-h-[360px] rounded-lg flex flex-col gap-3 items-center p-5 sm:p-6 justify-between border-2 border-yellow-400 bg-yellow-50 shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl sm:text-2xl font-semibold text-center text-[#454545] break-words w-full">{invitation.partner_name}</h3>
                    <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                      <div className="text-center text-yellow-600 font-medium">
                        <p className="text-base sm:text-lg">Invitation Received</p>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 text-center px-2">wants to create a garden with you</p>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => handleAcceptInvitation(invitation.row_id)}
                        className="cursor-pointer flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectInvitation(invitation.row_id)}
                        className="cursor-pointer flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </li>
                ))}

                {/* Sent Garden Invitations (only show to owner) */}
                {isOwner && sentInvitations.map((invitation) => (
                  <li key={`sent-${invitation.row_id}`} className="w-full max-w-[320px] sm:max-w-none min-h-[360px] rounded-lg flex flex-col gap-3 items-center p-5 sm:p-6 justify-between border-2 border-orange-400 bg-orange-50 shadow-md hover:shadow-lg transition-shadow">
                    <h3 className="text-xl sm:text-2xl font-semibold text-center text-[#454545] break-words w-full">{invitation.partner_name}</h3>
                    <div className="flex flex-col items-center gap-3 flex-1 justify-center">
                      <div className="text-center text-orange-600 font-medium">
                        <p className="text-base sm:text-lg">Invitation Sent</p>
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 text-center px-2">Pending invitation...</p>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => handleCancelInvitation(invitation.row_id)}
                        className="cursor-pointer w-full px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}

                {/* Active Gardens */}
                {gardens.map((garden) => (
                  <li key={garden.row_id} className="w-full max-w-[320px] sm:max-w-none min-h-[360px] rounded-lg flex flex-col gap-3 items-center p-5 sm:p-6 justify-between shadow-md hover:shadow-lg transition-shadow bg-white border border-gray-200">
                    <h3 className="text-xl sm:text-2xl font-semibold text-center text-[#454545] break-words w-full">{garden.partner_name}</h3>
                    <div className="flex flex-col items-center gap-4 flex-1 justify-center">
                      <div className="relative w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40">
                        <Image
                          src={`/garden/tree${Math.min(Math.floor(garden.streak / 30) + 1, 6)}.png`}
                          alt="Garden Plant"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0">
                          <Image
                            src={(() => {
                                if (!garden?.uptime_streak) return "/stopSteak.png";
                                const today = new Date().toDateString();
                                const streakDate = new Date(garden.uptime_streak).toDateString();
                                return streakDate === today ? "/onSteak.png" : "/stopSteak.png";
                              })()}
                            alt="Streak"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-base sm:text-lg font-medium text-[#454545]">Streak: {garden.streak}</p>
                      </div>
                    </div>
                  </li>
                ))}

                {/* Add/Invite/Accept/Request - Only show to owner */}
                {isOwner && (
                  <li className="w-full max-w-[320px] sm:max-w-none min-h-[360px] rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-[#9A41FF] shadow-md hover:shadow-lg transition-all hover:border-solid hover:bg-purple-50">
                    <button 
                      onClick={() => {
                        setShowInviteModal(true);
                        fetchFriends();
                      }}
                      className="text-[#454545] cursor-pointer hover:scale-105 transition-transform flex flex-col items-center p-6"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <UserRoundPlus 
                          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-[#9A41FF]"
                        />
                        <p className="text-center text-base sm:text-lg font-medium text-[#454545]">Invite Friend</p>
                      </div>
                    </button>
                  </li>
                )}
              </ul>

              {/* Show message if no gardens and not owner */}
              {!isOwner && gardens.length === 0 && !gardenLoading && (
                <div className="w-full text-center py-12 sm:py-16">
                  <p className="text-gray-600 text-base sm:text-lg">No gardens to display</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />

        {/* Garden Invitation Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-5 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-4 shadow-2xl my-auto">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-[#454545]">Invite Friend to Garden</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  <X size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              
              {friendsLoading ? (
                <div className="text-center py-8 sm:py-10">
                  <p className="text-gray-600 text-sm sm:text-base">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 sm:py-10">
                  <p className="text-gray-600 text-sm sm:text-base mb-6">No friends available to invite. Add some friends first!</p>
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      router.push('/search');
                    }}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm sm:text-base font-medium"
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                <div className="max-h-60 sm:max-h-72 lg:max-h-96 overflow-y-auto rounded-lg border border-gray-200">
                  {friends.map((friend) => (
                    <div key={friend.friend_user_id} className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0 overflow-hidden bg-gray-200">
                          {friend.friend_profile_pic ? (
                            <Image
                              src={friend.friend_profile_pic}
                              alt={friend.friend_name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-base sm:text-lg text-purple-500 truncate">{friend.friend_name}</p>
                          <p className="text-xs sm:text-sm text-[#454545] truncate">{friend.friend_user_id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendInvitation(friend.friend_email)}
                        disabled={inviteLoading}
                        className="cursor-pointer px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium flex-shrink-0"
                      >
                        {inviteLoading ? "Inviting..." : "Invite"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
