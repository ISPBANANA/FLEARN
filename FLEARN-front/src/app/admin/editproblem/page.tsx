"use client";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
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
  
  // Check if user came from add button
  const fromAdd = searchParams.get('from') === 'add';
  
  // Form states
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [status, setStatus] = useState<'public' | 'private'>('public');
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
      
      // Check if user came from add button
      if (!fromAdd) {
        router.push('/admin');
      }
    }
  }, [isAuthenticated, profile, authLoading, profileLoading, fromAdd, router]);

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
    if (!name.trim()) {
      alert('Please enter a problem name');
      return;
    }
    
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

    // Validate options for choice-based questions
    if (['multiple_choice', 'true_false'].includes(questionType)) {
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

    try {
      setIsSaving(true);
      
      // Prepare question data based on type
      const content: any = {
        question_text: questionText,
      };

      if (['multiple_choice', 'true_false'].includes(questionType)) {
        content.options = options.map(opt => ({
          id: opt.id.toLowerCase(),
          text: opt.text,
          is_correct: opt.isCorrect
        }));
      }

      // TODO: Add handlers for other question types (fill_blank, matching, essay)

      const questionData = {
        subject_id: parseInt(subjectId),
        topic_id: topicId ? parseInt(topicId) : undefined,
        type_name: questionType,
        difficulty: difficulty,
        points: difficulty * 10, // Points based on difficulty
        status: status,
        content: content
      };

      // TODO: Call API to create question
      console.log('Creating question:', questionData);
      
      alert('Question saved successfully!');
      
      if (exitAfter) {
        router.push('/admin');
      } else {
        // Reset form
        setName('');
        setQuestionText('');
        setOptions([
          { id: 'A', text: '', isCorrect: false },
          { id: 'B', text: '', isCorrect: false },
          { id: 'C', text: '', isCorrect: false },
          { id: 'D', text: '', isCorrect: false },
        ]);
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question. Please try again.');
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
      <Nav />
      
      <div className="max-w-4xl mx-auto p-8 my-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-600">Add New Problem</h1>
          <p className="text-[#454545] mt-2">Create a new question for your students</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Row 1: Name, Subject, Sub-Topic */}
          <div className="grid grid-cols-3 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#454545] mb-2">
                <span className="text-red-500">*</span> Name :
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: FunLearn"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545]"
              />
            </div>

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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545] bg-white"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.subject_id} value={subject.subject_id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Topic */}
            <div>
              <label className="block text-sm font-medium text-[#454545] mb-2">
                <span className="text-red-500">*</span> Sub-Topic :
              </label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-[#454545] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Select Topic</option>
                {topics.map((topic) => (
                  <option key={topic.topic_id} value={topic.topic_id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Question Type, Status, Difficulty */}
          <div className="grid grid-cols-3 gap-4">
            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Question Type :
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              >
                <option value="">Select Type</option>
                {questionTypes.map((type) => (
                  <option key={type.type_name} value={type.type_name}>
                    {type.display_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Status :
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'public' | 'private')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Difficulty (0-10) :
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={difficulty}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (val >= 0 && val <= 10) {
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
              
              <div className="grid grid-cols-2 gap-4">
                {/* True Button */}
                <button
                  type="button"
                  onClick={() => setTrueFalseAnswer('true')}
                  className={`relative p-8 rounded-lg border-2 transition-all ${
                    trueFalseAnswer === 'true'
                      ? 'border-green-500 bg-green-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-green-400 hover:bg-green-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      trueFalseAnswer === 'true' ? 'bg-green-500' : 'bg-gray-300'
                    }`}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={`text-xl font-bold ${
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
                  className={`relative p-8 rounded-lg border-2 transition-all ${
                    trueFalseAnswer === 'false'
                      ? 'border-red-500 bg-red-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-red-400 hover:bg-red-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      trueFalseAnswer === 'false' ? 'bg-red-500' : 'bg-gray-300'
                    }`}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className={`text-xl font-bold ${
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
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 border-2 border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-6 py-2 border-2 border-purple-500 text-purple-500 rounded-md hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save & Exit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
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
