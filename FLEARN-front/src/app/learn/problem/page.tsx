"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { questionsAPI, backlogAPI, userAPI } from "@/lib/api";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Question {
  question_id: string;
  type_name: string;
  subject_id: number;
  subject_name: string;
  topic_id: number;
  topic_name: string;
  difficulty: number;
  points: number;
  status: string;
  content: {
    question_text: string;
    options?: Array<{ id: string; text: string; is_correct: boolean }>;
    correct_answer?: any;
    pairs?: Array<{ left: string; right: string }>;
  };
}

interface ShuffledOption {
  id: string;
  text: string;
  originalId: string;
}

interface ShuffledPair {
  id: number;
  left: string;
  right: string;
  originalRightValue: string;
}

export default function ProblemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topic_id');
  const level = searchParams.get('level');
  const subjectId = searchParams.get('subject_id');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [correctBacklogCount, setCorrectBacklogCount] = useState<number>(0);
  
  // Answer states
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState<string>("");
  const [matchingAnswers, setMatchingAnswers] = useState<{[key: number]: string}>({});
  
  // Result states
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track all results to save at the end
  const [sessionResults, setSessionResults] = useState<Array<{
    question: Question;
    correct: boolean;
  }>>([]);

  // Shuffled data for current question
  const [shuffledOptions, setShuffledOptions] = useState<ShuffledOption[]>([]);
  const [shuffledRightOptions, setShuffledRightOptions] = useState<string[]>([]);

  // Validate URL parameters on mount - prevent URL manipulation
  useEffect(() => {
    if (!topicId || !level || !subjectId) {
      setError('Invalid access. Please select a topic and level from the learning page.');
      setIsLoading(false);
      setTimeout(() => {
        router.push('/learn');
      }, 2000);
      return;
    }

    // Validate that parameters are valid numbers
    const topicIdNum = parseInt(topicId);
    const levelNum = parseInt(level);
    const subjectIdNum = parseInt(subjectId);

    if (isNaN(topicIdNum) || isNaN(levelNum) || isNaN(subjectIdNum)) {
      setError('Invalid parameters. Redirecting to learning page...');
      setIsLoading(false);
      setTimeout(() => {
        router.push('/learn');
      }, 2000);
      return;
    }

    // Validate level is positive
    if (levelNum < 1) {
      setError('Invalid level. Redirecting to learning page...');
      setIsLoading(false);
      setTimeout(() => {
        router.push('/learn');
      }, 2000);
      return;
    }
  }, [topicId, level, subjectId, router]);

  // Fetch user profile to get the real user_id
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        if (response.user && response.user.user_id) {
          setCurrentUserId(response.user.user_id);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      }
    };
    
    fetchUserProfile();
  }, []);

  // Fetch backlog stats to get correct answer count
  useEffect(() => {
    const fetchBacklogStats = async () => {
      if (!currentUserId || !topicId) return;

      try {
        const response = await backlogAPI.getStatsByTopic(currentUserId);
        if (response.success && response.data) {
          // Find stats for this specific topic
          const topicStats = response.data.find((stat: any) => 
            stat.topic_id === parseInt(topicId)
          );
          
          if (topicStats) {
            setCorrectBacklogCount(topicStats.correct_answers || 0);
            
            // Validate that user is accessing the correct level
            // Current level should be: floor(total_attempts / 3) + 1
            const userCurrentLevel = Math.floor((topicStats.total_attempts || 0) / 3) + 1;
            const requestedLevel = parseInt(level || '1');
            
            if (requestedLevel !== userCurrentLevel) {
              console.error(`Access denied: User tried to access level ${requestedLevel} but current level is ${userCurrentLevel}`);
              setError(`You can only access level ${userCurrentLevel}. Redirecting...`);
              setIsLoading(false);
              setTimeout(() => {
                router.push('/learn');
              }, 2000);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching backlog stats:', err);
        // Continue with default value of 0
      }
    };
    
    fetchBacklogStats();
  }, [currentUserId, topicId, level, router]);

  // Prevent navigation away from page during quiz (warn user)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (questions.length > 0 && currentQuestionIndex < questions.length) {
        // Show warning if user tries to leave during quiz
        e.preventDefault();
        e.returnValue = 'You have an active quiz session. Your progress will be lost if you leave. Are you sure?';
        return e.returnValue;
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (questions.length > 0 && currentQuestionIndex < questions.length - 1) {
        // Warn user if trying to use browser back button
        const confirmLeave = window.confirm(
          'You have an active quiz session. Your progress will be lost if you leave. Are you sure?'
        );
        if (!confirmLeave) {
          // Push state back to keep them on the page
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // Add state to history to intercept back button
    window.history.pushState(null, '', window.location.href);
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [questions.length, currentQuestionIndex]);

  // Fetch and select 3 random questions based on frequency
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!topicId || !level || !subjectId || !currentUserId) {
        if (!currentUserId) return; // Wait for user ID
        setError('Missing required parameters');
        setIsLoading(false);
        return;
      }
      
      // Only fetch if we don't have questions yet
      if (questions.length > 0) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all public questions for this topic
        const response = await questionsAPI.getQuestions({
          topic_id: parseInt(topicId),
          subject_id: parseInt(subjectId),
          status: 'public',
          limit: 100
        });

        if (!response.success || !response.data || response.data.length === 0) {
          setError('No questions available for this topic. This topic may not exist or has no public questions.');
          setIsLoading(false);
          setTimeout(() => {
            router.push('/learn');
          }, 3000);
          return;
        }

        // Note: API already filters questions by topic_id and subject_id in the query,
        // so we can trust the returned questions are for the correct topic

        // Select 3 questions using frequency-based random selection
        // Use correctBacklogCount // 3 instead of level
        const progressLevel = Math.floor(correctBacklogCount / 3);
        
        const selectedQuestions = selectQuestionsWithFrequency(response.data, progressLevel, 3);
        
        if (selectedQuestions.length === 0) {
          setError('No suitable questions found');
          setIsLoading(false);
          return;
        }

        setQuestions(selectedQuestions);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [topicId, level, subjectId, currentUserId, correctBacklogCount, questions.length]);

  // Shuffle options when question changes
  useEffect(() => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Reset answer states
    setSelectedAnswer(null);
    setFillBlankAnswer("");
    setMatchingAnswers({});
    setShowResult(false);

    // Shuffle based on question type
    if (currentQuestion.type_name === 'multiple_choice' && currentQuestion.content.options) {
      const shuffled = shuffleArray([...currentQuestion.content.options]).map((opt, idx) => ({
        id: String.fromCharCode(65 + idx), // A, B, C, D
        text: opt.text,
        originalId: opt.id
      }));
      setShuffledOptions(shuffled);
    } else if (currentQuestion.type_name === 'matching' && currentQuestion.content.pairs) {
      // Shuffle only the right side options
      const rightOptions = currentQuestion.content.pairs.map(pair => pair.right);
      setShuffledRightOptions(shuffleArray([...rightOptions]));
    }
  }, [currentQuestionIndex, questions]);

  // Frequency-based random selection algorithm
  // currentLevel parameter now represents: (correct_backlogs // 3) for this topic
  const selectQuestionsWithFrequency = (allQuestions: Question[], currentLevel: number, count: number): Question[] => {
    if (allQuestions.length === 0) return [];
    
    // Group questions by difficulty
    const questionsByDifficulty: {[key: number]: Question[]} = {};
    allQuestions.forEach(q => {
      if (!questionsByDifficulty[q.difficulty]) {
        questionsByDifficulty[q.difficulty] = [];
      }
      questionsByDifficulty[q.difficulty].push(q);
    });

    const difficulties = Object.keys(questionsByDifficulty).map(d => parseInt(d)).sort((a, b) => a - b);
    
    if (difficulties.length === 0) return [];

    const selected: Question[] = [];
    const maxDifficulty = Math.max(...difficulties);
    const minDifficulty = Math.min(...difficulties);

    // Calculate weights for each difficulty based on progress level (correct_backlogs // 3)
    // Higher progress = more chance for higher difficulty, but can still get easy questions
    const getWeight = (difficulty: number): number => {
      // Base weight increases with progress (correct answers / 3)
      const levelFactor = Math.min(currentLevel / 10, 1); // Normalize to 0-1
      
      // Calculate how far this difficulty is from min and max
      const normalizedDifficulty = (difficulty - minDifficulty) / (maxDifficulty - minDifficulty || 1);
      
      // Weight formula: higher progress prefers higher difficulty but doesn't exclude lower ones
      // At progress 0: weights are more even (slight preference for easy)
      // At higher progress: weights shift toward harder questions but easy ones still possible
      const weight = 1 + (normalizedDifficulty * levelFactor * 3);
      
      return weight;
    };

    // Select 'count' questions
    for (let i = 0; i < count && selected.length < count; i++) {
      // Calculate weighted probabilities
      const weights = difficulties.map(d => ({
        difficulty: d,
        weight: getWeight(d) * questionsByDifficulty[d].length
      }));

      const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
      
      // Random selection based on weights
      let random = Math.random() * totalWeight;
      let selectedDifficulty = difficulties[0];
      
      for (const w of weights) {
        random -= w.weight;
        if (random <= 0) {
          selectedDifficulty = w.difficulty;
          break;
        }
      }

      // Pick a random question from the selected difficulty
      const availableQuestions = questionsByDifficulty[selectedDifficulty].filter(
        q => !selected.some(s => s.question_id === q.question_id)
      );

      if (availableQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        selected.push(availableQuestions[randomIndex]);
      } else {
        // If no questions available at this difficulty, pick from any other difficulty
        const allAvailable = allQuestions.filter(
          q => !selected.some(s => s.question_id === q.question_id)
        );
        if (allAvailable.length > 0) {
          const randomIndex = Math.floor(Math.random() * allAvailable.length);
          selected.push(allAvailable[randomIndex]);
        }
      }
    }

    return selected;
  };

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Check answer and store result (don't save to backlog yet)
  const handleSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || !currentUserId) return;

    setIsSubmitting(true);
    let correct = false;

    // Check answer based on question type
    if (currentQuestion.type_name === 'multiple_choice') {
      const selectedOption = shuffledOptions.find(opt => opt.id === selectedAnswer);
      if (selectedOption) {
        const originalOption = currentQuestion.content.options?.find(
          opt => opt.id === selectedOption.originalId
        );
        correct = originalOption?.is_correct || false;
      }
    } else if (currentQuestion.type_name === 'true_false') {
      correct = fillBlankAnswer.toLowerCase() === currentQuestion.content.correct_answer?.toLowerCase();
    } else if (currentQuestion.type_name === 'fill_blank') {
      correct = fillBlankAnswer.trim().toLowerCase() === currentQuestion.content.correct_answer?.trim().toLowerCase();
    } else if (currentQuestion.type_name === 'matching') {
      // Check all pairs
      if (currentQuestion.content.pairs) {
        correct = currentQuestion.content.pairs.every((pair, idx) => {
          return matchingAnswers[idx] === pair.right;
        });
      }
    }

    setIsCorrect(correct);
    setShowResult(true);

    // Store result in session (don't save to backlog yet)
    setSessionResults(prev => [...prev, {
      question: currentQuestion,
      correct: correct
    }]);

    setIsSubmitting(false);
  };

  // Move to next question or finish and save all results
  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions completed, save all results to backlog and update experience
      if (currentUserId && sessionResults.length === questions.length && topicId && subjectId) {
        try {
          // Calculate total points from correct answers
          let totalPoints = 0;
          for (const result of sessionResults) {
            if (result.correct) {
              totalPoints += result.question.points || 0;
            }
          }

          // Save all results to backlog
          // Use topicId and subjectId from URL params since API doesn't return them
          for (const result of sessionResults) {
            await backlogAPI.createEntry({
              user_id: currentUserId,
              subject_id: parseInt(subjectId),
              topic_id: parseInt(topicId),
              correctness: result.correct
            });
          }

          // Update experience points if user earned any points
          if (totalPoints > 0 && questions.length > 0) {
            // First, get current user profile to get existing experience values
            const userProfile = await userAPI.getProfile();
            if (userProfile.user) {
              const currentUser = userProfile.user;
              
              // Get subject name from the first question
              const subjectName = questions[0].subject_name;
              
              // Map subject name to experience field and ADD to existing values
              const expData: {
                daily_exp: number;
                math_exp?: number;
                phy_exp?: number;
                bio_exp?: number;
                chem_exp?: number;
              } = {
                daily_exp: (currentUser.daily_exp || 0) + totalPoints
              };

              // Add points to the appropriate subject experience (ADD to existing, not replace)
              if (subjectName === 'Mathematics') {
                expData.math_exp = (currentUser.math_exp || 0) + totalPoints;
              } else if (subjectName === 'Physics') {
                expData.phy_exp = (currentUser.phy_exp || 0) + totalPoints;
              } else if (subjectName === 'Biology') {
                expData.bio_exp = (currentUser.bio_exp || 0) + totalPoints;
              } else if (subjectName === 'Chemistry') {
                expData.chem_exp = (currentUser.chem_exp || 0) + totalPoints;
              }

              // Update user experience with new totals
              await userAPI.updateExperience(expData);
            }
          }
        } catch (err) {
          console.error('Error saving results to backlog or updating experience:', err);
        }
      }
      
      // Return to learn page
      router.push('/learn');
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isLoading) {
    return (
      <ProtectedRoute redirectTo="/">
        <div className="min-h-screen bg-white">
          <Nav />
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
              <p className="text-gray-600">Loading questions...</p>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !currentQuestion || !currentQuestion.content || !currentQuestion.content.question_text) {
    return (
      <ProtectedRoute redirectTo="/">
        <div className="min-h-screen bg-white">
          <Nav />
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'No questions available or question data is invalid'}</p>
              <button
                onClick={() => router.push('/learn')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Back to Learning
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute redirectTo="/">
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
        <Nav />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            {/* Question Text */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {currentQuestion.topic_name}
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {currentQuestion.content.question_text}
                </ReactMarkdown>
              </div>
            </div>

            {/* Answer Section */}
            <div className="space-y-4">
              {/* Multiple Choice */}
              {currentQuestion.type_name === 'multiple_choice' && shuffledOptions.length > 0 && (
                <div className="space-y-3">
                  {shuffledOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => !showResult && setSelectedAnswer(option.id)}
                      disabled={showResult}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedAnswer === option.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      } ${showResult ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-semibold">
                          {option.id}
                        </span>
                        <div className="flex-1 prose prose-sm text-gray-700">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {option.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* True/False */}
              {currentQuestion.type_name === 'true_false' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => !showResult && setFillBlankAnswer('true')}
                    disabled={showResult}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all font-semibold ${
                      fillBlankAnswer === 'true'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 text-gray-700'
                    } ${showResult ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    True
                  </button>
                  <button
                    onClick={() => !showResult && setFillBlankAnswer('false')}
                    disabled={showResult}
                    className={`flex-1 p-6 rounded-xl border-2 transition-all font-semibold ${
                      fillBlankAnswer === 'false'
                        ? 'border-purple-600 bg-purple-50 text-purple-600'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 text-gray-700'
                    } ${showResult ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    False
                  </button>
                </div>
              )}

              {/* Fill in the Blank */}
              {currentQuestion.type_name === 'fill_blank' && (
                <div>
                  <input
                    type="text"
                    value={fillBlankAnswer}
                    onChange={(e) => !showResult && setFillBlankAnswer(e.target.value)}
                    disabled={showResult}
                    placeholder="Type your answer here..."
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none text-gray-700 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              )}

              {/* Matching */}
              {currentQuestion.type_name === 'matching' && currentQuestion.content.pairs && (
                <div className="space-y-4">
                  {currentQuestion.content.pairs.map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex-1 p-4 rounded-xl bg-purple-50 border-2 border-purple-200 prose prose-sm text-gray-700">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {pair.left}
                        </ReactMarkdown>
                      </div>
                      <ArrowRight className="text-purple-600 flex-shrink-0" size={24} />
                      <select
                        value={matchingAnswers[idx] || ''}
                        onChange={(e) => !showResult && setMatchingAnswers({
                          ...matchingAnswers,
                          [idx]: e.target.value
                        })}
                        disabled={showResult}
                        className="flex-1 p-4 rounded-xl border-2 border-gray-200 focus:border-purple-600 focus:outline-none text-gray-700 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        <option value="">Select match...</option>
                        {shuffledRightOptions.map((rightOpt, rightIdx) => (
                          <option key={rightIdx} value={rightOpt}>
                            {rightOpt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Result Display */}
            {showResult && (
              <div className={`mt-6 p-6 rounded-xl ${
                isCorrect 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="text-green-600" size={32} />
                      <h3 className="text-2xl font-bold text-green-800">Correct!</h3>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={32} />
                      <h3 className="text-2xl font-bold text-red-800">Incorrect</h3>
                    </>
                  )}
                </div>
                <p className="text-gray-700">
                  {isCorrect 
                    ? 'Great job! You got it right.' 
                    : 'Not quite right. Keep practicing!'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              {!showResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canSubmit()}
                  className="flex-1 py-4 px-6 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex-1 py-4 px-6 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Next Question
                      <ArrowRight size={20} />
                    </>
                  ) : (
                    'Back to Learning'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );

  // Helper function to check if user can submit
  function canSubmit(): boolean {
    if (!currentQuestion) return false;

    switch (currentQuestion.type_name) {
      case 'multiple_choice':
        return selectedAnswer !== null;
      case 'true_false':
        return fillBlankAnswer !== '';
      case 'fill_blank':
        return fillBlankAnswer.trim() !== '';
      case 'matching':
        return currentQuestion.content.pairs 
          ? currentQuestion.content.pairs.every((_, idx) => matchingAnswers[idx])
          : false;
      default:
        return false;
    }
  }
}
