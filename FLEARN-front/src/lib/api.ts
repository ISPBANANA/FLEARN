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

// CORS Error Detection and Handling
export class CORSError extends Error {
  constructor(
    message: string,
    public originalError: Error,
    public requestUrl: string,
    public suggestions: string[]
  ) {
    super(message);
    this.name = 'CORSError';
  }
}

// Enhanced error detection function
function detectCORSError(error: Error, requestUrl: string): CORSError | null {
  const errorMessage = error.message.toLowerCase();
  const isNetworkError = error instanceof TypeError && errorMessage.includes('failed to fetch');
  const isCORSError = errorMessage.includes('cors') || 
                     errorMessage.includes('cross-origin') ||
                     errorMessage.includes('blocked by cors policy') ||
                     (isNetworkError && !errorMessage.includes('network'));

  if (isCORSError || isNetworkError) {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown';
    const targetUrl = new URL(requestUrl);
    const targetOrigin = targetUrl.origin;
    
    const suggestions = [
      `Add '${currentOrigin}' to the backend's ALLOWED_ORIGINS environment variable`,
      'Restart the backend server after updating CORS settings',
      'Check if the backend server is running and accessible',
      'Verify the API_BASE_URL is correct in your environment variables',
      'Check browser developer console for detailed CORS error messages'
    ];

    // Add specific suggestions based on the environment
    if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
      suggestions.push('If running locally, ensure both frontend and backend are on allowed ports');
    }

    if (targetOrigin !== currentOrigin) {
      suggestions.push(`Cross-origin request detected: ${currentOrigin} → ${targetOrigin}`);
    }

    return new CORSError(
      `CORS Error: Request from ${currentOrigin} to ${requestUrl} was blocked. This usually means the backend server is not configured to accept requests from your frontend domain.`,
      error,
      requestUrl,
      suggestions
    );
  }

  return null;
}

// CORS diagnostic function with reduced logging
export async function diagnoseCORSIssue(apiUrl: string = API_BASE_URL, silent: boolean = false): Promise<{
  canConnect: boolean;
  corsConfigured: boolean;
  healthCheck: boolean;
  suggestions: string[];
  details: any;
}> {
  const isBrowser = typeof window !== 'undefined';
  const currentOrigin = isBrowser ? window.location.origin : 'unknown';
  // In the browser, prefer same-origin diagnostics to avoid pointing at localhost on other devices
  const resolvedApiUrl = isBrowser ? (apiUrl && !apiUrl.includes('localhost:') ? apiUrl : window.location.origin) : apiUrl;
  const results = {
    canConnect: false,
    corsConfigured: false,
    healthCheck: false,
    suggestions: [] as string[],
    details: {} as any
  };

  // Add a cache to prevent excessive diagnostic calls
  const cacheKey = `cors_diagnostic_${apiUrl}`;
  const cachedResult = sessionStorage.getItem(cacheKey);
  const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
  
  if (cachedResult && cacheTime) {
    const age = Date.now() - parseInt(cacheTime);
    if (age < 30000) { // Cache for 30 seconds
      if (!silent) console.log('🔄 Using cached CORS diagnostic result');
      return JSON.parse(cachedResult);
    }
  }

  try {
    // Test 1: Basic connectivity
    if (!silent) console.log('🔍 CORS Diagnostic: Testing basic connectivity...');
  const healthResponse = await fetch(`${resolvedApiUrl}/health`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'include'
    });
    
    results.canConnect = true;
    results.healthCheck = healthResponse.ok;
    results.details.healthStatus = healthResponse.status;
    
    if (!silent) console.log(`✅ Basic connectivity: OK (${healthResponse.status})`);

    // Test 2: CORS preflight
    if (!silent) console.log('🔍 CORS Diagnostic: Testing CORS preflight...');
    try {
  const preflightResponse = await fetch(`${resolvedApiUrl}/api/users/profile`, {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Origin': currentOrigin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'authorization,content-type'
        }
      });
      
      results.corsConfigured = preflightResponse.ok;
      results.details.preflightStatus = preflightResponse.status;
      results.details.corsHeaders = {};
      
      // Check CORS headers
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'access-control-allow-credentials'
      ];
      
      corsHeaders.forEach(header => {
        const value = preflightResponse.headers.get(header);
        if (value) {
          results.details.corsHeaders[header] = value;
        }
      });
      
      if (!silent) console.log(`✅ CORS preflight: ${preflightResponse.ok ? 'OK' : 'Failed'} (${preflightResponse.status})`);
    } catch (preflightError) {
      if (!silent) console.log('❌ CORS preflight failed:', preflightError);
      results.details.preflightError = preflightError instanceof Error ? preflightError.message : String(preflightError);
    }

  } catch (connectError) {
    if (!silent) console.log('❌ Basic connectivity failed:', connectError);
    results.details.connectError = connectError instanceof Error ? connectError.message : String(connectError);
    
    // Check if it's a CORS error even on basic connectivity
    const corsError = detectCORSError(
      connectError instanceof Error ? connectError : new Error(String(connectError)), 
      `${resolvedApiUrl}/health`
    );
    if (corsError) {
      results.suggestions.push(...corsError.suggestions);
    }
  }

  // Generate suggestions based on results
  if (!results.canConnect) {
    results.suggestions.push(
      'Backend server may not be running - check if it\'s started',
      'Verify the API_BASE_URL environment variable is correct',
      'Check if there are network connectivity issues'
    );
  }

  if (results.canConnect && !results.corsConfigured) {
    results.suggestions.push(
      `Backend is running but CORS is not properly configured for origin: ${currentOrigin}`,
      'Add your frontend URL to ALLOWED_ORIGINS in backend environment variables',
      'Restart backend server after updating CORS configuration'
    );
  }

  if (!results.suggestions.length && results.canConnect && results.corsConfigured) {
    results.suggestions.push('CORS appears to be configured correctly!');
  }

  // Cache the results to prevent excessive calls
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(results));
    sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
  } catch (e) {
    // Ignore storage errors
  }

  return results;
}

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

