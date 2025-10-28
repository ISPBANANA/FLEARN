"use client";

import React, { useState, useEffect } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { questionsAPI } from "@/lib/api";
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

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
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

  const handleSubjectClick = (subject: Subject) => {
    if (subject.subject_id === selectedSubject?.subject_id) {
      setSelectedSubject(null);
      setSelectedTopic(null);
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
        }, 150);
      } else {
        // No subject selected, just slide in
        setSelectedSubject(subject);
        setSelectedTopic(null);
      }
    }
  };

  const handleSubtopicClick = (topic: Topic) => {
    if (topic.topic_id === selectedTopic?.topic_id) {
      setSelectedTopic(null);
    } else {
      if (selectedTopic) {
        // If there's already a selected subtopic, slide out first
        setIsContentAnimating(true);
        setSelectedTopic(null);
        setTimeout(() => {
          setSelectedTopic(topic);
          setIsContentAnimating(false);
        }, 150);
      } else {
        // No subtopic selected, just slide in
        setSelectedTopic(topic);
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
            {selectedTopic && (
              <div className="flex flex-col items-center pt-8 px-8 w-full h-[calc(100vh-92px)] overflow-y-auto">
                {/* Title */}
                <h1 className="text-5xl font-bold text-purple-600 mb-8">{selectedTopic.name}</h1>

                {/* Vertical timeline with numbered circles */}
                <div className="flex flex-col items-center pb-8">
                  {/* First level - Yellow oval with number 1 */}
                  <div className="flex flex-col items-center">
                    <button className="w-40 h-24 rounded-[50px] bg-yellow-400 text-white text-3xl font-bold flex items-center justify-center hover:bg-yellow-500 transition-colors shadow-lg">
                      1
                    </button>
                    <div className="w-1 h-16 bg-gray-300"></div>
                  </div>

                  {/* Remaining levels - Purple ovals */}
                  {[2, 3, 4, 5, 6].map((num) => (
                    <div key={num} className="flex flex-col items-center">
                      <button className="w-32 h-20 rounded-[40px] bg-purple-600 text-white text-3xl font-bold flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg">
                        {num}
                      </button>
                      {num < 6 && (
                        <div className="w-1 h-16 bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
