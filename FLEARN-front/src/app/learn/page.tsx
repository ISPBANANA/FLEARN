"use client";

import React, { useState, useEffect } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { questionsAPI, backlogAPI, userAPI } from "@/lib/api";
import { 
  Calculator, 
  Dna, 
  Atom, 
  FlaskConical,
  ChevronRight,
  Search,
  ArrowLeft,
  Play,
  Loader2
} from "lucide-react";

// Icon mapping for subjects
const subjectIcons: Record<string, any> = {
  Mathematics: Calculator,
  Biology: Dna,
  Physics: Atom,
  Chemistry: FlaskConical,
};

interface Subject {
  subject_id: number;
  name: string;
  description?: string;
}

interface Topic {
  topic_id: number;
  subject_id: number;
  name: string;
  description?: string;
  status: string;
  subject_name: string;
  question_count?: number;
}

interface BacklogStats {
  topic_id: number;
  topic_name: string;
  total_attempts: string | number;  // API returns string from database COUNT
  correct_count: string | number;   // API returns string from database SUM
  incorrect_count: string | number; // API returns string from database SUM
  accuracy_percentage?: string;     // API returns string from database ROUND
  subject_id?: number;
  subject_name?: string;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [backlogStats, setBacklogStats] = useState<BacklogStats[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isContentAnimating, setIsContentAnimating] = useState<boolean>(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(true);
  const [isLoadingTopics, setIsLoadingTopics] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
    
    // Fetch user profile to get the real user_id (UUID)
    const fetchUserProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.user && response.user.user_id) {
          setCurrentUserId(response.user.user_id);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    fetchUserProfile();

    // Restore last selected subject and topic from localStorage
    const lastSubjectId = localStorage.getItem('lastSelectedSubjectId');
    const lastTopicId = localStorage.getItem('lastSelectedTopicId');
    
    if (lastSubjectId) {
      // We'll restore after subjects are loaded
      // Store the IDs for restoration
      sessionStorage.setItem('restoreSubjectId', lastSubjectId);
      if (lastTopicId) {
        sessionStorage.setItem('restoreTopicId', lastTopicId);
      }
    }
  }, []);

  // Fetch topics when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedSubject.subject_id);
    } else {
      setTopics([]);
      setFilteredTopics([]);
    }
  }, [selectedSubject]);

  // Fetch backlog stats when topic is selected
  useEffect(() => {
    if (selectedTopic && currentUserId) {
      fetchBacklogStats(currentUserId, selectedTopic.topic_id);
    }
  }, [selectedTopic, currentUserId]);

  // Refresh backlog stats when page becomes visible (e.g., returning from problem page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedTopic && currentUserId) {
        // Page is visible again, refresh backlog stats
        fetchBacklogStats(currentUserId, selectedTopic.topic_id);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedTopic, currentUserId]);

  // Filter topics based on search
  useEffect(() => {
    if (searchValue) {
      const filtered = topics.filter((topic) =>
        topic.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredTopics(filtered);
    } else {
      setFilteredTopics(topics);
    }
  }, [searchValue, topics]);

  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      setError(null);
      const response = await questionsAPI.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
        
        // After subjects are loaded, restore the last selected subject if available
        const restoreSubjectId = sessionStorage.getItem('restoreSubjectId');
        if (restoreSubjectId) {
          const subjectToRestore = response.data.find(
            (s: Subject) => s.subject_id === parseInt(restoreSubjectId)
          );
          if (subjectToRestore) {
            setSelectedSubject(subjectToRestore);
          }
          sessionStorage.removeItem('restoreSubjectId');
        }
      } else {
        throw new Error('Failed to fetch subjects');
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError('Failed to load subjects. Please try again later.');
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchTopics = async (subjectId: number) => {
    try {
      setIsLoadingTopics(true);
      setError(null);
      // Only fetch public topics
      const response = await questionsAPI.getTopics({
        subject_id: subjectId,
        status: 'public',
        limit: 100
      });
      if (response.success && response.data) {
        setTopics(response.data);
        setFilteredTopics(response.data);
        
        // After topics are loaded, restore the last selected topic if available
        const restoreTopicId = sessionStorage.getItem('restoreTopicId');
        if (restoreTopicId) {
          const topicToRestore = response.data.find(
            (t: Topic) => t.topic_id === parseInt(restoreTopicId)
          );
          if (topicToRestore) {
            setSelectedTopic(topicToRestore);
          }
          sessionStorage.removeItem('restoreTopicId');
        }
      } else {
        throw new Error('Failed to fetch topics');
      }
    } catch (err) {
      console.error('Error fetching topics:', err);
      setError('Failed to load topics. Please try again later.');
      setTopics([]);
      setFilteredTopics([]);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const fetchBacklogStats = async (userId: string, topicId: number) => {
    try {
      // Fetch backlog entries for this specific topic
      const response = await backlogAPI.getByUser(userId, { topic_id: topicId });
      
      // Backend returns { message, count, data } structure
      if (response.data && Array.isArray(response.data)) {
        // Create a stats object from the entries
        // Count is simply the number of entries returned
        const stats: BacklogStats = {
          topic_id: topicId,
          topic_name: selectedTopic?.name || '',
          total_attempts: response.data.length,
          correct_count: response.data.filter((entry: any) => entry.correctness === true).length,
          incorrect_count: response.data.filter((entry: any) => entry.correctness === false).length,
        };
        
        setBacklogStats([stats]);
      } else {
        // No backlog entries for this topic
        setBacklogStats([]);
      }
    } catch (err) {
      console.error('Error fetching backlog stats:', err);
      setBacklogStats([]);
    }
  };

  const handleSubjectClick = (subject: Subject) => {
    if (subject.subject_id === selectedSubject?.subject_id) {
      setSelectedSubject(null);
      setSelectedTopic(null);
      // Clear localStorage when deselecting
      localStorage.removeItem('lastSelectedSubjectId');
      localStorage.removeItem('lastSelectedTopicId');
    } else {
      if (selectedSubject) {
        // If there's already a selected subject, slide out first
        setIsAnimating(true);
        setIsContentAnimating(true);
        setSelectedSubject(null);
        setSelectedTopic(null);
        setTimeout(() => {
          setSelectedSubject(subject);
          setIsAnimating(false);
          setIsContentAnimating(false);
          // Save to localStorage
          localStorage.setItem('lastSelectedSubjectId', subject.subject_id.toString());
          localStorage.removeItem('lastSelectedTopicId'); // Clear topic when changing subject
        }, 150);
      } else {
        // No subject selected, just slide in
        setSelectedSubject(subject);
        setSelectedTopic(null);
        // Save to localStorage
        localStorage.setItem('lastSelectedSubjectId', subject.subject_id.toString());
        localStorage.removeItem('lastSelectedTopicId');
      }
    }
  };

  const handleSubtopicClick = (topic: Topic) => {
    if (topic.topic_id === selectedTopic?.topic_id) {
      setSelectedTopic(null);
      // Clear topic from localStorage when deselecting
      localStorage.removeItem('lastSelectedTopicId');
    } else {
      if (selectedTopic) {
        // If there's already a selected subtopic, slide out first
        setIsContentAnimating(true);
        setSelectedTopic(null);
        setTimeout(() => {
          setSelectedTopic(topic);
          setIsContentAnimating(false);
          // Save to localStorage
          localStorage.setItem('lastSelectedTopicId', topic.topic_id.toString());
        }, 150);
      } else {
        // No subtopic selected, just slide in
        setSelectedTopic(topic);
        // Save to localStorage
        localStorage.setItem('lastSelectedTopicId', topic.topic_id.toString());
      }
    }
  };

  return (
    <ProtectedRoute redirectTo="/">
      <div className="min-h-screen bg-white">
        <Nav />

        <div className="flex h-[calc(100vh-80px)]">
          {/* Left column - Subjects */}
          <aside className="flex flex-col bg-white py-4 px-4 w-60 h-full z-0 relative" style={{boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
            <h3 className="text-base font-semibold text-gray-600 mb-4">Subjects</h3>

            {isLoadingSubjects ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-purple-600" size={32} />
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-4">{error}</div>
            ) : (
              <div className="space-y-3 flex-1">
                {subjects.map((s) => {
                  const active = s.subject_id === selectedSubject?.subject_id;
                  const Icon = subjectIcons[s.name] || Calculator;
                  return (
                    <button
                      key={s.subject_id}
                      onClick={() => handleSubjectClick(s)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 focus:outline-none ${
                        active
                          ? "bg-purple-600 text-white shadow hover:bg-purple-700"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:shadow-md hover:scale-105"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                          active ? 'bg-white text-purple-600' : 'bg-purple-50 text-purple-600'
                        }`}>
                          <Icon size={16} />
                        </span>
                        <span className="truncate">{s.name}</span>
                      </div>
                      <ChevronRight size={16} className="opacity-60" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Return to Profile button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors px-3 py-2">
                <ArrowLeft size={20} />
                <span>Return to Profile</span>
              </button>
            </div>
          </aside>

          {/* Middle column - Sub-Topics (slides in when subject is selected) */}
          <div
            className={`transition-all duration-150 ease-in-out overflow-hidden ${
              selectedSubject && !isAnimating ? "w-64 opacity-100" : "w-0 opacity-0"
            }`}
          >
            {selectedSubject && (
              <section className="flex flex-col px-4 py-4 w-64 bg-gray-200 h-[calc(100vh-96px)]">
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-gray-600 mb-3">Sub-Topics</h4>
                  <div className="relative w-full">
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      className="w-full px-3 py-1 text-gray-400 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-gray-300 focus:bg-white"
                      placeholder={isSearchFocused ? "" : "Search..."}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {isLoadingTopics ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-purple-600" size={24} />
                  </div>
                ) : filteredTopics.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-4">
                    {searchValue ? "No topics found" : "No topics available"}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 pl-1 py-1">
                    {filteredTopics.map((topic) => {
                      const active = topic.topic_id === selectedTopic?.topic_id;
                      return (
                        <button
                          key={topic.topic_id}
                          onClick={() => handleSubtopicClick(topic)}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                            active
                              ? "bg-purple-600 text-white hover:bg-purple-700"
                              : "bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:shadow-md hover:scale-[1.02]"
                          }`}
                        >
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                            active ? 'bg-white text-purple-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            <Play size={12} fill="currentColor" />
                          </span>
                          <span className="truncate">{topic.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Vertical divider line between Sub-Topics and main content */}
          {selectedSubject && (
            <div className="border-l-2 border-gray-200 shadow-sm transition-opacity duration-300"></div>
          )}

          {/* Main content area - shown when subtopic is selected */}
          <div
            className={`transition-all duration-150 ease-in-out overflow-hidden ${
              selectedTopic && !isContentAnimating ? "flex-1 opacity-100" : "w-0 opacity-0"
            }`}
          >
            {selectedTopic && (() => {
              // Calculate current level: count(backlog) // 3 + 1
              // backlogStats has one entry with total_attempts = number of backlog entries
              const backlogCount = backlogStats.length > 0 
                ? parseInt(String(backlogStats[0].total_attempts) || '0')
                : 0;
              
              const currentLevel = Math.floor(backlogCount / 3) + 1;
              
              // Calculate which levels to display
              // Display: currentLevel-2, currentLevel-1, currentLevel, currentLevel+1, currentLevel+2
              const allLevels = [
                currentLevel - 2,
                currentLevel - 1,
                currentLevel,
                currentLevel + 1,
                currentLevel + 2
              ];
              const levelsToShow = allLevels.filter(level => level > 0); // Only show positive levels
              
              // Check if there are levels above and below current level
              const hasLevelsAbove = currentLevel > 1;
              const hasLevelsBelow = true; // Always true since levels are infinite

              return (
                <div className="flex flex-col w-full h-[calc(100vh-92px)] overflow-hidden relative bg-gradient-to-b from-purple-50 via-white to-purple-50">
                  {/* Title - with smooth gradient transition to content */}
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white via-white to-purple-50/30 py-8 z-20">
                    <h1 className="text-5xl font-bold text-purple-600 text-center">{selectedTopic.name}</h1>
                  </div>

                  {/* Fade overlay at top - only show if there are levels above */}
                  {hasLevelsAbove && (
                    <>
                      <div className="absolute top-24 left-0 right-0 h-32 bg-gradient-to-b from-purple-50/30 via-white/50 to-transparent z-10 pointer-events-none"></div>
                      {/* Fading line before first level to suggest continuation upward */}
                      <div className="absolute top-28 left-1/2 -translate-x-1/2 w-2 h-24 bg-gradient-to-t from-green-400 via-green-300 to-transparent rounded-full opacity-60 z-5"></div>
                    </>
                  )}

                  {/* Centered container for levels */}
                  <div className="flex-1 flex items-center justify-center pt-24 pb-8">
                    {/* Vertical timeline with numbered circles - always centered */}
                    <div className="flex flex-col items-center gap-0 relative">
                      {levelsToShow.map((level, index) => {
                        const isCurrentLevel = level === currentLevel;
                        const isPastLevel = level < currentLevel;
                        const distanceFromCurrent = Math.abs(level - currentLevel);
                        
                        // Calculate size and opacity based on distance from current level
                        let sizeClass, textSize, opacity, shadowClass;
                        
                        if (isCurrentLevel) {
                          sizeClass = 'w-48 h-28';
                          textSize = 'text-5xl';
                          opacity = 'opacity-100';
                          shadowClass = 'shadow-2xl';
                        } else if (distanceFromCurrent === 1) {
                          sizeClass = 'w-36 h-22';
                          textSize = 'text-3xl';
                          opacity = 'opacity-90';
                          shadowClass = 'shadow-lg';
                        } else {
                          sizeClass = 'w-28 h-18';
                          textSize = 'text-2xl';
                          opacity = 'opacity-70';
                          shadowClass = 'shadow-md';
                        }

                        // Determine color scheme
                        let colorClass;
                        if (isCurrentLevel) {
                          colorClass = 'bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-400 ring-4 ring-yellow-200';
                        } else if (isPastLevel) {
                          colorClass = 'bg-gradient-to-br from-green-400 via-green-500 to-emerald-500';
                        } else {
                          colorClass = 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600';
                        }
                        
                        return (
                          <div key={level} className={`flex flex-col items-center ${opacity} transition-all duration-300`}>
                            {/* Level node - only current level is clickable */}
                            <button
                              onClick={() => {
                                // Only allow navigation to current level
                                if (isCurrentLevel && selectedSubject && selectedTopic) {
                                  window.location.href = `/learn/problem?topic_id=${selectedTopic.topic_id}&level=${level}&subject_id=${selectedSubject.subject_id}`;
                                }
                              }}
                              disabled={!isCurrentLevel}
                              className={`${sizeClass} ${colorClass} ${textSize} ${shadowClass} rounded-[50px] text-white font-bold flex items-center justify-center ${
                                isCurrentLevel 
                                  ? 'cursor-pointer transform hover:scale-110' 
                                  : 'cursor-not-allowed opacity-60'
                              } transition-all duration-200 relative focus:outline-none ${
                                isCurrentLevel ? 'focus:ring-4 focus:ring-purple-300' : ''
                              }`}
                              title={isCurrentLevel ? 'Click to start this level' : isPastLevel ? 'Level completed' : 'Complete current level to unlock'}
                            >
                              {level}
                              {/* Pulse animation for current level */}
                              {isCurrentLevel && (
                                <div className="absolute inset-0 rounded-[50px] bg-yellow-400 animate-ping opacity-20"></div>
                              )}
                            </button>
                            
                            {/* Connector line with gradient */}
                            {index < levelsToShow.length - 1 && (
                              <div className={`w-2 h-16 ${
                                isPastLevel 
                                  ? 'bg-gradient-to-b from-green-400 to-green-500' 
                                  : isCurrentLevel 
                                  ? 'bg-gradient-to-b from-yellow-400 to-purple-500'
                                  : 'bg-gradient-to-b from-gray-500 to-gray-600'
                              } rounded-full ${shadowClass}`}></div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Fading line after the last level to suggest continuation downward */}
                      {hasLevelsBelow && (
                        <div className="w-2 h-32 bg-gradient-to-b from-purple-600 via-purple-400 to-transparent rounded-full opacity-60"></div>
                      )}
                    </div>
                  </div>

                  {/* Fade overlay at bottom - only show if there are levels below */}
                  {hasLevelsBelow && (
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
                  )}

                  {/* Decorative elements to enhance depth - with patrol animations */}
                  <style jsx>{`
                    @keyframes patrol1 {
                      0%, 100% { transform: translate(0, 0); }
                      25% { transform: translate(30px, -20px); }
                      50% { transform: translate(60px, 10px); }
                      75% { transform: translate(30px, 30px); }
                    }
                    @keyframes patrol2 {
                      0%, 100% { transform: translate(0, 0); }
                      25% { transform: translate(-40px, 25px); }
                      50% { transform: translate(-20px, -15px); }
                      75% { transform: translate(-50px, 5px); }
                    }
                    @keyframes patrol3 {
                      0%, 100% { transform: translate(0, 0); }
                      25% { transform: translate(25px, 35px); }
                      50% { transform: translate(50px, 15px); }
                      75% { transform: translate(20px, -10px); }
                    }
                    @keyframes patrol4 {
                      0%, 100% { transform: translate(0, 0); }
                      25% { transform: translate(-35px, -20px); }
                      50% { transform: translate(-15px, 30px); }
                      75% { transform: translate(-45px, 10px); }
                    }
                  `}</style>
                  <div 
                    className="absolute top-1/4 left-8 w-2 h-2 bg-purple-300 rounded-full opacity-50"
                    style={{ animation: 'patrol1 15s ease-in-out infinite' }}
                  ></div>
                  <div 
                    className="absolute top-1/3 right-12 w-3 h-3 bg-purple-400 rounded-full opacity-40"
                    style={{ animation: 'patrol2 18s ease-in-out infinite' }}
                  ></div>
                  <div 
                    className="absolute bottom-1/4 left-16 w-2 h-2 bg-purple-300 rounded-full opacity-50"
                    style={{ animation: 'patrol3 20s ease-in-out infinite' }}
                  ></div>
                  <div 
                    className="absolute bottom-1/3 right-8 w-3 h-3 bg-purple-400 rounded-full opacity-40"
                    style={{ animation: 'patrol4 22s ease-in-out infinite' }}
                  ></div>
                </div>
              );
            })()}
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
