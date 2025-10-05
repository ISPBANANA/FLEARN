"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";
import React, { useState } from "react";

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  profile_pic: string | null;
  created_at: string;
  status?: "pending" | "none" | "accepted";
}

interface FriendProfile {
  friend_user_id: string;
  friend_name: string;
  friend_email: string;
  friend_profile_pic: string;
  status: string;
  created_at: string;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendProfile[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request handler: show pending friend requests
  const handleShowRequests = async () => {
    setIsLoading(true);
    setError(null);
    setShowRequests(true);
    setSearchResults([]);
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const friendsResponse = await fetch("/api/friends", { headers });
      let friendships: FriendProfile[] = [];
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        friendships = friendsData.friends || [];
      }
      
      // Only show requests where status is 'pending' and the current user is the recipient
      const pending = friendships.filter(f => f.status === 'pending');
      setPendingRequests(pending);
      if (pending.length === 0) {
        setError("No pending requests");
      }
    } catch (err: unknown) {
      setError("Failed to fetch requests");
      setPendingRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user status in results
  const updateUserStatus = (userId: string, newStatus: "pending" | "none" | "accepted") => {
    setSearchResults((prevResults) =>
      prevResults.map((user) =>
        user.user_id === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  // Search handler
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Get current user's friends
      const friendsResponse = await fetch("/api/friends", { headers });
      let friendships: FriendProfile[] = [];
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        friendships = friendsData.friends || [];
      }

      // Try to find by UUID first (exact match)
      const users = new Map<string, UserProfile>();
      if (searchTerm.length > 8) {
        const profileResponse = await fetch(`/api/users/profilebyid?id=${encodeURIComponent(searchTerm)}`, { headers });
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          if (data.user) {
            users.set(data.user.user_id, {
              ...data.user,
              status: "none",
            });
          }
        }
      }

      // Try to find by name (partial match) using friends list
      const searchLower = searchTerm.toLowerCase();
      const profilesPromises: Promise<any>[] = [];
      const knownUsers = friendships.map((f) => f.friend_user_id);
      for (const userId of knownUsers) {
        profilesPromises.push(
          fetch(`/api/users/profilebyid?id=${userId}`, { headers }).then((r) => (r.ok ? r.json() : null))
        );
      }
      const profiles = await Promise.all(profilesPromises);
      profiles.forEach((profile) => {
        if (profile?.user) {
          const user = profile.user;
          if (user.name.toLowerCase().includes(searchLower)) {
            users.set(user.user_id, user);
          }
        }
      });

      // Format results with friendship status
      const finalResults: UserProfile[] = Array.from(users.values()).map((user) => {
        const friendship = friendships.find((f) => f.friend_user_id === user.user_id);
        return {
          ...user,
          status: friendship ? (friendship.status as "pending" | "none" | "accepted") : "none",
        };
      });

      setSearchResults(finalResults);
      if (finalResults.length === 0) {
        setError("No users found");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while searching");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Friend request handler
  const handleFriendRequest = async (user: UserProfile) => {
    if (user.status === "pending") return;
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ friend_email: user.email }),
      });
      if (!response.ok) {
        throw new Error("Failed to send friend request");
      }
      updateUserStatus(user.user_id, "pending");
    } catch (err: any) {
      setError(err?.message || "Failed to send friend request");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
        <div className="relative w-full max-w-6xl mt-8">
          <input
            type="text"
            placeholder="UUID / Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
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
              onClick={() => { setShowRequests(false); handleSearch(); }}
              className="px-8 py-1 bg-white text-gray-400 border border-gray-400 rounded-xl hover:border-gray-600 hover:text-gray-600 transition-colors shadow-md"
            >
              Search
            </button>
            <button
              onClick={handleShowRequests}
              className="px-8 py-1 bg-white text-gray-400 border border-gray-400 rounded-xl hover:border-gray-600 hover:text-gray-600 transition-colors shadow-md"
            >
              Request
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
                <div key={user.user_id} className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-purple-600 font-medium truncate">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">Joined: {new Date(user.created_at || "").toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleFriendRequest(user)}
                      className={`px-4 py-1 text-sm rounded-full ${
                        user.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                          : "bg-white text-gray-600 border border-gray-300 hover:border-purple-400 hover:text-purple-500"
                      } transition-colors`}
                    >
                      {user.status === "pending" ? "Pending" : "Add"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && showRequests && pendingRequests.length > 0 && (
          <div className="w-full max-w-6xl mt-8">
            <h2 className="text-lg font-semibold mb-4">Pending Friend Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div key={req.friend_user_id} className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
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
                      <p className="text-purple-600 font-medium truncate">{req.friend_name}</p>
                      <p className="text-sm text-gray-500">{req.friend_email}</p>
                      <p className="text-xs text-gray-400">Requested: {new Date(req.created_at || "").toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span className="px-4 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
