"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";
import { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { FileUp, Asterisk } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SessionManager } from '@/lib/session';
import SignupSearchParamsHandler from '@/components/SignupSearchParamsHandler';
import { useAPIWithCORSHandling } from '@/hooks/useCORS';
import { CORSErrorDisplay } from '@/components/CORSErrorHandler';

// Force dynamic rendering to avoid build-time issues with useSearchParams
export const dynamic = 'force-dynamic';

// Get API base URL for backend calls
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8099';
};

const API_BASE_URL = getApiBaseUrl();


interface UserData {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthTokens {
  access_token: string;
  id_token?: string;
}

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);
  
  // Form data states
  const [formData, setFormData] = useState({
    displayName: '',
    dateOfBirth: '',
    educationLevel: '',
    preferredSubjects: '',
    profilePicture: '',
    consentAgreed: false
  });

  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CORS error handling
  const { executeAPI, corsError, clearErrors } = useAPIWithCORSHandling();

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

  // Load default profile picture on component mount
  useEffect(() => {
    const loadDefaultProfilePicture = async () => {
      const defaultBase64 = await convertImageToBase64("/Chr/defaultpfp.jpg");
      if (defaultBase64) {
        setFormData(prev => ({ ...prev, profilePicture: defaultBase64 }));
        setImagePreview(defaultBase64);
      }
    };

    loadDefaultProfilePicture();
  }, []);

  const handleDataLoaded = useCallback((encodedData: string) => {
    try {
      // Decode the data from base64
      const decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString());
      
      // Store tokens and user data
      setUserData(decodedData.user);
      setAuthTokens({
        access_token: decodedData.access_token,
        id_token: decodedData.id_token
      });

      // Store in localStorage for persistence
      localStorage.setItem('signup_data', encodedData);
    } catch (e) {
      console.error('Failed to parse signup data:', e);
      localStorage.removeItem('signup_data');
      router.replace('/');
    }
  }, [router]);

  function goBack() {
    if (step === 1) {
      // Clear signup data and redirect to home
      localStorage.removeItem('signup_data');
      router.replace('/');
    } else if (step === 2) {
      setStep(1);
    }
  }

  const [fileName, setFileName] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, profilePicture: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleNext() {
    if (step === 1) {
      if (validateStep1()) {
        setShowValidationErrors(false);
        setStep(2);
      } else {
        setShowValidationErrors(true);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        // All validation passed, submit the form
        setShowValidationErrors(false);
        
        // Prevent multiple submissions
        if (isSubmitting) {
          return;
        }
        
        // Check if we have the required ID token
        if (!authTokens?.id_token) {
          alert('Authentication error: No valid token available. Please try logging in again.');
          router.replace('/');
          return;
        }
        
        setIsSubmitting(true);
        
        try {
          // Use relative path to leverage Next.js rewrites and avoid CORS
          const response = await fetch(`/api/users/profile`, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authTokens?.id_token}`,
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              profile_pic: formData.profilePicture,
              name: formData.displayName,
              email: userData?.email,
              birthdate: formData.dateOfBirth,
              edu_level: formData.educationLevel,
            })
          });
          
          if (response.ok) {
            // Get user profile data from the creation response
            const profileData = await response.json();
            //console.log('Profile creation response:', profileData);
            const userId = profileData.user.user_id;
            //console.log('Profile created successfully, user_id:', userId);
              
            // Save preferred subjects separately (don't let this block the redirect)
            if (formData.preferredSubjects.trim() !== '') {
              const subjectsArray = formData.preferredSubjects.split(',').map(s => s.trim()).filter(s => s);
              
              // Post each subject individually in the background
              const subjectPromises = subjectsArray.map(async (subject) => {
                try {
                  const subjectResponse = await fetch(`/api/users/preferred-subjects`, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${authTokens?.id_token}`,
                      'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                      subject: subject,
                      user_id: userId
                    })
                  });
                  
                  if (subjectResponse.ok) {
                    //console.log(`Subject ${subject} saved successfully`);
                  } else if (subjectResponse.status === 409) {
                    // Subject already exists, this is OK
                    //console.log(`Subject ${subject} already exists for user`);
                  } else {
                    console.error(`Failed to save subject ${subject}:`, subjectResponse.status);
                  }
                } catch (subjectError) {
                  console.error(`Error saving subject ${subject}:`, subjectError);
                }
              });
              
              // Save subjects in background, don't wait for completion
              Promise.all(subjectPromises).catch(error => {
                console.error('Error saving some subjects:', error);
              });
            }

            // Create user session after successful signup
            if (authTokens && userData) {
              SessionManager.setSession({
                user: {
                  sub: userData.sub,
                  email: userData.email,
                  name: formData.displayName,
                  picture: formData.profilePicture,
                  email_verified: true
                },
                access_token: authTokens.access_token,
                id_token: authTokens.id_token
              });
            }

            // Clear signup data from localStorage
            localStorage.removeItem('signup_data');
            
            //console.log('Redirecting to profile:', `/profile/${userId}`);
            
            // Use a small delay to ensure state updates are complete before redirect
            setTimeout(() => {
              // Redirect to user's profile page using the user_id from the created profile
              router.push(`/profile/${userId}`);
            }, 100);

          } else {
            const errorText = await response.text();
            let error;
            try {
              error = JSON.parse(errorText);
            } catch {
              error = { message: errorText };
            }
            console.error('Profile creation failed:', error, 'Status:', response.status);
            alert(`Failed to create account: ${error.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Network error during signup:', error);
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            alert('Network error: Unable to connect to server. Please check if the backend is running and CORS is configured properly.');
          } else {
            alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } finally {
          setIsSubmitting(false);
        }
      } else {
        setShowValidationErrors(true);
      }
    }
  }


  // Form input handlers
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, displayName: e.target.value }));
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }));
  };

  const handleEducationLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, educationLevel: e.target.value }));
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFormData(prev => {
      const currentSubjects = prev.preferredSubjects ? prev.preferredSubjects.split(',').filter(s => s.trim()) : [];
      const updatedSubjects = checked
        ? [...currentSubjects, subject]
        : currentSubjects.filter(s => s !== subject);
      return {
        ...prev,
        preferredSubjects: updatedSubjects.join(',')
      };
    });
  };

  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, consentAgreed: e.target.checked }));
  };

  // Validation functions
  const validateStep1 = () => {
    return formData.displayName.trim() !== '' && formData.dateOfBirth !== '';
  };

  const validateStep2 = () => {
    const hasSubjects = formData.preferredSubjects.trim() !== '';
    return (
      formData.educationLevel !== '' && 
      hasSubjects && 
      formData.consentAgreed
    );
  };

  const isFormValid = () => {
    if (step === 1) {
      return validateStep1();
    } else if (step === 2) {
      return validateStep2();
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <SignupSearchParamsHandler onDataLoaded={handleDataLoaded} />
      </Suspense>
      <Nav />

      {/* CORS Error Display */}
      {corsError && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <CORSErrorDisplay 
            error={corsError}
            onRetry={() => {
              clearErrors();
              handleNext();
            }}
            onDismiss={clearErrors}
          />
        </div>
      )}

      {/* Infomation here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
        <div className="w-full max-w-[1620px] items-center flex flex-col px-4 sm:px-8 lg:px-25 py-7">
          <div className="w-full items-start flex flex-col mb-6 sm:mb-10">
              <div className="w-full items-start flex flex-row justify-between">
                <div className={`w-1/2 py-1 rounded-xl mx-2 ${step === 2 ? 'bg-purple-500' : 'bg-purple-500'}`}></div>
                <div className={`w-1/2 py-1 rounded-xl mx-2 ${step === 2 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
              </div>
              <p className="text-start text-[#454545] text-lg mx-2 py-2">Step {step}/2</p>
          </div>
          <form className="max-w-[1220px] w-full text-base sm:text-lg flex flex-col justify-center text-center items-center text-[#454545] mb-4 py-6 sm:py-10 rounded-xl" style={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)' }}>
            <div className="w-full sm:w-3/4 lg:w-2/4 flex flex-col items-start px-4 sm:px-8 lg:px-10 max-w-[600px] gap-2 py-4">
              {step === 1 ? (
                <>
                  <label className="text-left w-full text-lg sm:text-xl mb-2 font-semibold">Profile Picture :</label>
                  <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center cursor-pointer mb-4">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-2 overflow-hidden  flex items-center justify-center bg-gray-100" style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg
                          className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[#9333EA] hover:text-[#9A41FF] transition-colors flex items-center gap-2 text-sm sm:text-base">Upload File <FileUp className="inline-block w-4 h-4 sm:w-5 sm:h-5" /></span>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  <label className="text-left w-full text-lg sm:text-xl mb-2 font-semibold flex items-center gap-1"><Asterisk className="text-[#9333EA]" width={12} height={12}/>Display name :</label>
                  <input 
                    type="input" 
                    placeholder="Ex: FunLearn" 
                    className={`w-full py-2 px-3 sm:px-4 mb-1 border rounded-xl text-sm sm:text-base ${
                      showValidationErrors && formData.displayName.trim() === '' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}
                    value={formData.displayName}
                    onChange={handleDisplayNameChange}
                    maxLength={15}
                  />
                  <p className="text-[#454545] text-xs sm:text-sm mt-1">{formData.displayName.length}/15 characters</p>
                  {showValidationErrors && formData.displayName.trim() === '' && (
                    <p className="text-red-500 text-xs sm:text-sm mb-3">Display name is required</p>
                  )}
                  {!(showValidationErrors && formData.displayName.trim() === '') && <div className="mb-3"></div>}
                  <label className="text-left w-full text-lg sm:text-xl mb-2 font-semibold flex items-center gap-1"><Asterisk className="text-[#9333EA]" width={12} height={12}/>Email :</label>
                  <input 
                    type="email" 
                    value={userData?.email || ''} 
                    placeholder="sample@gmail.com" 
                    className="w-full py-2 px-3 sm:px-4 mb-4 border border-gray-300 rounded-xl cursor-not-allowed text-sm sm:text-base" 
                    style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }} 
                    disabled
                  />
                  <label className="text-left w-full text-lg sm:text-xl mb-2 font-semibold flex items-center gap-1"><Asterisk className="text-[#9333EA]" width={12} height={12}/>Date of Birth :</label>
                  <input 
                    type="date" 
                    className={`w-full py-2 px-3 sm:px-4 mb-1 border rounded-xl text-sm sm:text-base ${
                      showValidationErrors && formData.dateOfBirth === '' 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}
                    value={formData.dateOfBirth}
                    onChange={handleDateOfBirthChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {showValidationErrors && formData.dateOfBirth === '' && (
                    <p className="text-red-500 text-xs sm:text-sm mb-3">Date of birth is required</p>
                  )}
                  {!(showValidationErrors && formData.dateOfBirth === '') && <div className="mb-3"></div>}
                </>
              ) : (
                <>
                  <label className="text-left w-full text-lg sm:text-xl mb-4 font-semibold flex items-center gap-1">
                    <Asterisk className="text-[#9333EA]" width={12} height={12}/>Education Level :
                  </label>
                  <div className="flex flex-col gap-3 mb-6 w-full px-2 sm:px-4">
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input 
                        type="radio" 
                        name="education" 
                        className="cursor-pointer w-4 h-4 text-purple-500 flex-shrink-0" 
                        value="primary"
                        checked={formData.educationLevel === 'primary'}
                        onChange={handleEducationLevelChange}
                      />
                      <span>Primary School</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input 
                        type="radio" 
                        name="education" 
                        className="cursor-pointer w-4 h-4 text-purple-500 flex-shrink-0" 
                        value="high_school"
                        checked={formData.educationLevel === 'high_school'}
                        onChange={handleEducationLevelChange}
                      />
                      <span>High School / Secondary</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input 
                        type="radio" 
                        name="education" 
                        className="cursor-pointer w-4 h-4 text-purple-500 flex-shrink-0" 
                        value="university"
                        checked={formData.educationLevel === 'university'}
                        onChange={handleEducationLevelChange}
                      />
                      <span>University / College</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input 
                        type="radio" 
                        name="education" 
                        className="cursor-pointer w-4 h-4 text-purple-500 flex-shrink-0" 
                        value="not_studying"
                        checked={formData.educationLevel === 'not_studying'}
                        onChange={handleEducationLevelChange}
                      />
                      <span>Not Currently Studying</span>
                    </label>
                  </div>
                  {showValidationErrors && formData.educationLevel === '' && (
                    <p className="text-red-500 text-xs sm:text-sm mb-4 px-2 sm:px-4">Please select an education level</p>
                  )}

                  <label className="text-left w-full text-lg sm:text-xl mb-4 font-semibold flex items-center gap-1">
                    <Asterisk className="text-[#9333EA]" width={12} height={12}/>Preferred Subject :
                  </label>
                  <div className="flex flex-col gap-3 mb-6 w-full px-2 sm:px-4">
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input 
                        type="checkbox" 
                        className="cursor-pointer w-4 h-4 text-purple-500 flex-shrink-0" 
                        checked={formData.preferredSubjects.includes('mathematics')}
                        onChange={(e) => handleSubjectChange('mathematics', e.target.checked)}
                      />
                      <span>Mathematics</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input 
                        type="checkbox" 
                        className="cursor-pointer w-4 h-4 text-purple-500 flex-shrink-0" 
                        checked={formData.preferredSubjects.includes('physics')}
                        onChange={(e) => handleSubjectChange('physics', e.target.checked)}
                      />
                      <span>Physics</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input 
                        type="checkbox" 
                        className="cursor-pointer w-4 h-4 text-purple-500 flex-shrink-0" 
                        checked={formData.preferredSubjects.includes('biology')}
                        onChange={(e) => handleSubjectChange('biology', e.target.checked)}
                      />
                      <span>Biology</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm sm:text-base">
                      <input 
                        type="checkbox" 
                        className="cursor-pointer w-4 h-4 text-purple-500 flex-shrink-0" 
                        checked={formData.preferredSubjects.includes('chemistry')}
                        onChange={(e) => handleSubjectChange('chemistry', e.target.checked)}
                      />
                      <span>Chemistry</span>
                    </label>
                  </div>
                  {showValidationErrors && formData.preferredSubjects.trim() === '' && (
                    <p className="text-red-500 text-xs sm:text-sm mb-4 px-2 sm:px-4">Please select at least one preferred subject</p>
                  )}

                  <label className="text-left w-full text-xs sm:text-sm mb-1 font-normal flex items-start gap-2">
                    <input 
                      type="checkbox" 
                      className="cursor-pointer w-4 h-4 text-purple-500 mt-1 flex-shrink-0" 
                      checked={formData.consentAgreed}
                      onChange={handleConsentChange}
                    />
                    <span>I hereby give my consent for the FLearn platform to collect, process, and use my personal data in accordance with the purposes outlined in the <Link href="/policy" target="_blank" className="text-[#9333EA] hover:underline">Privacy Policy</Link> and <Link href="/tos" target="_blank" className="text-[#9333EA] hover:underline">Terms of Service</Link>.</span>
                  </label>
                  {showValidationErrors && !formData.consentAgreed && (
                    <p className="text-red-500 text-xs sm:text-sm mb-4">You must agree to the terms and privacy policy to continue</p>
                  )}
                  {!(showValidationErrors && !formData.consentAgreed) && <div className="mb-4"></div>}
                </>
              )}
            </div>
          </form>
          <div className="w-full max-w-[1220px] items-start flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between py-5 px-4 sm:px-0">
              <button type="button" onClick={goBack} className={`cursor-pointer bg-[#ffffff] ${step === 2 ? 'text-[#454545] border border-[#454545]' : 'text-red-500 border border-red-500 hover:text-red-600 hover:border-red-600'} py-2 px-4 w-full sm:w-auto sm:min-w-[160px] lg:min-w-[200px] rounded transition text-sm sm:text-base`}>
                  {step === 2 ? 'Go Back' : 'Cancel'}
              </button>
              <button 
                type="button" 
                onClick={handleNext} 
                disabled={!isFormValid() || isSubmitting}
                className={`py-2 px-4 w-full sm:w-auto sm:min-w-[160px] lg:min-w-[200px] rounded transition text-sm sm:text-base ${
                  isFormValid() && !isSubmitting
                    ? 'bg-purple-400 text-white hover:bg-purple-500 cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                  {step === 2 ? (isSubmitting ? 'Creating...' : 'Create') : 'Next'}
              </button>
          </div>
        </div>

        <div className="py-10"></div>
      </div>

      <Footer />
    </div>
  );
}
