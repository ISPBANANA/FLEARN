"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import Link from 'next/link';
import { Suspense } from 'react';
import SearchParamsHandler from '@/components/SearchParamsHandler';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { userAPI } from '@/lib/api';

// Force dynamic rendering to avoid build-time issues with useSearchParams
export const dynamic = 'force-dynamic';

interface AdminUser {
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  profile_pic: string;
  birthdate: string;
  edu_level: string;
  rank: string;
  streak: number;
  daily_exp: number;
  math_exp: number;
  phy_exp: number;
  bio_exp: number;
  chem_exp: number;
  completed_task: number;
}

export default function AdminPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, refetchProfile } = useUserProfile();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
  }>({ isOpen: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
  }>({ isOpen: false, user: null });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: string;
    profile_pic: string;
  }>({ name: '', role: '', profile_pic: '' });

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && profile && (profile.role === 'admin' || profile.role === 'teacher')) {
        fetchUsers();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, profile]);

  // Fetch users function
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setError(null);
      const response = await userAPI.getAllUsersAdmin(100, 0);
      setUsers(response.users || []);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = (user: AdminUser) => {
    setDeleteConfirmDialog({ isOpen: true, user });
  };

  // Handle edit user
  const handleEditUser = (user: AdminUser) => {
    setEditDialog({ isOpen: true, user });
    setEditForm({
      name: user.name || '',
      role: user.role || 'user',
      profile_pic: user.profile_pic || '',
    });
  };

  // Confirm update user
  const confirmUpdateUser = async () => {
    if (!editDialog.user) return;

    try {
      setIsUpdating(true);
      
      // Prepare update data - only include changed fields
      const updateData: { name?: string; role?: string; profile_pic?: string } = {};
      
      if (editForm.name !== editDialog.user.name) {
        updateData.name = editForm.name;
      }
      
      if (editForm.role !== editDialog.user.role) {
        updateData.role = editForm.role;
      }
      
      if (editForm.profile_pic !== editDialog.user.profile_pic) {
        updateData.profile_pic = editForm.profile_pic;
      }
      
      // Call API to update user
      const response = await userAPI.updateUserAdmin(editDialog.user.user_id, updateData);
      
      // Update user in local state
      setUsers(users.map(u => 
        u.user_id === editDialog.user!.user_id ? response.user : u
      ));
      
      setEditDialog({ isOpen: false, user: null });
      
      // Show success message (you can add a toast notification here)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      alert(`Error updating user: ${errorMessage}`);
      console.error('Error updating user:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditDialog({ isOpen: false, user: null });
  };

  const convertImageToBase64 = async (imagePath: string): Promise<string> => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return '';
    }
  };

  // Delete profile picture (set to default)
  const deleteProfilePicture = async () => {
    const defaultBase64 = await convertImageToBase64("/Chr/defaultpfp.jpg");
    setEditForm({ ...editForm, profile_pic: defaultBase64 });
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!deleteConfirmDialog.user) return;

    try {
      setIsDeleting(true);
      await userAPI.deleteUserAdmin(deleteConfirmDialog.user.user_id);
      
      // Remove user from local state
      setUsers(users.filter(u => u.user_id !== deleteConfirmDialog.user!.user_id));
      setDeleteConfirmDialog({ isOpen: false, user: null });
      
      // Show success message (you can add a toast notification here)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      alert(`Error deleting user: ${errorMessage}`);
      console.error('Error deleting user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmDialog({ isOpen: false, user: null });
  };

  // Initial load and authentication check
  useEffect(() => {
    // Wait for both auth and profile to finish loading
    if (!authLoading && !profileLoading) {
      if (!isAuthenticated || !profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        notFound();
      } else {
        // Fetch users on initial load
        fetchUsers();
      }
    }
  }, [isAuthenticated, profile, authLoading, profileLoading]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchUsers();
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'user':
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Show loading while checking authentication and role
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <Nav />

      {/* Information here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">

        {profile?.role === 'admin' && (
          /* User Management */
          <div className="w-full max-w-[1320px] h-[500px] items-center flex flex-col px-25 py-2 rounded-lg" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
            {/* header */}
            <div className="w-full flex flex-row justify-between items-center mb-4 my-4 w-full">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-[#454545]">User Dashboard</h2>
                {lastRefresh && (
                  <p className="text-sm text-gray-500">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex flex-row gap-4 items-center">
                {/* Manual Refresh Button */}
                <button 
                  onClick={handleManualRefresh}
                  disabled={isLoadingUsers}
                  className="bg-white border border-blue-400 text-blue-800 py-1 px-4 rounded hover:border-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={isLoadingUsers ? 'animate-spin' : ''} />
                  Refresh
                </button>
                {/* Search bar */}
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-4 py-1 w-60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545]"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {error}
              </div>
            )}

            {/* Show */}
            <div className="flex flex-col overflow-y-auto w-full h-max-[400px] gap-1">
              {/* Table Header */}
              <div className="grid gap-4 py-1 px-4 m-1 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 rounded-lg" style={{gridTemplateColumns: '2fr 1.5fr 2.5fr 1fr 1fr 1fr', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                <div className="text-left">UUID</div>
                <div className="text-left">Username</div>
                <div className="text-left">Email</div>
                <div className="text-left">Created</div>
                <div className="text-left">Role</div>
                <div className="text-center">Actions</div>
              </div>

              {/* Loading State */}
              {isLoadingUsers && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
              )}

              {/* Users Data */}
              {!isLoadingUsers && filteredUsers.length === 0 && !error && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                </div>
              )}

              {!isLoadingUsers && filteredUsers.map((user) => (
                <div key={user.user_id} className="grid gap-4 py-1 px-4 m-1 border-b border-gray-100 hover:bg-gray-50 rounded-lg" style={{gridTemplateColumns: '2fr 1.5fr 2.5fr 1fr 1fr 1fr', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                  <div
                    className="text-gray-900 flex items-center relative overflow-hidden whitespace-nowrap"
                    title={user.user_id}
                    style={{
                      background: 'linear-gradient(to right, currentColor 0%, currentColor 70%, transparent 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    <span className="text-gray-900">{user.user_id}</span>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                  </div>
                  <div className="text-gray-900 flex items-center">{user.name || 'N/A'}</div>
                  <div className="text-gray-900 flex items-center">{user.email || 'N/A'}</div>
                  <div className="text-gray-900 flex items-center">{formatDate(user.created_at)}</div>
                  <div className="text-gray-900 flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                    </span>
                  </div>
                  <div className="flex gap-2 items-center justify-center">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="text-blue-500 hover:text-blue-600 p-2 rounded transition-colors flex items-center justify-center"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-500 hover:text-red-600 p-2 rounded transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="py-10"></div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmDialog.isOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Account Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the account for{' '}
              <strong>{deleteConfirmDialog.user?.name || deleteConfirmDialog.user?.email}</strong>?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Warning:</strong> This action cannot be undone. All user data including:
              </p>
              <ul className="text-yellow-700 text-sm mt-2 ml-4 list-disc">
                <li>User profile and settings</li>
                <li>Friend relationships</li>
                <li>Garden collaborations</li>
                <li>Learning preferences</li>
              </ul>
              <p className="text-yellow-800 text-sm mt-2">
                will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Dialog */}
      {editDialog.isOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit User Account
            </h3>
            <p className="text-gray-600 mb-4">
              Editing account for{' '}
              <strong>{editDialog.user?.email}</strong>
            </p>
            
            {/* Edit Form */}
            <div className="space-y-4 mb-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter username"
                />
              </div>

              {/* Role Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="user">User</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={editForm.profile_pic || editDialog.user?.profile_pic || '/Chr/defualtpfp.jpg'}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/Chr/defualtpfp.jpg';
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={deleteProfilePicture}
                    className="px-3 py-1.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>
                <input
                  type="text"
                  value={editForm.profile_pic}
                  onChange={(e) => setEditForm({ ...editForm, profile_pic: e.target.value })}
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  placeholder="Profile picture URL (optional)"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> Only modified fields will be updated. If no changes are made, the user data will remain the same.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelEdit}
                disabled={isUpdating}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateUser}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
