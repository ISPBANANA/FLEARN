// API utility functions for FLEARN backend communication
import { SessionManager } from './session';

// For Docker networking, use the service name. For local development, use localhost.
const getApiBaseUrl = () => {
  // Client-side requests (browser)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099';
  }
  
  // Server-side requests (Next.js server)
  if (process.env.NODE_ENV === 'production') {
    return 'http://flearn-backend:8099';
  }
  
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get Google ID token from cookies or session
// Note: Cookie name preserved as 'auth0_access_token' for backward compatibility, 
// but now contains Google ID token
function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  // First try to get from SessionManager (localStorage)
  const sessionToken = SessionManager.getAuthToken();
  if (sessionToken) {
    return sessionToken;
  }
  
  // Fallback to cookies for backward compatibility
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth0_access_token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  
  return null;
}

// Helper function to get user info from cookies or session
// Note: Cookie name preserved as 'auth0_user' for backward compatibility,
// but now contains Google user information
export function getCurrentUser() {
  if (typeof document === 'undefined') return null;
  
  // First try to get from SessionManager (localStorage)
  const sessionUser = SessionManager.getCurrentUser();
  if (sessionUser) {
    return sessionUser;
  }
  
  // Fallback to cookies for backward compatibility
  const cookies = document.cookie.split(';');
  const userCookie = cookies.find(cookie => cookie.trim().startsWith('auth0_user='));
  
  if (userCookie) {
    try {
      const userJson = decodeURIComponent(userCookie.split('=')[1]);
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Failed to parse user cookie:', error);
      return null;
    }
  }
  
  return null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  // First check SessionManager
  if (SessionManager.isAuthenticated()) {
    return true;
  }
  
  // Fallback to cookie check
  return getCurrentUser() !== null;
}

// Generic API call function
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // For protected endpoints, we need a token
    const protectedEndpoints = ['/api/users/', '/api/friends/', '/api/gardens/'];
    const isProtectedEndpoint = protectedEndpoints.some(path => endpoint.startsWith(path));
    
    if (isProtectedEndpoint) {
      throw new Error('No token provided - please log in to access this resource');
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      throw new Error('Unauthorized - please log in again');
    }
    
    throw new Error(errorData.message || `API call failed: ${response.status}`);
  }
  
  return response.json();
}

// User API functions
export const userAPI = {
  // Get user profile
  async getProfile() {
    return apiCall('/api/users/profile');
  },

  // Get user profile by ID
  async getProfileById(userId: string) {
    return apiCall(`/api/users/profilebyid?id=${encodeURIComponent(userId)}`);
  },

  // Create or update user profile
  async updateProfile(profileData: {
    name?: string;
    email?: string;
    profile_pic?: string;
    birthdate?: string;
    edu_level?: string;
  }) {
    return apiCall('/api/users/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Update only profile picture and name (doesn't affect other fields)
  async updateProfileBasic(profileData: {
    name?: string;
    profile_pic?: string;
  }) {
    return apiCall('/api/users/profile-basic', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  // Get user preferences
  async getPreferences() {
    return apiCall('/api/users/preferences');
  },

  // Add user preference
  async addPreference(subject: string) {
    return apiCall('/api/users/preferences', {
      method: 'POST',
      body: JSON.stringify({ subject }),
    });
  },

  // Update experience points
  async updateExperience(expData: {
    daily_exp?: number;
    math_exp?: number;
    phy_exp?: number;
    bio_exp?: number;
    chem_exp?: number;
  }) {
    return apiCall('/api/users/experience', {
      method: 'PATCH',
      body: JSON.stringify(expData),
    });
  },

  // Get leaderboard (top 50 users by daily_exp)
  async getLeaderboard() {
    return apiCall('/api/users/leaderboard');
  },
};

// Friends API functions
export const friendsAPI = {
  // Get friends list
  async getFriends() {
    return apiCall('/api/friends');
  },

  // Send friend request
  async sendFriendRequest(friendEmail: string) {
    return apiCall('/api/friends', {
      method: 'POST',
      body: JSON.stringify({ friend_email: friendEmail }),
    });
  },

  // Accept friend request
  async acceptFriendRequest(friendshipId: string) {
    return apiCall(`/api/friends/${friendshipId}/accept`, {
      method: 'PATCH',
    });
  },

  // Reject friend request
  async rejectFriendRequest(friendshipId: string) {
    return apiCall(`/api/friends/${friendshipId}/reject`, {
      method: 'PATCH',
    });
  },
};

// Gardens API functions
export const gardensAPI = {
  // Get user's gardens
  async getGardens() {
    return apiCall('/api/gardens');
  },

  // Create new garden
  async createGarden(gardenData: {
    garden_name: string;
    category: string;
    description?: string;
  }) {
    return apiCall('/api/gardens', {
      method: 'POST',
      body: JSON.stringify(gardenData),
    });
  },

  // Join garden
  async joinGarden(gardenId: string) {
    return apiCall(`/api/gardens/${gardenId}/join`, {
      method: 'POST',
    });
  },

  // Leave garden
  async leaveGarden(gardenId: string) {
    return apiCall(`/api/gardens/${gardenId}/leave`, {
      method: 'DELETE',
    });
  },
};

// Health check
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

export default {
  userAPI,
  friendsAPI,
  gardensAPI,
  getCurrentUser,
  isAuthenticated,
  checkBackendHealth,
};