"use client";

import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";
import FadeContent from '@/components/fadeContent'
import Link from 'next/link';
import { Suspense } from 'react';
import SearchParamsHandler from '@/components/SearchParamsHandler';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { CORSStatusIndicator } from '@/components/CORSStatus';

// Force dynamic rendering to avoid build-time issues with useSearchParams
export const dynamic = 'force-dynamic';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { profile } = useUserProfile();

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <Nav />

      {/* Hero Section */}
      <div className="h-[calc(100vh-64px)] w-full flex flex-row items-center justify-center z-0">
        {/* Left Part */}
        <div className="w-full max-w-[1620px] flex flex-row items-center justify-between p-8">
          <div className="flex justify-center items-center">
            <FadeContent blur={false} duration={200} easing="ease-out" initialOpacity={0}>
              <Image
                src="/landing/hero.png"
                alt="Hero Image"
                height={500}
                width={500}
                priority
                className="drop-shadow-lg"
                style={{ height: 'auto', width: 'auto' }}
              />
            </FadeContent>
          </div>
          {/* Right Part */}
          <div className="flex flex-col justify-center items-end space-y-10">
            <p className="text-7xl font-semibold text-[#454545] text-right">What do you<br></br>wanna <span className="font-bold text-[#9A41FF]">FLearn</span><br></br>Today</p>
            <Link
                href={isAuthenticated && profile?.user_id ? `/profile/${profile.user_id}` : "/api/auth/login"}
            >
              <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0}>
                  <button
                    className="bg-purple-400 text-white py-4 px-4 w-70 rounded hover:bg-purple-500 transition font-semibold flex flex-row items-center justify-center group"
                    style={{ position: 'relative', overflow: 'hidden', minWidth: '220px' }}
                  >
                    <span
                      className="flex items-center h-full"
                      style={{ transition: 'transform 0.4s cubic-bezier(0.77,0,0.175,1), opacity 0.3s', pointerEvents: 'none', marginRight: '8px' }}
                    >
                      <Image
                        src="/landing/google.webp"
                        alt="Google"
                        height={32}
                        width={32}
                        className="drop-shadow-sm drop-shadow-purple-600"
                        style={{
                          opacity: 0,
                          transform: 'translateX(-20px)',
                          transition: 'transform 0.4s cubic-bezier(0.77,0,0.175,1), opacity 0.3s',
                        }}
                      />
                    </span>
                    <p className="text-2xl">
                      {isAuthenticated && profile?.user_id ? "Go to Profile" : "Let's get started"}
                    </p>
                    <style jsx>{`
                      button.group {
                        position: relative;
                      }
                      button.group .text-2xl {
                        transition: transform 0.4s cubic-bezier(0.77,0,0.175,1), text-align 0.1s;
                        text-align: left;
                        width: 100%;
                        display: block;
                        position: relative;
                        left: 0;
                      }
                      button.group:hover .text-2xl {
                        transform: translateX(16px);
                        text-align: left;
                      }
                      button.group span > :global(img) {
                        opacity: 0;
                        transform: translateX(-20px);
                        transition: transform 0.4s cubic-bezier(0.77,0,0.175,1), opacity 0.3s;
                      }
                      button.group:hover span > :global(img) {
                        opacity: 1 !important;
                        transform: translateX(0) !important;
                      }
                    `}</style>
                  </button>
              </FadeContent>
            </Link>
          </div>
        </div>
      </div>

      {/* Infomation here */}
      <div className="p-4 h-auto w-full flex items-center z-1 bg-white flex-col" style={{ boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.25)' }}>\
        {/* Part 1 */}
        <div className="w-full max-w-[1420px] items-center flex flex-col p-25">
          <SplitText
            text="Fun Learning!"
            className="text-5xl text-center text-[#9A41FF] font-bold mb-4 min-w-[340px]"
            delay={50}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            textAlign="center"
          />
          <SplitText
            text="Our platform turns school subjects into fun, game-like lessons with streaks, rewards, and challenges that keep you motivated."
            className="text-lg text-center text-[#454545] mb-4 py-1 w-2/5 min-w-[300px]"
            delay={5}
            duration={0.1}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            textAlign="center"
          />
          <Image
            src="/landing/main1.png"
            alt="Fun Learning"
            height={200}
            width={200}
            className="mb-4 py-1 rounded-full drop-shadow-lg"
          />
        </div>
        {/* Part 2 */}
        <div className="w-full max-w-[1420px] items-center flex flex-row p-25 justify-between">
          <div className="w-1/2 items-start flex flex-col">
            <SplitText
              text="Value Proposition"
              className="text-5xl text-center text-[#9A41FF] font-bold mb-4 min-w-[340px]"
              delay={50}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              textAlign="left"
            />
            <SplitText
              text="Transform studying into a fun, game-like experience that helps students build confidence and understanding step by step. With interactive quizzes, progress tracking, and daily streaks, we make learning simple, motivating, and accessible anytime, anywhere!"
              className="text-lg text-left text-[#454545] mb-4 py-1 w-4/5 min-w-[300px]"
              delay={5}
              duration={0.1}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              textAlign="left"
            />
          </div>
          <div className="flex justify-center items-center w-1/2">
              <Image
                src="/landing/main2.png"
                alt="Value Proposition"
                height={300}
                width={300}
                style={{ objectFit: 'contain' }}
                className="rounded-2xl drop-shadow-lg"
              />
          </div>
        </div>
        {/* Part 3 */}
        <div className="w-full max-w-[1420px] items-center flex flex-row p-25 justify-between">
          <div className="flex justify-center items-center w-1/2">
              <Image
                src="/landing/main3.png"
                alt="Value Proposition"
                height={300}
                width={300}
                style={{ objectFit: 'contain' }}
                className="rounded-2xl drop-shadow-lg"
              />
          </div>
          <div className="w-1/2 flex flex-col items-start">
            <SplitText
              text="Endless Practice"
              className="text-5xl text-left text-[#9A41FF] font-bold mb-4 min-w-[340px]"
              delay={50}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              textAlign="left"
            />
            <SplitText
              text="Out of practice problems? No worries! Access a wide variety of problems from teachers across schools and universities—never run out of challenges again!"
              className="text-lg text-left text-[#454545] mb-4 py-1 w-4/5 min-w-[300px]"
              delay={5}
              duration={0.1}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              textAlign="left"
            />
          </div>
        </div>

        <div className="py-10"></div>
      </div>

      <Footer />
      
      {/* Development-only CORS Status Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <CORSStatusIndicator showDetails={false} autoCheck={false} />
        </div>
      )}
    </div>
  );
}
