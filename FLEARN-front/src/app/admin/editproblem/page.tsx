"use client";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { StylesLoadedWrapper } from "@/components/StylesLoadedWrapper";
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { questionsAPI } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Suspense } from 'react';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function EditProblemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  
  // Check if user came from add button or editing existing question
  const fromAdd = searchParams.get('from') === 'add';
  const questionId = searchParams.get('id');
  const isEditMode = !!questionId;
  
  // Form states
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [status, setStatus] = useState<'public' | 'private'>('private');
  const [difficulty, setDifficulty] = useState(1);
  const [questionText, setQuestionText] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  
  // Options for multiple choice
  const [options, setOptions] = useState([
    { id: 'A', text: '', isCorrect: false },
    { id: 'B', text: '', isCorrect: false },
    { id: 'C', text: '', isCorrect: false },
    { id: 'D', text: '', isCorrect: false },
  ]);
  
  // True/False answer
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<'true' | 'false' | null>(null);
  
  // Fill in the blank answer (single answer)
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  
  // Matching pairs
  const [matchingPairs, setMatchingPairs] = useState([
    { id: 1, left: '', right: '' },
    { id: 2, left: '', right: '' },
    { id: 3, left: '', right: '' },
    { id: 4, left: '', right: '' },
  ]);
  
  // Data from API
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [questionTypes, setQuestionTypes] = useState([
    { type_name: 'multiple_choice', display_name: 'Multiple Choice' },
    { type_name: 'true_false', display_name: 'True/False' },
    { type_name: 'fill_blank', display_name: 'Fill in the Blank' },
    { type_name: 'matching', display_name: 'Matching' },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Markdown helper functions
  const insertMarkdown = (before: string, after: string = '', placeholder: string = '') => {
    if (!textareaRef) return;
    
    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const selectedText = questionText.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = 
      questionText.substring(0, start) + 
      before + textToInsert + after + 
      questionText.substring(end);
    
    setQuestionText(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      if (textareaRef) {
        const newPosition = start + before.length + textToInsert.length;
        textareaRef.focus();
        textareaRef.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertMarkdown(prefix, '', 'Heading text');
  };

  const insertBold = () => {
    insertMarkdown('**', '**', 'bold text');
  };

  const insertItalic = () => {
    insertMarkdown('*', '*', 'italic text');
  };

  const insertInlineMath = () => {
    insertMarkdown('$', '$', 'E=mc^2');
  };

  const insertBlockMath = () => {
    insertMarkdown('\n$$\n', '\n$$\n', '\\frac{a}{b}');
  };

  const insertImageBox = () => {
    const imageTemplate = '\n![Image description](https://example.com/image.jpg)\n';
    const start = textareaRef?.selectionStart || questionText.length;
    const newText = 
      questionText.substring(0, start) + 
      imageTemplate + 
      questionText.substring(start);
    setQuestionText(newText);
    
    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        const newPosition = start + imageTemplate.length;
        textareaRef.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await questionsAPI.getSubjects();
        setSubjects(response.data || []);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    
    fetchSubjects();
  }, []);

  // Fetch topics when subject changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!subjectId) {
        setTopics([]);
        return;
      }
      
      try {
        const response = await questionsAPI.getTopicsBySubject(parseInt(subjectId));
        setTopics(response.data || []);
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
      }
    };
    
    fetchTopics();
  }, [subjectId]);

  // Check authentication and access
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!isAuthenticated || !profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        notFound();
      }
      
      // Check if user came from add button or has question ID for edit
      if (!fromAdd && !questionId) {
        router.push('/admin');
      }
    }
  }, [isAuthenticated, profile, authLoading, profileLoading, fromAdd, questionId, router]);

  // Load question data in edit mode
  useEffect(() => {
    const loadQuestion = async () => {
      if (!isEditMode || !questionId) return;
      
      setIsLoading(true);
      try {
        const response = await questionsAPI.getQuestion(questionId);
        
        if (response.success && response.data) {
          const question = response.data;
          
          // Set form values
          setSubjectId(question.subject_id?.toString() || '');
          setTopicId(question.topic_id?.toString() || '');
          setQuestionType(question.type_name);
          setStatus(question.status);
          setDifficulty(question.difficulty);
          setQuestionText(question.content.question_text || '');
          
          // Set answers based on question type
          if (question.type_name === 'multiple_choice' && question.content.options) {
            const formattedOptions = question.content.options.map((opt: any, idx: number) => ({
              id: String.fromCharCode(65 + idx), // A, B, C, D
              text: opt.text,
              isCorrect: opt.is_correct
            }));
            // Fill remaining slots if less than 4 options
            while (formattedOptions.length < 4) {
              formattedOptions.push({
                id: String.fromCharCode(65 + formattedOptions.length),
                text: '',
                isCorrect: false
              });
            }
            setOptions(formattedOptions);
          }
          
          if (question.type_name === 'true_false' && question.content.correct_answer) {
            setTrueFalseAnswer(question.content.correct_answer);
          }
          
          if (question.type_name === 'fill_blank' && question.content.correct_answer) {
            setFillBlankAnswer(question.content.correct_answer);
          }
          
          if (question.type_name === 'matching' && question.content.pairs) {
            const formattedPairs = question.content.pairs.map((pair: any, idx: number) => ({
              id: idx + 1,
              left: pair.left,
              right: pair.right
            }));
            setMatchingPairs(formattedPairs);
          }
        }
      } catch (error) {
        console.error('Error loading question:', error);
        alert('Failed to load question data');
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuestion();
  }, [isEditMode, questionId, router]);

  // Toggle correct answer for options
  const toggleCorrectAnswer = (index: number) => {
    // Single select - only one can be correct
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  // Update option text
  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  // Update matching pair
  const updateMatchingPair = (index: number, side: 'left' | 'right', value: string) => {
    const newPairs = [...matchingPairs];
    newPairs[index][side] = value;
    setMatchingPairs(newPairs);
  };

  // Handle save
  const handleSave = async (exitAfter: boolean = false) => {
    // Validation
    if (!subjectId) {
      alert('Please select a subject');
      return;
    }
    
    if (!questionType) {
      alert('Please select a question type');
      return;
    }
    
    if (!questionText.trim()) {
      alert('Please enter a question');
      return;
    }

    // // Debug: Log current state before validation
    // console.log('Current form state:', {
    //   subjectId,
    //   topicId,
    //   questionType,
    //   difficulty,
    //   status,
    //   questionText: questionText.substring(0, 50) + '...',
    //   hasOptions: options.length > 0,
    //   trueFalseAnswer,
    //   fillBlankAnswer
    // });

    // Validate based on question type
    if (questionType === 'multiple_choice') {
      const hasCorrectAnswer = options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        alert('Please mark at least one correct answer');
        return;
      }
      
      const hasEmptyOption = options.some(opt => !opt.text.trim());
      if (hasEmptyOption) {
        alert('Please fill in all answer options');
        return;
      }
    }

    if (questionType === 'true_false') {
      if (!trueFalseAnswer) {
        alert('Please select True or False as the correct answer');
        return;
      }
    }

    if (questionType === 'fill_blank') {
      if (!fillBlankAnswer.trim()) {
        alert('Please enter the correct answer for the fill in the blank');
        return;
      }
    }

    if (questionType === 'matching') {
      const hasEmptyPair = matchingPairs.some(pair => !pair.left.trim() || !pair.right.trim());
      if (hasEmptyPair) {
        alert('Please fill in all matching pairs (both left and right sides)');
        return;
      }
    }

    try {
      setIsSaving(true);
      
      // Prepare question data based on type
      const content: any = {
        question_text: questionText,
      };

      if (questionType === 'multiple_choice') {
        content.options = options.map(opt => ({
          id: opt.id.toLowerCase(),
          text: opt.text,
          is_correct: opt.isCorrect
        }));
      }

      if (questionType === 'true_false') {
        content.correct_answer = trueFalseAnswer;
      }

      if (questionType === 'fill_blank') {
        content.correct_answer = fillBlankAnswer;
      }

      if (questionType === 'matching') {
        content.pairs = matchingPairs.map(pair => ({
          left: pair.left,
          right: pair.right
        }));
      }

      const questionData = {
        subject_id: parseInt(subjectId),
        topic_id: topicId ? parseInt(topicId) : undefined,
        type_name: questionType,
        difficulty: difficulty,
        points: difficulty * 10, // Points based on difficulty
        status: status,
        content: content
      };

      // Validate parsed values
      if (isNaN(questionData.subject_id)) {
        alert('Invalid subject ID. Please select a subject again.');
        return;
      }

      if (questionData.topic_id !== undefined && isNaN(questionData.topic_id)) {
        console.warn('Invalid topic_id, setting to undefined');
        questionData.topic_id = undefined;
      }

      // // Debug: Log the data being sent
      // console.log('Saving question with data:', {
      //   subject_id: questionData.subject_id,
      //   topic_id: questionData.topic_id,
      //   type_name: questionData.type_name,
      //   difficulty: questionData.difficulty,
      //   points: questionData.points,
      //   status: questionData.status,
      //   content: questionData.content,
      //   isEditMode,
      //   questionId
      // });

      // Call API to create or update question
      let response;
      if (isEditMode && questionId) {
        response = await questionsAPI.updateQuestion(questionId, questionData);
      } else {
        response = await questionsAPI.createQuestion(questionData);
      }
      
      if (response.success) {
        if (exitAfter) {
          router.push('/admin');
        } else {
          // Reset form
          setQuestionText('');
          setQuestionType('');
          setDifficulty(1);
          setOptions([
            { id: 'A', text: '', isCorrect: false },
            { id: 'B', text: '', isCorrect: false },
            { id: 'C', text: '', isCorrect: false },
            { id: 'D', text: '', isCorrect: false },
          ]);
          setTrueFalseAnswer(null);
          setFillBlankAnswer('');
          setMatchingPairs([
            { id: 1, left: '', right: '' },
            { id: 2, left: '', right: '' },
            { id: 3, left: '', right: '' },
            { id: 4, left: '', right: '' },
          ]);
        }
      } else {
        throw new Error(response.error || 'Failed to save question');
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert(`Failed to save question: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      router.push('/admin');
    }
  };

  if (authLoading || profileLoading || !isMounted || isLoading) {
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
    <StylesLoadedWrapper>
      <div className="min-h-screen bg-white" style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <Nav />
        
        <div className="max-w-4xl mx-auto p-4 lg:p-8 my-4 lg:my-8 px-4 lg:px-0" style={{ maxWidth: '56rem', margin: '1rem auto', padding: '1rem' }}>
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-purple-600">
              {isEditMode ? 'Edit Problem' : 'Add New Problem'}
            </h1>
            <p className="text-[#454545] mt-2">
              {isEditMode ? 'Update the question details' : 'Create a new question for your students'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 space-y-6" style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', padding: '1rem' }}>
          {/* Row 1: Subject, Sub-Topic */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-[#454545] mb-2">
                <span className="text-red-500">*</span> Subject :
              </label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopicId(''); // Reset topic when subject changes
                }}
                disabled={isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <p className="text-xs text-gray-500 mt-1">
                  Subject cannot be changed for existing questions
                </p>
              )}
            </div>

            {/* Sub-Topic */}
            <div>
              <label className="block text-sm font-medium text-[#454545] mb-2">
                <span className="text-red-500">*</span> Sub-Topic :
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId || isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Topic</option>
                {topics.map((topic) => (
                  <option key={topic.topic_id} value={topic.topic_id}>
                    {topic.name}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <p className="text-xs text-gray-500 mt-1">
                  Sub-topic cannot be changed for existing questions
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Question Type, Status, Difficulty */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Question Type :
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                disabled={isEditMode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Type</option>
                {questionTypes.map((type) => (
                  <option key={type.type_name} value={type.type_name}>
                    {type.display_name}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <p className="text-xs text-gray-500 mt-1">
                  Type cannot be changed
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Status :
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'private' | 'public')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Difficulty (1-10) :
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={difficulty}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 1 && val <= 10) {
                    setDifficulty(val);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              />
            </div>
          </div>

          {/* Question Text with Markdown Preview */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-[#454545]">
                <span className="text-red-500">*</span> Question :
              </label>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-sm text-purple-500 hover:text-purple-700 font-medium"
              >
                {previewMode ? 'Edit' : 'Preview'}
              </button>
            </div>
            
            {!previewMode ? (
              <>
                {/* Formatting Toolbar */}
                <div className="mb-2 flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-300 rounded-md">
                  {/* Headings */}
                  <button
                    type="button"
                    onClick={() => insertHeading(1)}
                    className="px-2 py-1 text-sm font-semibold bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-[#454545]"
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertHeading(2)}
                    className="px-2 py-1 text-sm font-semibold bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-[#454545]"
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertHeading(3)}
                    className="px-2 py-1 text-sm font-semibold bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-[#454545]"
                    title="Heading 3"
                  >
                    H3
                  </button>
                  
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  
                  {/* Text Formatting */}
                  <button
                    type="button"
                    onClick={insertBold}
                    className="px-2 py-1 text-sm font-bold bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-[#454545]"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={insertItalic}
                    className="px-2 py-1 text-sm italic bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-[#454545]"
                    title="Italic"
                  >
                    I
                  </button>
                  
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  
                  {/* Math */}
                  <button
                    type="button"
                    onClick={insertInlineMath}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-[#454545]"
                    title="Inline Math (LaTeX)"
                  >
                    $x$
                  </button>
                  <button
                    type="button"
                    onClick={insertBlockMath}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition text-[#454545]"
                    title="Block Math (LaTeX)"
                  >
                    $$
                  </button>
                  
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  
                  {/* Image */}
                  <button
                    type="button"
                    onClick={insertImageBox}
                    className="px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-100 transition flex items-center gap-1 text-[#454545]"
                    title="Insert Image"
                  >
                    🖼️ Image
                  </button>
                </div>
                
                <textarea
                  ref={(ref) => setTextareaRef(ref)}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter your question here. Supports Markdown and LaTeX.&#10;&#10;Examples:&#10;# Heading 1&#10;## Heading 2&#10;**bold** *italic*&#10;Inline math: $E=mc^2$&#10;Block math: $$\frac{a}{b}$$&#10;![Image](url)"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-mono text-sm"
                />
              </>
            ) : (
              <div className="w-full min-h-[200px] px-4 py-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="prose prose-sm max-w-none prose-headings:text-[#454545] prose-p:text-[#454545] prose-strong:text-[#454545]">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      img: ({ ...props }) => (
                        <img {...props} className="max-w-full h-auto rounded shadow-md my-2" alt={props.alt || ''} />
                      ),
                      h1: ({ ...props }) => (
                        <h1 {...props} className="text-2xl font-bold text-[#454545] mt-4 mb-2" />
                      ),
                      h2: ({ ...props }) => (
                        <h2 {...props} className="text-xl font-bold text-[#454545] mt-3 mb-2" />
                      ),
                      h3: ({ ...props }) => (
                        <h3 {...props} className="text-lg font-bold text-[#454545] mt-2 mb-1" />
                      ),
                      p: ({ ...props }) => (
                        <p {...props} className="text-[#454545] my-2" />
                      ),
                      strong: ({ ...props }) => (
                        <strong {...props} className="font-bold text-[#454545]" />
                      ),
                      em: ({ ...props }) => (
                        <em {...props} className="italic text-[#454545]" />
                      ),
                    }}
                  >
                    {questionText || '*Preview will appear here*'}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              <strong>Markdown tips:</strong> Use # for headings, **bold**, *italic*, $math$, $$block math$$, ![alt](image-url)<br/>
              <strong>LaTex Keyboard:</strong> <Link href="https://latexeditor.lagrida.com/" target="_blank">https://latexeditor.lagrida.com/</Link>
            </p>
          </div>

          {/* Answer Options - Multiple Choice */}
          {questionType === 'multiple_choice' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#454545]">
                <span className="text-red-500">*</span> Answer Options:
              </label>
              
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#454545] w-8">
                    {option.id}.
                  </span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                    placeholder={`Option ${option.id}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545]"
                  />
                  <button
                    type="button"
                    onClick={() => toggleCorrectAnswer(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      option.isCorrect
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={option.isCorrect ? 'Correct answer' : 'Mark as correct'}
                  >
                    {option.isCorrect && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
              
              <p className="text-xs text-gray-500">
                Click the circle to mark the correct answer
              </p>
            </div>
          )}

          {/* Answer Options - True/False (Kahoot-style) */}
          {questionType === 'true_false' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#454545] mb-4">
                <span className="text-red-500">*</span> Select the Correct Answer:
              </label>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* True Button */}
                <button
                  type="button"
                  onClick={() => setTrueFalseAnswer('true')}
                  className={`relative p-6 lg:p-8 rounded-lg border-2 transition-all ${
                    trueFalseAnswer === 'true'
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${
                      trueFalseAnswer === 'true' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-lg lg:text-xl font-bold ${
                      trueFalseAnswer === 'true' ? 'text-green-600' : 'text-[#454545]'
                    }`}>
                      TRUE
                    </span>
                  </div>
                  {trueFalseAnswer === 'true' && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>

                {/* False Button */}
                <button
                  type="button"
                  onClick={() => setTrueFalseAnswer('false')}
                  className={`relative p-6 lg:p-8 rounded-lg border-2 transition-all ${
                    trueFalseAnswer === 'false'
                      ? 'border-red-500 bg-red-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-red-400 hover:bg-red-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center ${
                      trueFalseAnswer === 'false' ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
                      <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className={`text-lg lg:text-xl font-bold ${
                      trueFalseAnswer === 'false' ? 'text-red-600' : 'text-[#454545]'
                    }`}>
                      FALSE
                    </span>
                  </div>
                  {trueFalseAnswer === 'false' && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-red-500 rounded-full p-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500">
                Click on the correct answer (True or False)
              </p>
            </div>
          )}

          {/* Answer Options - Fill in the Blank */}
          {questionType === 'fill_blank' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#454545]">
                <span className="text-red-500">*</span> Correct Answer:
              </label>
              
              <p className="text-xs text-gray-500 mb-3">
                💡 Add a blank space in your question using <code className="bg-gray-100 px-1 rounded">___</code> or <code className="bg-gray-100 px-1 rounded">______</code>
              </p>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#454545] w-20">
                  Answer:
                </span>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={fillBlankAnswer}
                    onChange={(e) => setFillBlankAnswer(e.target.value)}
                    placeholder="Type the correct answer here"
                    className="w-full px-3 py-2 border-b-2 border-gray-400 bg-transparent focus:outline-none focus:border-purple-500 text-[#454545] font-medium"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"></div>
                </div>
              </div>
            </div>
          )}

          {/* Answer Options - Matching */}
          {questionType === 'matching' && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[#454545] mb-3">
                <span className="text-red-500">*</span> Matching Pairs:
              </label>
              
              <p className="text-xs text-gray-500 mb-4">
                Create 4 pairs that students need to match correctly
              </p>
              
              <div className="space-y-4">
                {matchingPairs.map((pair, index) => (
                  <div key={pair.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-[#454545]">Pair {index + 1}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 ml-11">
                      {/* Left side */}
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Left Side</label>
                        <input
                          type="text"
                          value={pair.left}
                          onChange={(e) => updateMatchingPair(index, 'left', e.target.value)}
                          placeholder="e.g., Question or term"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545] bg-white"
                        />
                      </div>
                      
                      {/* Arrow indicator */}
                      <div className="relative">
                        <label className="text-xs text-gray-600 mb-1 block">Right Side (Match)</label>
                        <input
                          type="text"
                          value={pair.right}
                          onChange={(e) => updateMatchingPair(index, 'right', e.target.value)}
                          placeholder="e.g., Answer or definition"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545] bg-white"
                        />
                        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500">
                Students will need to match each left item with its corresponding right item
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse lg:flex-row justify-between items-stretch lg:items-center pt-4 border-t gap-3 lg:gap-0">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-3 lg:py-2 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full lg:w-auto"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-6 py-3 lg:py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full lg:w-auto"
            >
              {isSaving ? 'Saving...' : 'Save & Exit'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </StylesLoadedWrapper>
  );
}

export default function EditProblemPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EditProblemContent />
    </Suspense>
  );
}
