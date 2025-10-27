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
      <div className="min-h-screen bg-white">
        <Nav />
        {/* Infomation here */}
        <div className="my-2 p-4 h-auto w-full flex items-center justify-center align-center z-1 bg-white flex-col min-h-screen">
          <div className="w-full max-w-6xl mt-8">
            <button
              onClick={() => profileData?.user_id && router.push(`/profile/${profileData.user_id}`)}
              className="flex items-center gap-2 mb-4 text-gray-600 hover:text-purple-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
          <div className="w-full max-w-[1620px] items-center flex flex-col px-25 py-2">
            <p className="text-5xl font-bold mb-4 text-[#9A41FF] text-center w-full">{profileData?.name}&rsquo;s Garden</p>

            {/* Error and Loading States */}
            {gardenError && (
              <div className="w-full max-w-6xl mb-4 text-center">
                <p className="text-red-500">{gardenError}</p>
              </div>
            )}

            {gardenLoading && (
              <div className="w-full max-w-6xl mb-4 text-center">
                <p className="text-gray-600">Loading gardens...</p>
              </div>
            )}

            {/* Garden List */}
            <ul className="h-4/5 min-h-[calc(75vh)] flex flex-row flex-wrap justify-center gap-6 w-full max-w-[1420px] px-24 py-4 place-items-start auto-rows-max">
              {/* Pending Garden Invitations (only show to owner) */}
              {isOwner && pendingInvitations.map((invitation) => (
                <li key={`pending-${invitation.row_id}`} className="w-full max-w-[300px] min-w-[300px] min-h-[370px] rounded-lg flex flex-col gap-4 items-center p-5 justify-between border border-yellow-400 bg-yellow-50" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                  <p className="text-2xl font-semibold mb-4 text-center text-[#454545]">{invitation.partner_name}</p>
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-center text-yellow-600 font-medium mb-2">
                      <p>Invitation Received</p>
                    </div>
                    <p className="text-sm text-gray-600 text-center">wants to create a garden with you</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleAcceptInvitation(invitation.row_id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectInvitation(invitation.row_id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}

              {/* Sent Garden Invitations (only show to owner) */}
              {isOwner && sentInvitations.map((invitation) => (
                <li key={`sent-${invitation.row_id}`} className="w-full max-w-[300px] min-w-[300px] min-h-[370px] rounded-lg flex flex-col gap-4 items-center p-5 justify-between border border-orange-400 bg-orange-50" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                  <p className="text-2xl font-semibold mb-4 text-center text-[#454545]">{invitation.partner_name}</p>
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-center text-orange-600 font-medium mb-2">
                      <p>Invitation Sent</p>
                    </div>
                    <p className="text-sm text-gray-600 text-center">Pending invitation...</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleCancelInvitation(invitation.row_id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              ))}

              {/* Active Gardens */}
              {gardens.map((garden) => (
                <li key={garden.row_id} className="w-full max-w-[300px] min-w-[300px] min-h-[370px] rounded-lg flex flex-col gap-4 items-center p-5 justify-between" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                  <p className="text-2xl font-semibold mb-4 text-center text-[#454545]">{garden.partner_name}</p>
                  <div className="flex flex-col items-center gap-2">
                    <Image
                      src={`/garden/tree${Math.min(Math.floor(garden.streak / 30) + 1, 6)}.png`}
                      alt="Garden Plant"
                      width={140}
                      height={140}
                    />
                    <div className="items-center align-center justify-center flex flex-row gap-4">
                      <Image
                        src={(() => {
                            if (!garden?.uptime_streak) return "/stopSteak.png";
                            const today = new Date().toDateString();
                            const streakDate = new Date(garden.uptime_streak).toDateString();
                            return streakDate === today ? "/onSteak.png" : "/stopSteak.png";
                          })()}
                        alt="Streak"
                        width={35}
                        height={35}
                      />
                      <p className="text-center text-lg text-[#454545] h-max">Streak: {garden.streak}</p>
                    </div>
                  </div>
                </li>
              ))}

              {/* Add/Invite/Accept/Request - Only show to owner */}
              {isOwner && (
                <li className="w-full max-w-[300px] min-w-[300px] min-h-[370px] rounded-lg flex flex-col gap-4 items-center p-5 justify-center border border-dashed border-2 border-[#9A41FF]">
                  <button 
                    onClick={() => {
                      setShowInviteModal(true);
                      fetchFriends();
                    }}
                    className="text-[#454545] cursor-pointer hover:scale-105 transition flex flex-col items-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UserRoundPlus 
                        height={50}
                        width={50}
                      />
                      <p className="text-center text-lg text-[#454545] h-max">Invite Friend</p>
                    </div>
                  </button>
                </li>
              )}

              {/* Show message if no gardens and not owner */}
              {!isOwner && gardens.length === 0 && !gardenLoading && (
                <div className="w-full text-center py-8">
                  <p className="text-gray-600 text-lg">No gardens to display</p>
                </div>
              )}
            </ul>
          </div>
          <div className="py-5"></div>
        </div>

        <Footer />

        {/* Garden Invitation Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-[#454545]">Invite Friend to Garden</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              {friendsLoading ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">Loading friends...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600">No friends available to invite. Add some friends first!</p>
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      router.push('/search');
                    }}
                    className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Find Friends
                  </button>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {friends.map((friend) => (
                    <div key={friend.friend_user_id} className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden">
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
                        <div>
                          <p className="font-semibold text-xl text-purple-500">{friend.friend_name}</p>
                          <p className="text-xs text-[#454545]">{friend.friend_user_id}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendInvitation(friend.friend_email)}
                        disabled={inviteLoading}
                        className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
