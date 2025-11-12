"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";
import React, { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { userAPI, friendsAPI } from "@/lib/api";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRouter } from 'next/navigation';

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  profile_pic: string | null;
  created_at: string;
  friendship_status: "pending" | "none" | "accepted" | "blocked";
  friendship_id?: string;
}

interface FriendProfile {
  friend_user_id: string;
  friend_name: string;
  friend_email: string;
  friend_profile_pic: string;
  status: string;
  created_at: string;
  row_id: string;
  user1_id?: string;
  user2_id?: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendProfile[]>([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [showRequests, setShowRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);
  const router = useRouter();
  
  // Get current user profile to access user_id
  const { profile: currentUserProfile } = useUserProfile();

  // Load all users on component mount
  useEffect(() => {
    if (!hasLoadedInitial) {
      loadAllUsers();
    }
  }, [hasLoadedInitial]);

  // Fetch pending requests count on component mount
  useEffect(() => {
    if (currentUserProfile?.user_id) {
      fetchPendingRequestsCount();
    }
  }, [currentUserProfile]);

  // Auto-search effect with debounce
  useEffect(() => {
    if (!hasLoadedInitial || showRequests) return; // Don't auto-search until initial load is complete or if showing requests

    const timeoutId = setTimeout(() => {
      if (!searchTerm.trim()) {
        loadAllUsersAutoSearch();
      } else {
        handleAutoSearch();
      }
    }, 150); // 150ms debounce delay - faster response for single character searches

    return () => clearTimeout(timeoutId);
  }, [searchTerm, hasLoadedInitial, showRequests]);

  // Fetch pending requests count (for notification dot)
  const fetchPendingRequestsCount = async () => {
    if (!currentUserProfile || !currentUserProfile.user_id) return;
    
    try {
      const friendsData = await friendsAPI.getFriends();
      const friendships: FriendProfile[] = friendsData.friends || [];
      
      // Count pending requests where the current user is the recipient (user1_id)
      const count = friendships.filter(f => 
        f.status === 'pending' && f.user1_id === currentUserProfile.user_id
      ).length;
      
      setPendingRequestsCount(count);
    } catch (err: unknown) {
      console.error("Failed to fetch pending requests count:", err);
      setPendingRequestsCount(0);
    }
  };

  // Request handler: show pending friend requests
  const handleShowRequests = async () => {
    setIsLoading(true);
    setError(null);
    setShowRequests(true);
    setSearchResults([]);
    try {
      // Get current user ID from profile
      if (!currentUserProfile || !currentUserProfile.user_id) {
        setError("Unable to get current user information");
        return;
      }
      
      const friendsData = await friendsAPI.getFriends();
      const friendships: FriendProfile[] = friendsData.friends || [];
      
      // Only show requests where status is 'pending' and the current user is the recipient (user1_id)
      // NOT where the current user is the sender (user2_id)
      const pending = friendships.filter(f => 
        f.status === 'pending' && f.user1_id === currentUserProfile.user_id
      );
      setPendingRequests(pending);
      setPendingRequestsCount(pending.length); // Update count
      if (pending.length === 0) {
        setError("No pending requests");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch requests";
      setError(errorMessage);
      setPendingRequests([]);
      setPendingRequestsCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user status in results
  const updateUserStatus = (userId: string, newStatus: "pending" | "none" | "accepted" | "blocked") => {
    setSearchResults((prevResults) =>
      prevResults.map((user) =>
        user.user_id === userId ? { ...user, friendship_status: newStatus } : user
      )
    );
  };

  // Load all users function (for auto-search)
  const loadAllUsersAutoSearch = async () => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      const allUsersData = await userAPI.getAllUsers(50, 0);
      const users: UserProfile[] = allUsersData.users || [];
      
      setSearchResults(users);
      if (users.length === 0) {
        setError("No users found");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while loading users";
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load all users function
  const loadAllUsers = async () => {
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setShowRequests(false);
    
    try {
      const allUsersData = await userAPI.getAllUsers(50, 0);
      const users: UserProfile[] = allUsersData.users || [];
      
      setSearchResults(users);
      setHasLoadedInitial(true);
      if (users.length === 0) {
        setError("No users found");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while loading users";
      setError(errorMessage);
      setSearchResults([]);
      setHasLoadedInitial(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto search handler (for real-time search)
  const handleAutoSearch = async () => {
    // Only auto-search if we're not showing requests
    if (showRequests) return;
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    
    try {
      const searchData = await userAPI.searchUsers(searchTerm);
      const users: UserProfile[] = searchData.users || [];
      
      setSearchResults(users);
      if (users.length === 0) {
        setError("No users found");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while searching";
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search handler
  const handleSearch = async () => {
    // If search term is empty, load all users
    if (!searchTerm.trim()) {
      loadAllUsers();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setShowRequests(false);
    
    try {
      const searchData = await userAPI.searchUsers(searchTerm);
      const users: UserProfile[] = searchData.users || [];
      
      setSearchResults(users);
      if (users.length === 0) {
        setError("No users found");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while searching";
      setError(errorMessage);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Friend request handler
  const handleFriendRequest = async (user: UserProfile) => {
    if (user.friendship_status === "pending") return;
    try {
      await friendsAPI.sendFriendRequest(user.user_id);
      updateUserStatus(user.user_id, "pending");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send friend request";
      setError(errorMessage);
    }
  };

  // Accept friend request handler
  const handleAcceptRequest = async (request: FriendProfile) => {
    try {
      // console.log('Accepting friend request:', request.row_id);
      await friendsAPI.acceptFriendRequest(request.row_id);
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(r => r.row_id !== request.row_id));
      // Update count
      setPendingRequestsCount(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      console.error('Error accepting friend request:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to accept friend request";
      setError(errorMessage);
    }
  };

  // Reject friend request handler
  const handleRejectRequest = async (request: FriendProfile) => {
    try {
      //console.log('Rejecting friend request:', request.row_id);
      await friendsAPI.blockFriendRequest(request.row_id);
      // Remove from pending requests
      setPendingRequests(prev => prev.filter(r => r.row_id !== request.row_id));
      // Update count
      setPendingRequestsCount(prev => Math.max(0, prev - 1));
    } catch (err: unknown) {
      console.error('Error rejecting friend request:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to reject friend request";
      setError(errorMessage);
    }
  };

  return (
    <ProtectedRoute redirectTo="/">
      <div className="min-h-screen bg-white">
        <Nav />
        <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
          <div className="w-full max-w-6xl mt-8">
            <button
              onClick={() => router.push(`/profile/${currentUserProfile?.user_id}` || '/')}
              className="cursor-pointer flex items-center gap-2 mb-4 text-gray-600 hover:text-purple-600 transition-colors"
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
          <div className="relative w-full max-w-6xl">
            <input
              type="text"
              placeholder="Search by name, or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (!searchTerm.trim()) {
                    loadAllUsers();
                  } else {
                    handleSearch();
                  }
                }
              }}
              className="w-full px-6 py-2 text-gray-600 border-1 border-gray-300 rounded-2xl focus:outline-none placeholder-gray-400 shadow-md"
            />
            <button
              onClick={handleSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer hover:text-purple-600 transition-colors"
            >
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
          <div className="w-full max-w-6xl mt-12 flex justify-start">
            <div className="flex gap-2">
              <button
                onClick={() => { 
                  setShowRequests(false); 
                  if (!searchTerm.trim()) {
                    loadAllUsers();
                  } else {
                    handleSearch();
                  }
                }}
                className={`px-8 py-1 bg-white rounded-xl transition-colors shadow-md ${
                  !showRequests 
                    ? "cursor-pointer text-purple-500 border border-purple-500 hover:border-purple-600 hover:text-purple-600" 
                    : "cursor-pointer text-[#454545] border border-[#454545] hover:border-gray-600 hover:text-gray-600"
                }`}
              >
                {!searchTerm.trim() ? 'All Users' : 'Search'}
              </button>
              <button
                onClick={handleShowRequests}
                className={`px-8 py-1 bg-white rounded-xl transition-colors shadow-md relative ${
                  showRequests 
                    ? "cursor-pointer text-purple-500 border border-purple-500 hover:border-purple-600 hover:text-purple-600" 
                    : "cursor-pointer text-[#454545] border border-[#454545] hover:border-gray-600 hover:text-gray-600"
                }`}
              >
                Request
                {pendingRequestsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>
          </div>
          {/* Loading and Error States */}
          {isLoading && (
            <div className="w-full max-w-6xl mt-8 text-center">
              <p className="text-gray-600">Loading...</p>
            </div>
          )}
          {error && (
            <div className="w-full max-w-6xl mt-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {/* Search Results or Requests */}
          {!isLoading && !showRequests && searchResults.length > 0 && (
            <div className="w-full max-w-6xl mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <div key={user.user_id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer" onClick={() => router.push(`/profile/${user.user_id}`)}>
                    <div className="flex items-start space-x-4">
                      <div className="relative w-16 h-16 rounded-full flex-shrink-0 overflow-hidden">
                        {user.profile_pic ? (
                          <Image
                            src={user.profile_pic}
                            alt={user.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 gap-1">
                        <p className="text-purple-600 font-semibold truncate text-xl">{user.name}</p>
                        <p className="text-xs text-[#454545] font-medium">{user.user_id}</p>
                        <p className="text-xs text-[#454545]">Joined: {new Date(user.created_at || "").toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFriendRequest(user);
                        }}
                        className={`px-10 py-1 text-sm rounded-full ${
                          user.friendship_status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                            : user.friendship_status === "accepted"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "cursor-pointer bg-white text-[#454545] border border-[#454545] hover:border-purple-400 hover:text-purple-500"
                        } transition-colors`}
                        disabled={user.friendship_status === "pending" || user.friendship_status === "accepted"}
                      >
                        {user.friendship_status === "pending" 
                          ? "Pending" 
                          : user.friendship_status === "accepted" 
                          ? "Friends" 
                          : "Add"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!isLoading && showRequests && pendingRequests.length > 0 && (
            <div className="w-full max-w-6xl mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pendingRequests.map((req) => (
                  <div key={req.friend_user_id} className="bg-white rounded-lg p-4 shadow-md border border-gray-200 cursor-pointer" onClick={() => router.push(`/profile/${req.friend_user_id}`)}>
                    <div className="flex items-start space-x-4">
                      <div className="relative w-16 h-16 rounded-full flex-shrink-0 overflow-hidden">
                        {req.friend_profile_pic ? (
                          <Image
                            src={req.friend_profile_pic}
                            alt={req.friend_name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-purple-600 font-semibold text-xl truncate">{req.friend_name}</p>
                        <p className="text-xs font-medium text-[#454545]">{req.friend_user_id}</p>
                        <p className="text-xs text-[#454545]">Requested: {new Date(req.created_at || "").toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptRequest(req);
                        }}
                        className="cursor-pointer px-4 py-1 text-sm rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectRequest(req);
                        }}
                        className="cursor-pointer px-4 py-1 text-sm rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
