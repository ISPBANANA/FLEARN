"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";
import { useState } from "react";
import Link from "next/link";


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

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Infomation here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
        <div className="w-full max-w-[1620px] items-center flex flex-col px-25 py-7">
          <div className="w-full items-start flex flex-col mb-10">
              <div className="w-full items-start flex flex-row justify-between">
                <div className={`w-1/2 py-1 rounded-xl mx-2 ${step === 2 ? 'bg-purple-500' : 'bg-purple-500'}`}></div>
                <div className={`w-1/2 py-1 rounded-xl mx-2 ${step === 2 ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
              </div>
              <p className="text-start text-[#454545] text-lg mx-2 py-2">Step {step}/2</p>
          </div>
          <form className="max-w-[1220px] text-lg flex flex-col justify-center text-start text-[#454545] mb-4 py-10 w-full h-100 rounded-xl" style={{ boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)' }}>
            
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