// Generic API call function with enhanced CORS error detection
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  // Build URL: on the browser, use relative path to leverage Next.js rewrites and avoid CORS
  const isBrowser = typeof window !== 'undefined';
  const requestUrl = isBrowser ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // For protected endpoints, we need a token
    const protectedEndpoints = ['/api/users/', '/api/friends/', '/api/gardens/', '/api/topics'];
    const isProtectedEndpoint = protectedEndpoints.some(path => endpoint.startsWith(path));
    
    // Check if it's a POST, PUT, or DELETE request to /api/topics (these need auth)
    const isTopicMutation = endpoint.startsWith('/api/topics') && 
                           (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE');
    
    if (isProtectedEndpoint || isTopicMutation) {
      throw new Error('No token provided - please log in to access this resource');
    }
  }

  try {
    const response = await fetch(requestUrl, {
      ...options,
      mode: 'cors', // Explicitly enable CORS
      credentials: 'include', // Include credentials for CORS
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        endpoint
      });
      
      if (response.status === 401) {
        throw new Error('Unauthorized - please log in again');
      }
      
      // Use the backend's error message if available
      const errorMessage = errorData.error || errorData.message || `API call failed: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    // Enhanced CORS error detection
    const corsError = detectCORSError(
      error instanceof Error ? error : new Error(String(error)), 
      requestUrl
    );
    
    if (corsError) {
      // Log detailed CORS information for debugging
  console.group('🚫 CORS Error Detected');
  console.error('Request URL:', requestUrl);
      console.error('Origin:', typeof window !== 'undefined' ? window.location.origin : 'server-side');
      console.error('Error Details:', corsError.message);
      console.group('💡 Suggestions:');
      corsError.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
      console.groupEnd();
      console.groupEnd();
      
      throw corsError;
    }
    
    // Re-throw non-CORS errors
    throw error instanceof Error ? error : new Error(String(error));
  }
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

  // Search users by name, email, or ID
  async searchUsers(searchTerm: string) {
    if (!searchTerm || searchTerm.trim().length < 1) {
      throw new Error('Search term cannot be empty');
    }
    return apiCall(`/api/users/search?q=${encodeURIComponent(searchTerm.trim())}`);
  },

  // Get all users with pagination
  async getAllUsers(limit: number = 50, offset: number = 0) {
    return apiCall(`/api/users/all?limit=${limit}&offset=${offset}`);
  },

  // Get all users for admin dashboard (admin/teacher only)
  async getAllUsersAdmin(limit: number = 50, offset: number = 0) {
    return apiCall(`/api/users/admin/all?limit=${limit}&offset=${offset}`);
  },

  // Delete user account (admin only)
  async deleteUserAdmin(userId: string) {
    return apiCall(`/api/users/admin/delete/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  },

  // Update user account (admin only)
  async updateUserAdmin(userId: string, userData: {
    name?: string;
    role?: string;
    profile_pic?: string;
  }) {
    return apiCall(`/api/users/admin/update/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
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

  // Update user streak after completing a level
  async updateStreak() {
    return apiCall('/api/users/streak', {
      method: 'PATCH',
    });
  },

  // Get leaderboard (top 50 users by daily_exp)
  async getLeaderboard() {
    return apiCall('/api/users/leaderboard');
  },
};

// Friends API functions
export const friendsAPI = {
  // Get friends list for the authenticated user
  async getFriends() {
    return apiCall('/api/friends');
  },

  // Get friends list for a specific user by user_id
  async getFriendsByUserId(userId: string) {
    return apiCall(`/api/friends/user/${encodeURIComponent(userId)}`);
  },

  // Send friend request
  async sendFriendRequest(friendUserId: string) {
    return apiCall('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ friend_user_id: friendUserId }),
    });
  },

  // Accept/reject friend request
  async updateFriendRequestStatus(friendshipId: string, status: 'accepted' | 'blocked') {
    return apiCall(`/api/friends/${friendshipId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Accept friend request (convenience method)
  async acceptFriendRequest(friendshipId: string) {
    return this.updateFriendRequestStatus(friendshipId, 'accepted');
  },

  // Block friend request (convenience method)
  async blockFriendRequest(friendshipId: string) {
    return this.updateFriendRequestStatus(friendshipId, 'blocked');
  },

  // Remove friend
  async removeFriend(friendshipId: string) {
    return apiCall(`/api/friends/${friendshipId}`, {
      method: 'DELETE',
    });
  },
};

// Gardens API functions
export const gardensAPI = {
  // Get user's gardens
  async getGardens() {
    return apiCall('/api/gardens');
  },

  // Get gardens for a specific user by user_id
  async getGardensByUserId(userId: string) {
    return apiCall(`/api/gardens/user/${encodeURIComponent(userId)}`);
  },

  // Send garden invitation to a friend
  async sendGardenInvitation(partnerEmail: string) {
    return apiCall('/api/gardens', {
      method: 'POST',
      body: JSON.stringify({ partner_email: partnerEmail }),
    });
  },

  // Accept/reject garden invitation
  async updateGardenInvitation(gardenId: string, status: 'accepted' | 'rejected') {
    return apiCall(`/api/gardens/${gardenId}/invitation`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Accept garden invitation (convenience method)
  async acceptGardenInvitation(gardenId: string) {
    return this.updateGardenInvitation(gardenId, 'accepted');
  },

  // Reject garden invitation (convenience method)  
  async rejectGardenInvitation(gardenId: string) {
    return this.updateGardenInvitation(gardenId, 'rejected');
  },

  // Update garden streak
  async updateGardenStreak(gardenId: string, increment: boolean) {
    return apiCall(`/api/gardens/${gardenId}/streak`, {
      method: 'PATCH',
      body: JSON.stringify({ increment }),
    });
  },

  // Update garden status
  async updateGardenStatus(gardenId: string, status: 'active' | 'inactive' | 'completed') {
    return apiCall(`/api/gardens/${gardenId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Delete garden
  async deleteGarden(gardenId: string) {
    return apiCall(`/api/gardens/${gardenId}`, {
      method: 'DELETE',
    });
  },
};

// Questions and Topics API functions
export const backlogAPI = {
  // Create a new backlog entry
  async createEntry(entryData: {
    user_id: string;
    subject_id: number;
    topic_id?: number;
    correctness: boolean;
    points_earned?: number;
  }) {
    return apiCall('/api/backlog', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },

  // Get backlog statistics by topic for a user
  async getStatsByTopic(userId: string, subjectId?: number) {
    const params = new URLSearchParams();
    if (subjectId) params.append('subject_id', subjectId.toString());
    const queryString = params.toString();
    return apiCall(`/api/backlog/stats/topic/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  // Get backlog statistics by subject for a user
  async getStatsBySubject(userId: string) {
    return apiCall(`/api/backlog/stats/subject/${userId}`);
  },

  // Get all backlog entries for a user
  async getByUser(userId: string, filters?: { subject_id?: number; topic_id?: number; correctness?: boolean; limit?: number; offset?: number }) {
    const params = new URLSearchParams();
    if (filters?.subject_id) params.append('subject_id', filters.subject_id.toString());
    if (filters?.topic_id) params.append('topic_id', filters.topic_id.toString());
    if (filters?.correctness !== undefined) params.append('correctness', filters.correctness.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    const queryString = params.toString();
    return apiCall(`/api/backlog/user/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  // Get analytics data for charts
  async getAnalytics(userId: string, startDate: string, endDate: string) {
    const params = new URLSearchParams();
    params.append('start_date', startDate);
    params.append('end_date', endDate);
    // Add cache-busting timestamp to prevent stale data
    params.append('_t', Date.now().toString());
    return apiCall(`/api/backlog/analytics/${userId}?${params.toString()}`, {
      cache: 'no-store', // Prevent caching
    });
  },
};

export const questionsAPI = {
  // Get all subjects
  async getSubjects() {
    return apiCall('/api/questions/subjects');
  },

  // Get all topics (with optional filters)
  async getTopics(filters?: {
    subject_id?: number;
    status?: 'public' | 'private';
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.subject_id) params.append('subject_id', filters.subject_id.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    return apiCall(`/api/topics${queryString ? `?${queryString}` : ''}`);
  },

  // Get topics by subject
  async getTopicsBySubject(subjectId: number) {
    return apiCall(`/api/topics/subject/${subjectId}`);
  },

  // Update topic status (admin only)
  async updateTopicStatus(topicId: number, status: 'public' | 'private') {
    return apiCall(`/api/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Create new topic (admin only)
  async createTopic(topicData: {
    subject_id: number;
    name: string;
    description?: string;
    status?: 'public' | 'private';
  }) {
    return apiCall('/api/topics', {
      method: 'POST',
      body: JSON.stringify(topicData),
    });
  },

  // Update topic (admin only)
  async updateTopic(topicId: number, topicData: {
    name?: string;
    description?: string;
    status?: 'public' | 'private';
  }) {
    return apiCall(`/api/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify(topicData),
    });
  },

  // Delete topic (admin only)
  async deleteTopic(topicId: number) {
    return apiCall(`/api/topics/${topicId}`, {
      method: 'DELETE',
    });
  },

  // Get all questions (with optional filters)
  async getQuestions(filters?: {
    subject_id?: number;
    topic_id?: number;
    type?: string;
    difficulty?: number;
    status?: 'public' | 'private';
    limit?: number;
    offset?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.subject_id) params.append('subject_id', filters.subject_id.toString());
    if (filters?.topic_id) params.append('topic_id', filters.topic_id.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());
    
    const queryString = params.toString();
    return apiCall(`/api/questions${queryString ? `?${queryString}` : ''}`);
  },

  // Get single question by ID
  async getQuestion(questionId: string) {
    return apiCall(`/api/questions/${questionId}`);
  },

  // Update question status (admin/teacher only)
  async updateQuestionStatus(questionId: string, status: 'public' | 'private') {
    return apiCall(`/api/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete question (admin/teacher only)
  async deleteQuestion(questionId: string) {
    return apiCall(`/api/questions/${questionId}`, {
      method: 'DELETE',
    });
  },

  // Create new question (admin/teacher only)
  async createQuestion(questionData: {
    subject_id: number;
    topic_id?: number;
    type_name: string;
    difficulty: number;
    points: number;
    status?: 'public' | 'private';
    content: any;
  }) {
    return apiCall('/api/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  // Update question (admin/teacher only)
  async updateQuestion(questionId: string, questionData: {
    subject_id?: number;
    topic_id?: number;
    type_name?: string;
    difficulty?: number;
    points?: number;
    status?: 'public' | 'private';
    content?: any;
  }) {
    return apiCall(`/api/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  },
};

// Enhanced health check with CORS detection
export async function checkBackendHealth(): Promise<{
  isHealthy: boolean;
  corsError?: CORSError;
  error?: string;
  status?: number;
}> {
  try {
  const isBrowser = typeof window !== 'undefined';
  const base = isBrowser ? window.location.origin : API_BASE_URL;
  const response = await fetch(`${base}/health`, {
      mode: 'cors',
      credentials: 'include'
    });
    return {
      isHealthy: response.ok,
      status: response.status
    };
  } catch (error) {
    const corsError = detectCORSError(
      error instanceof Error ? error : new Error(String(error)),
      `${API_BASE_URL}/health`
    );
    
    if (corsError) {
      return {
        isHealthy: false,
        corsError
      };
    }
    
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Quick CORS connectivity test
export async function testCORSConnectivity(): Promise<boolean> {
  try {
    const healthResult = await checkBackendHealth();
    if (healthResult.corsError) {
      console.warn('CORS connectivity test failed:', healthResult.corsError.message);
      return false;
    }
    return healthResult.isHealthy;
  } catch (error) {
    console.error('CORS connectivity test error:', error);
    return false;
  }
}

export default {
  userAPI,
  friendsAPI,
  gardensAPI,
  questionsAPI,
  backlogAPI,
  getCurrentUser,
  isAuthenticated,
  checkBackendHealth,
  testCORSConnectivity,
  diagnoseCORSIssue,
  CORSError,
  detectCORSError,
};