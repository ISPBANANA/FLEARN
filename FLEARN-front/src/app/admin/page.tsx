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
import { Edit, Trash2, RefreshCw, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { userAPI, questionsAPI } from '@/lib/api';

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

interface Topic {
  topic_id: number;
  name: string;
  question_count: number;
  status: 'public' | 'private';
  description?: string;
}

interface Subject {
  subject_id: number;
  name: string;
  topics: Topic[];
  isExpanded: boolean;
}

interface Question {
  question_id: string;
  type_name: string;
  subject_name: string;
  topic_name: string;
  difficulty: number;
  points: number;
  status: 'public' | 'private';
  user_id: string;
  created_by_name?: string;
}

export default function AdminPage() {
  const router = useRouter();
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

  // Subject Management States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topicSearchTerms, setTopicSearchTerms] = useState<{[key: number]: string}>({});
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectsError, setSubjectsError] = useState<string | null>(null);
  const [lastSubjectsRefresh, setLastSubjectsRefresh] = useState<Date | null>(null);

  // Questions Management States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [lastQuestionsRefresh, setLastQuestionsRefresh] = useState<Date | null>(null);
  const [questionsSearchTerm, setQuestionsSearchTerm] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [newTopicDialog, setNewTopicDialog] = useState<{
    isOpen: boolean;
    subjectId: number | null;
    subjectName: string;
  }>({ isOpen: false, subjectId: null, subjectName: '' });
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicForm, setNewTopicForm] = useState<{
    name: string;
  }>({ name: '' });
  const [editTopicDialog, setEditTopicDialog] = useState<{
    isOpen: boolean;
    topic: Topic | null;
  }>({ isOpen: false, topic: null });
  const [isUpdatingTopic, setIsUpdatingTopic] = useState(false);
  const [editTopicForm, setEditTopicForm] = useState<{
    name: string;
  }>({ name: '' });
  const [deleteTopicDialog, setDeleteTopicDialog] = useState<{
    isOpen: boolean;
    topic: Topic | null;
  }>({ isOpen: false, topic: null });
  const [isDeletingTopic, setIsDeletingTopic] = useState(false);

  // Auto-refresh users every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && profile && (profile.role === 'admin' || profile.role === 'teacher')) {
        fetchUsers();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, profile]);

  // Auto-refresh subjects every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && profile && (profile.role === 'admin' || profile.role === 'teacher')) {
        fetchSubjects();
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, profile]);

  // Auto-refresh questions every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && profile && (profile.role === 'admin' || profile.role === 'teacher')) {
        fetchQuestions();
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

  // Fetch subjects and topics function
  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      setSubjectsError(null);
      
      // Fetch all subjects
      const subjectsResponse = await questionsAPI.getSubjects();
      const subjectsData = subjectsResponse.data || [];
      
      // Fetch topics for each subject
      const subjectsWithTopics = await Promise.all(
        subjectsData.map(async (subject: any) => {
          const topicsResponse = await questionsAPI.getTopicsBySubject(subject.subject_id);
          return {
            subject_id: subject.subject_id,
            name: subject.name,
            topics: topicsResponse.data || [],
            isExpanded: false
          };
        })
      );
      
      setSubjects(subjectsWithTopics);
      setLastSubjectsRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subjects';
      setSubjectsError(errorMessage);
      console.error('Error fetching subjects:', err);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // Fetch questions function
  const fetchQuestions = async () => {
    try {
      setIsLoadingQuestions(true);
      setQuestionsError(null);
      const response = await questionsAPI.getQuestions();
      setQuestions(response.data || []);
      setLastQuestionsRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
      setQuestionsError(errorMessage);
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Manual refresh subjects
  const handleManualSubjectsRefresh = () => {
    fetchSubjects();
  };

  // Manual refresh questions
  const handleManualQuestionsRefresh = () => {
    fetchQuestions();
  };

  // Handle question status change
  const handleQuestionStatusChange = async (questionId: string, newStatus: 'public' | 'private') => {
    try {
      await questionsAPI.updateQuestionStatus(questionId, newStatus);
      
      // Update local state
      setQuestions(questions.map(question =>
        question.question_id === questionId ? { ...question, status: newStatus } : question
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update question status';
      alert(`Error: ${errorMessage}`);
      console.error('Error updating question status:', err);
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await questionsAPI.deleteQuestion(questionId);
      
      // Remove question from local state
      setQuestions(questions.filter(q => q.question_id !== questionId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question';
      alert(`Error deleting question: ${errorMessage}`);
      console.error('Error deleting question:', err);
    }
  };

  // Handle topic status change
  const handleTopicStatusChange = async (topicId: number, newStatus: 'public' | 'private') => {
    try {
      await questionsAPI.updateTopicStatus(topicId, newStatus);
      
      // Update local state
      setSubjects(subjects.map(subject => ({
        ...subject,
        topics: subject.topics.map(topic =>
          topic.topic_id === topicId ? { ...topic, status: newStatus } : topic
        )
      })));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update topic status';
      alert(`Error: ${errorMessage}`);
      console.error('Error updating topic status:', err);
    }
  };

  // Handle open new topic dialog
  const handleOpenNewTopicDialog = (subjectId: number, subjectName: string) => {
    setNewTopicDialog({ isOpen: true, subjectId, subjectName });
    setNewTopicForm({ name: '' });
  };

  // Handle cancel new topic
  const cancelNewTopic = () => {
    setNewTopicDialog({ isOpen: false, subjectId: null, subjectName: '' });
    setNewTopicForm({ name: '' });
  };

  // Handle create new topic
  const confirmCreateTopic = async () => {
    if (!newTopicDialog.subjectId || !newTopicForm.name.trim()) {
      alert('Topic name is required');
      return;
    }

    try {
      setIsCreatingTopic(true);
      
      const topicData = {
        subject_id: newTopicDialog.subjectId,
        name: newTopicForm.name.trim(),
        status: 'private' as const, // Always set to private
        description: '', // Add empty description to avoid backend issues
      };
      
      console.log('Creating topic with data:', topicData);
      
      const response = await questionsAPI.createTopic(topicData);
      
      console.log('Topic created successfully:', response);
      
      // Update local state with new topic
      setSubjects(subjects.map(subject => 
        subject.subject_id === newTopicDialog.subjectId
          ? {
              ...subject,
              topics: [...subject.topics, response.data]
            }
          : subject
      ));
      
      setNewTopicDialog({ isOpen: false, subjectId: null, subjectName: '' });
      setNewTopicForm({ name: '' });
      
      // Optionally refresh subjects to ensure data is up-to-date
      fetchSubjects();
    } catch (err) {
      console.error('Full error object:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create topic';
      
      // Try to extract more detailed error information
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response;
        if (response && response.data && response.data.error) {
          alert(`Error creating topic: ${response.data.error}`);
          return;
        }
      }
      
      alert(`Error creating topic: ${errorMessage}`);
    } finally {
      setIsCreatingTopic(false);
    }
  };

  // Handle open edit topic dialog
  const handleOpenEditTopicDialog = (topic: Topic) => {
    setEditTopicDialog({ isOpen: true, topic });
    setEditTopicForm({ name: topic.name });
  };

  // Handle cancel edit topic
  const cancelEditTopic = () => {
    setEditTopicDialog({ isOpen: false, topic: null });
    setEditTopicForm({ name: '' });
  };

  // Handle update topic
  const confirmUpdateTopic = async () => {
    if (!editTopicDialog.topic || !editTopicForm.name.trim()) {
      alert('Topic name is required');
      return;
    }

    // Check if name has changed
    if (editTopicForm.name.trim() === editTopicDialog.topic.name) {
      alert('No changes detected');
      return;
    }

    try {
      setIsUpdatingTopic(true);
      
      const topicData = {
        name: editTopicForm.name.trim(),
      };
      
      console.log('Updating topic with data:', topicData);
      
      const response = await questionsAPI.updateTopic(editTopicDialog.topic.topic_id, topicData);
      
      console.log('Topic updated successfully:', response);
      
      // Update local state
      setSubjects(subjects.map(subject => ({
        ...subject,
        topics: subject.topics.map(topic =>
          topic.topic_id === editTopicDialog.topic!.topic_id 
            ? { ...topic, name: editTopicForm.name.trim() }
            : topic
        )
      })));
      
      setEditTopicDialog({ isOpen: false, topic: null });
      setEditTopicForm({ name: '' });
      
      // Optionally refresh subjects to ensure data is up-to-date
      fetchSubjects();
    } catch (err) {
      console.error('Full error object:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update topic';
      
      // Try to extract more detailed error information
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response;
        if (response && response.data && response.data.error) {
          alert(`Error updating topic: ${response.data.error}`);
          return;
        }
      }
      
      alert(`Error updating topic: ${errorMessage}`);
    } finally {
      setIsUpdatingTopic(false);
    }
  };

  // Handle open delete topic dialog
  const handleDeleteTopic = (topic: Topic) => {
    setDeleteTopicDialog({ isOpen: true, topic });
  };

  // Handle cancel delete topic
  const cancelDeleteTopic = () => {
    setDeleteTopicDialog({ isOpen: false, topic: null });
  };

  // Handle confirm delete topic
  const confirmDeleteTopic = async () => {
    if (!deleteTopicDialog.topic) return;

    try {
      setIsDeletingTopic(true);
      
      await questionsAPI.deleteTopic(deleteTopicDialog.topic.topic_id);
      
      // Remove topic from local state
      setSubjects(subjects.map(subject => ({
        ...subject,
        topics: subject.topics.filter(topic => topic.topic_id !== deleteTopicDialog.topic!.topic_id)
      })));
      
      setDeleteTopicDialog({ isOpen: false, topic: null });
      
      // Optionally refresh subjects to ensure data is up-to-date
      fetchSubjects();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete topic';
      alert(`Error deleting topic: ${errorMessage}`);
      console.error('Error deleting topic:', err);
    } finally {
      setIsDeletingTopic(false);
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
        // Fetch data on initial load
        fetchUsers();
        fetchSubjects();
        fetchQuestions();
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

  // Filter questions based on search term
  useEffect(() => {
    if (!questionsSearchTerm.trim()) {
      setFilteredQuestions(questions);
    } else {
      const filtered = questions.filter(question => 
        question.question_id?.toLowerCase().includes(questionsSearchTerm.toLowerCase()) ||
        question.subject_name?.toLowerCase().includes(questionsSearchTerm.toLowerCase()) ||
        question.topic_name?.toLowerCase().includes(questionsSearchTerm.toLowerCase()) ||
        question.type_name?.toLowerCase().includes(questionsSearchTerm.toLowerCase()) ||
        question.created_by_name?.toLowerCase().includes(questionsSearchTerm.toLowerCase())
      );
      setFilteredQuestions(filtered);
    }
  }, [questions, questionsSearchTerm]);

  // Toggle subject expansion
  const toggleSubject = (subjectId: number) => {
    setSubjects(subjects.map(subject => 
      subject.subject_id === subjectId 
        ? { ...subject, isExpanded: !subject.isExpanded }
        : subject
    ));
  };

  // Get filtered topics for a subject
  const getFilteredTopics = (subject: Subject) => {
    const searchTerm = topicSearchTerms[subject.subject_id] || '';
    if (!searchTerm.trim()) {
      return subject.topics;
    }
    return subject.topics.filter(topic => 
      topic.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Update topic search term for a specific subject
  const updateTopicSearchTerm = (subjectId: number, value: string) => {
    setTopicSearchTerms(prev => ({
      ...prev,
      [subjectId]: value
    }));
  };

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
        
        {/* Subject Management */}
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
          <div className="w-full max-w-[1320px] min-h-[500px] items-center flex flex-col px-25 py-2 rounded-lg mt-8" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
            {/* header */}
            <div className="w-full flex flex-row justify-between items-center mb-4 my-4">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-[#454545]">Subject Topic Management</h2>
                {lastSubjectsRefresh && (
                  <p className="text-sm text-gray-500">
                    Last updated: {lastSubjectsRefresh.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex flex-row gap-4 items-center">
                {/* Manual Refresh Button */}
                <button 
                  onClick={handleManualSubjectsRefresh}
                  disabled={isLoadingSubjects}
                  className="bg-white border border-blue-400 text-blue-800 py-1 px-4 rounded hover:border-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={isLoadingSubjects ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Error Display */}
            {subjectsError && (
              <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {subjectsError}
              </div>
            )}

            {/* Subject List */}
            <div className="flex flex-col overflow-y-auto w-full h-full gap-2 pb-4">
              {/* Subject Header */}
              <div className="grid gap-4 py-2 px-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 rounded-lg m-1" style={{gridTemplateColumns: '40px 1fr', boxShadow: '0px 0px 3px rgba(0, 0, 0, 0.15)' }}>
                <div></div>
                <div className="text-left">Subject</div>
              </div>

              {/* Loading State */}
              {isLoadingSubjects && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-gray-600">Loading subjects...</span>
                </div>
              )}

              {/* Subjects Data */}
              {!isLoadingSubjects && subjects.length === 0 && !subjectsError && (
                <div className="text-center py-8 text-gray-500">
                  No subjects found.
                </div>
              )}

              {!isLoadingSubjects && subjects.map((subject) => {
                const filteredTopics = getFilteredTopics(subject);
                return (
                  <div key={subject.subject_id} className="flex flex-col">
                    {/* Subject Row */}
                    <div 
                      className="m-1 py-2 px-4 border-b border-gray-100 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-4" 
                      style={{boxShadow: '0px 0px 3px rgba(0, 0, 0, 0.15)' }}
                    >
                      <div 
                        className="flex items-center gap-4 flex-1 cursor-pointer"
                        onClick={() => toggleSubject(subject.subject_id)}
                      >
                        <div className="flex items-center justify-center w-[40px]">
                          {subject.isExpanded ? (
                            <ChevronDown size={20} className="text-gray-600" />
                          ) : (
                            <ChevronRight size={20} className="text-gray-600" />
                          )}
                        </div>
                        <div className="text-gray-900 flex items-center font-medium">
                          {subject.name}
                        </div>
                      </div>
                      
                      {/* Search and Add New for this subject - always visible */}
                      {subject.isExpanded && (
                        <div className="flex flex-row gap-4 items-center">
                          {/* Add New Button - Only for Admin */}
                          {profile?.role === 'admin' && (
                            <button 
                              className="bg-purple-500 text-white py-1 px-4 rounded hover:bg-purple-600 transition flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenNewTopicDialog(subject.subject_id, subject.name);
                              }}
                            >
                              <Edit size={16} />
                              Add New
                            </button>
                          )}
                          {/* Search bar for topics */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Name"
                              value={topicSearchTerms[subject.subject_id] || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateTopicSearchTerm(subject.subject_id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="border border-gray-300 rounded px-4 py-1 w-60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545]"
                            />
                            <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Topics (shown when expanded) */}
                    {subject.isExpanded && (
                      <div className="ml-12 mt-2 mb-2 border-l-2 border-purple-200 pl-4">

                        {/* Topics Header */}
                        <div className={`grid gap-4 py-2 px-4 bg-purple-50 border border-purple-200 rounded-lg font-semibold text-gray-700 text-sm mb-2`} style={{gridTemplateColumns: profile?.role === 'admin' ? '2fr 1fr 1fr 100px' : '2fr 1fr 1fr' }}>
                          <div className="text-left">Topic Name</div>
                          <div className="text-center">Total Question</div>
                          <div className="text-center">Status</div>
                          {profile?.role === 'admin' && (
                            <div className="text-center">Actions</div>
                          )}
                        </div>

                        {/* Topics List - with scrollbar when more than 3 items */}
                        <div className={filteredTopics.length > 3 ? 'overflow-y-auto' : ''} style={filteredTopics.length > 3 ? { maxHeight: '240px' } : {}}>
                          {filteredTopics.length === 0 && (
                            <div className="text-center py-2 text-gray-500 text-sm">
                              {topicSearchTerms[subject.subject_id] ? 'No topics found matching your search.' : 'No topics available.'}
                            </div>
                          )}

                          {filteredTopics.map((topic) => (
                          <div 
                            key={topic.topic_id} 
                            className={`grid gap-4 py-2 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-2`}
                            style={{gridTemplateColumns: profile?.role === 'admin' ? '2fr 1fr 1fr 100px' : '2fr 1fr 1fr', boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.1)' }}
                          >
                            <div className="text-gray-900 flex items-center">
                              {topic.name}
                            </div>
                            <div className="text-gray-700 flex items-center justify-center">
                              {topic.question_count}
                            </div>
                            <div className="flex items-center justify-center">
                              {profile?.role === 'admin' ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const newStatus = topic.status === 'public' ? 'private' : 'public';
                                    handleTopicStatusChange(topic.topic_id, newStatus);
                                  }}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                    topic.status === 'public' 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                                >
                                  {topic.status === 'public' ? 'Public' : 'Private'}
                                </button>
                              ) : (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  topic.status === 'public' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {topic.status === 'public' ? 'Public' : 'Private'}
                                </span>
                              )}
                            </div>
                            {profile?.role === 'admin' && (
                              <div className="flex gap-2 items-center justify-center">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditTopicDialog(topic);
                                  }}
                                  className="text-blue-500 hover:text-blue-600 p-1 rounded transition-colors"
                                  title="Edit topic"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTopic(topic);
                                  }}
                                  className="text-red-500 hover:text-red-600 p-1 rounded transition-colors"
                                  title="Delete topic"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Questions Management */}
        {(profile?.role === 'admin' || profile?.role === 'teacher') && (
          <div className="w-full max-w-[1320px] h-[500px] items-center flex flex-col px-25 py-2 rounded-lg mt-8" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
            {/* header */}
            <div className="w-full flex flex-row justify-between items-center mb-4 my-4 w-full">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-[#454545]">Problems Management</h2>
                {lastQuestionsRefresh && (
                  <p className="text-sm text-gray-500">
                    Last updated: {lastQuestionsRefresh.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex flex-row gap-4 items-center">
                {/* Add Problems Button */}
                <button 
                  onClick={() => router.push('/admin/editproblem?from=add')}
                  className="bg-purple-500 text-white py-1 px-4 rounded hover:bg-purple-600 transition flex items-center gap-2"
                >
                  <Edit size={16} />
                  Add Problems
                </button>
                {/* Manual Refresh Button */}
                <button 
                  onClick={handleManualQuestionsRefresh}
                  disabled={isLoadingQuestions}
                  className="bg-white border border-blue-400 text-blue-800 py-1 px-4 rounded hover:border-blue-500 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw size={16} className={isLoadingQuestions ? 'animate-spin' : ''} />
                  Refresh
                </button>
                {/* Search bar */}
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={questionsSearchTerm}
                  onChange={(e) => setQuestionsSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded px-4 py-1 w-60 focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545]"
                />
              </div>
            </div>

            {/* Error Display */}
            {questionsError && (
              <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                Error: {questionsError}
              </div>
            )}

            {/* Show */}
            <div className="flex flex-col overflow-y-auto w-full h-max-[400px] gap-1">
              {/* Table Header */}
              <div className="grid gap-4 py-1 px-4 m-1 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 rounded-lg" style={{gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                <div className="text-left">UUID</div>
                <div className="text-left">Subject</div>
                <div className="text-left">Topic</div>
                <div className="text-left">Type</div>
                <div className="text-center">Difficulty</div>
                <div className="text-center">Status</div>
                <div className="text-center">Actions</div>
              </div>

              {/* Loading State */}
              {isLoadingQuestions && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                  <span className="ml-2 text-gray-600">Loading questions...</span>
                </div>
              )}

              {/* Questions Data */}
              {!isLoadingQuestions && filteredQuestions.length === 0 && !questionsError && (
                <div className="text-center py-8 text-gray-500">
                  {questionsSearchTerm ? 'No questions found matching your search.' : 'No questions found.'}
                </div>
              )}

              {!isLoadingQuestions && filteredQuestions.map((question) => (
                <div key={question.question_id} className="grid gap-4 py-1 px-4 m-1 border-b border-gray-100 hover:bg-gray-50 rounded-lg" style={{gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1fr 1fr', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                  <div
                    className="text-gray-900 flex items-center relative overflow-hidden whitespace-nowrap"
                    title={question.question_id}
                    style={{
                      background: 'linear-gradient(to right, currentColor 0%, currentColor 70%, transparent 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    <span className="text-gray-900">{question.question_id}</span>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                  </div>
                  <div className="text-gray-900 flex items-center">{question.subject_name || 'N/A'}</div>
                  <div className="text-gray-900 flex items-center">{question.topic_name || 'N/A'}</div>
                  <div className="text-gray-900 flex items-center">{question.type_name || 'N/A'}</div>
                  <div className="text-gray-900 flex items-center justify-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {question.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => {
                        const newStatus = question.status === 'public' ? 'private' : 'public';
                        handleQuestionStatusChange(question.question_id, newStatus);
                      }}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        question.status === 'public' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {question.status === 'public' ? 'Public' : 'Private'}
                    </button>
                  </div>
                  <div className="flex gap-2 items-center justify-center">
                    <button 
                      onClick={() => handleDeleteQuestion(question.question_id)}
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

      {/* Add New Topic Dialog */}
      {newTopicDialog.isOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add New Topic
            </h3>
            <p className="text-gray-600 mb-4">
              Creating a new topic for{' '}
              <strong>{newTopicDialog.subjectName}</strong>
            </p>
            
            {/* Form */}
            <div className="space-y-4 mb-6">
              {/* Topic Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTopicForm.name}
                  onChange={(e) => setNewTopicForm({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                  placeholder="Enter topic name"
                  autoFocus
                />
              </div>

              {/* Status Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                <p className="text-purple-800 text-sm">
                  <strong>Status:</strong> This topic will be created as <strong>Private</strong> by default. You can change it to Public later.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelNewTopic}
                disabled={isCreatingTopic}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateTopic}
                disabled={isCreatingTopic || !newTopicForm.name.trim()}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:bg-purple-300 flex items-center gap-2"
              >
                {isCreatingTopic ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  'Create Topic'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Dialog */}
      {editTopicDialog.isOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Topic
            </h3>
            <p className="text-gray-600 mb-4">
              Editing topic:{' '}
              <strong>{editTopicDialog.topic?.name}</strong>
            </p>
            
            {/* Form */}
            <div className="space-y-4 mb-6">
              {/* Topic Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTopicForm.name}
                  onChange={(e) => setEditTopicForm({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter topic name"
                  autoFocus
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> Only the topic name will be updated. Status can be changed by clicking the status badge in the topic list.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelEditTopic}
                disabled={isUpdatingTopic}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateTopic}
                disabled={isUpdatingTopic || !editTopicForm.name.trim() || editTopicForm.name.trim() === editTopicDialog.topic?.name}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:bg-blue-300 flex items-center gap-2"
              >
                {isUpdatingTopic ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Topic'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Topic Confirmation Dialog */}
      {deleteTopicDialog.isOpen && (
        <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Topic Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the topic{' '}
              <strong>{deleteTopicDialog.topic?.name}</strong>?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Warning:</strong> This action cannot be undone.
              </p>
              {deleteTopicDialog.topic && deleteTopicDialog.topic.question_count > 0 ? (
                <div className="mt-3">
                  <p className="text-yellow-800 text-sm font-semibold">
                    ⚠️ This topic has {deleteTopicDialog.topic.question_count} associated question{deleteTopicDialog.topic.question_count !== 1 ? 's' : ''}.
                  </p>
                  <p className="text-yellow-700 text-sm mt-2">
                    You must reassign or delete all questions in this topic before you can delete it.
                  </p>
                </div>
              ) : (
                <p className="text-yellow-700 text-sm mt-2">
                  The topic will be permanently deleted from the database.
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDeleteTopic}
                disabled={isDeletingTopic}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTopic}
                disabled={isDeletingTopic || (deleteTopicDialog.topic ? deleteTopicDialog.topic.question_count > 0 : false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:bg-red-300 flex items-center gap-2"
              >
                {isDeletingTopic ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Topic'
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
