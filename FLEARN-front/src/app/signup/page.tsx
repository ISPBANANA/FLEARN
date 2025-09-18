"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FileUp, Asterisk } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';


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
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(null);

  useEffect(() => {
    const loadSignupData = () => {
      // Try to get data from URL first
      const encodedData = searchParams.get('data');
      
      if (!encodedData) {
        // If not in URL, try localStorage
        const storedData = localStorage.getItem('signup_data');
        if (!storedData) {
          router.replace('/');
          return;
        }
        return storedData;
      }
      
      return encodedData;
    };

    try {
      const encodedData = loadSignupData();
      if (!encodedData) return;

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
      
      // If data was from URL, remove it
      if (searchParams.get('data')) {
        router.replace('/signup');
      }
    } catch (e) {
      console.error('Failed to parse signup data:', e);
      localStorage.removeItem('signup_data');
      router.replace('/');
    }
  }, [searchParams]);

  function goBack() {
    if (step === 1) {
      // Clear signup data and redirect to home
      localStorage.removeItem('signup_data');
      router.replace('/');
    } else if (step === 2) {
      setStep(1);
    }
  }

  function handleNext() {
    if (step === 1) {
      //Check Data
      setStep(2);
    } else if (step === 2) {
      //check all data and submit
    }
  }

  const [fileName, setFileName] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Infomation here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
        <div className="w-full max-w-[1620px] min-w-[600px] items-center flex flex-col px-25 py-7">
          <div className="w-full items-start flex flex-col mb-10">
              <div className="w-full items-start flex flex-row justify-between">
                <div className={`w-1/2 py-1 rounded-xl mx-2 ${step === 2 ? 'bg-purple-500' : 'bg-purple-500'}`}></div>
                <div className={`w-1/2 py-1 rounded-xl mx-2 ${step === 2 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
              </div>
              <p className="text-start text-[#454545] text-lg mx-2 py-2">Step {step}/2</p>
          </div>
          <form className="max-w-[1220px] text-lg flex flex-col justify-center text-center items-center text-[#454545] mb-4 py-10 w-full h-auto rounded-xl" style={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)' }}>
            <div className="w-2/4 flex flex-col items-start px-10 max-w-[600px] min-w-[400px] gap-2 py-4">
              {step === 1 ? (
                <>
                  <label className="text-left w-full text-xl mb-2 font-semibold">Profile Picture :</label>
                  <label htmlFor="file-upload" className="w-full flex flex-col items-center justify-center cursor-pointer mb-4">
                    <div className="w-40 h-40 rounded-full mb-2 overflow-hidden  flex items-center justify-center bg-gray-100" style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}>
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <svg
                          className="w-16 h-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[#9333EA] hover:text-[#9A41FF] transition-colors flex items-center gap-2">Upload File <FileUp className="inline-block" /></span>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>

                  <label className="text-left w-full text-xl mb-2 font-semibold flex items-center gap-1"><Asterisk className="text-[#9333EA]" width={12} height={12}/>Display name :</label>
                  <input type="input" placeholder="Ex: FunLearn" className="w-full py-2 px-4 mb-4 border border-gray-300 rounded-xl" style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}/>
                  <label className="text-left w-full text-xl mb-2 font-semibold flex items-center gap-1"><Asterisk className="text-[#9333EA]" width={12} height={12}/>Email :</label>
                  <input 
                    type="email" 
                    value={userData?.email || ''} 
                    placeholder="sample@gmail.com" 
                    className="w-full py-2 px-4 mb-4 border border-gray-300 rounded-xl cursor-not-allowed" 
                    style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }} 
                    disabled
                  />
                  <label className="text-left w-full text-xl mb-2 font-semibold flex items-center gap-1"><Asterisk className="text-[#9333EA]" width={12} height={12}/>Date of Birth :</label>
                  <input type="date" className="w-full py-2 px-4 mb-4 border border-gray-300 rounded-xl" style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}/>
                </>
              ) : (
                <>
                  <label className="text-left w-full text-xl mb-4 font-semibold flex items-center gap-1">
                    <Asterisk className="text-[#9333EA]" width={12} height={12}/>Education Level :
                  </label>
                  <div className="flex flex-col gap-3 mb-6 w-full px-4">
                    <label className="flex items-center gap-3">
                      <input type="radio" name="education" className="w-4 h-4 text-purple-500" />
                      <span>Primary School</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="education" className="w-4 h-4 text-purple-500" />
                      <span>High School / Secondary</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="education" className="w-4 h-4 text-purple-500" />
                      <span>University / College</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="education" className="w-4 h-4 text-purple-500" />
                      <span>Not Currently Studying</span>
                    </label>
                  </div>

                  <label className="text-left w-full text-xl mb-4 font-semibold flex items-center gap-1">
                    <Asterisk className="text-[#9333EA]" width={12} height={12}/>Preferred Subject :
                  </label>
                  <div className="flex flex-col gap-3 mb-6 w-full px-4">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-purple-500" />
                      <span>Mathematics</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-purple-500" />
                      <span>Physics</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-purple-500" />
                      <span>Biology</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="w-4 h-4 text-purple-500" />
                      <span>Chemistry</span>
                    </label>
                  </div>

                  <label className="text-left w-full text-sm mb-4 font-normal flex items-start gap-2">
                    <input type="checkbox" className="w-4 h-4 text-purple-500 mt-1" />
                    <span>I hereby give my consent for the FLearn platform to collect, process, and use my personal data in accordance with the purposes outlined in the <Link href="/policy" target="_blank" className="text-[#9333EA] hover:underline">Privacy Policy</Link> and <Link href="/tos" target="_blank" className="text-[#9333EA] hover:underline">Terms of Service</Link>.</span>
                  </label>
                </>
              )}
            </div>
          </form>
          <div className="w-full max-w-[1220px] items-start flex flex-row justify-between py-5">
              <button type="button" onClick={goBack} className={`bg-[#ffffff] ${step === 2 ? 'text-[#454545] border border-[#454545]' : 'text-red-500 border border-red-500 hover:text-red-600 hover:border-red-600'} py-2 px-4 w-50 rounded transition`}>
                  {step === 2 ? 'Go Back' : 'Cancel'}
              </button>
              <button type="button" onClick={handleNext} className="bg-purple-400 text-white py-2 px-4 w-50 rounded hover:bg-purple-500 transition">
                  {step === 2 ? 'Create' : 'Next'}
              </button>
          </div>
        </div>

        <div className="py-10"></div>
      </div>

      <Footer />
    </div>
  );
}
