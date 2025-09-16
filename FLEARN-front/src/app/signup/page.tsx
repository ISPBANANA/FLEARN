"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";
import { useState } from "react";
import Link from "next/link";
import { FileUp, Asterisk } from 'lucide-react';


export default function Home() {
  const [step, setStep] = useState(1);
  function goBack() {
    if (step === 1) {
      // Cancel appear smth
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
                  <input type="email" placeholder="sample@gmail.com" className="w-full py-2 px-4 mb-4 border border-gray-300 rounded-xl cursor-not-allowed" style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }} disabled/>
                  <label className="text-left w-full text-xl mb-2 font-semibold flex items-center gap-1"><Asterisk className="text-[#9333EA]" width={12} height={12}/>Date of Birth :</label>
                  <input type="date" className="w-full py-2 px-4 mb-4 border border-gray-300 rounded-xl" style={{ boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.25)' }}/>
                </>
              ) : (
                <>
                  <label className="text-left w-full text-xl mb-2">Username</label>
                  <input type="text" placeholder="Choose a username" className="w-full p-3 mb-4 border border-gray-300 rounded" />
                  <label className="text-left w-full text-xl mb-2">Password</label>
                  <input type="password" placeholder="Create a password" className="w-full p-3 mb-4 border border-gray-300 rounded" />
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
