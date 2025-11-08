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
      <div className="w-full flex flex-col-reverse md:flex-row items-center justify-center z-0 min-h-[calc(100vh-64px)]">
        {/* Left Part */}
        <div className="w-full max-w-[1620px] flex flex-col md:flex-row items-center justify-between p-4 sm:p-8">
          <div className="flex justify-center items-center w-full md:w-1/2 mb-8 md:mb-0">
            <FadeContent blur={false} duration={200} easing="ease-out" initialOpacity={0}>
              <Image
                src="/landing/hero.png"
                alt="Hero Image"
                height={500}
                width={500}
                priority
                className="drop-shadow-lg w-[220px] h-auto sm:w-[320px] md:w-[400px] lg:w-[500px]"
                style={{ height: 'auto', width: 'auto' }}
              />
            </FadeContent>
          </div>
          {/* Right Part */}
          <div className="flex flex-col justify-center items-center md:items-end space-y-6 w-full md:w-1/2">
            <p className="text-3xl sm:text-5xl md:text-7xl font-semibold text-[#454545] text-center md:text-right leading-tight w-full md:w-4/5">
              <span className="block sm:hidden">What do you wanna<br /> <span className="font-bold text-[#9A41FF]">FLearn</span> Today</span>
              <span className="hidden sm:block">What do you<br />wanna <span className="font-bold text-[#9A41FF]">FLearn</span><br />Today</span>
            </p>
            <Link
                href={isAuthenticated && profile?.user_id ? `/profile/${profile.user_id}` : "/api/auth/login"}
            >
              <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0}>
                  <button
                    className="cursor-pointer bg-purple-400 text-white py-4 px-4 w-70 rounded hover:bg-purple-500 transition font-semibold flex flex-row items-center justify-center group"
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
            <br />
          </div>
        </div>
      </div>
      
      {/* Infomation here */}
      <div className="pt-24 sm:pt-32 md:pt-40 pb-8 sm:px-12 md:px-24 h-auto w-full flex items-center z-1 bg-white flex-col" style={{ boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.25)' }}>
        {/* Part 1 */}
        <div className="w-full max-w-[1420px] items-center flex flex-col px-2 sm:px-6 py-8 mb-30">
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
        <div className="w-full max-w-[1420px] items-center flex flex-col md:flex-row px-2 sm:px-6 py-8 md:ml-8 lg:ml-20 mb-50">
          <div className="w-full flex flex-col items-center md:items-start md:w-[50%] mb-8 md:mb-0">
            <SplitText
              text="Value Proposition"
              className="text-5xl text-center md:text-left text-[#9A41FF] font-bold mb-4 min-w-[340px]"
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
              text="Transform studying into a fun, game-like experience that helps students build confidence and understanding step by step. With interactive quizzes, progress tracking, and daily streaks, we make learning simple, motivating, and accessible anytime, anywhere!"
              className="text-lg text-center md:text-left text-[#454545] mb-4 py-1 max-w-[350px] md:max-w-[600px]"
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
          <div className="flex justify-center items-center w-full md:w-1/2">
              <Image
                src="/landing/main2.png"
                alt="Value Proposition"
                height={260}
                width={300}
                style={{ objectFit: 'cover' }}
                className="rounded-2xl drop-shadow-lg w-[180px] sm:w-[260px] md:w-[300px] h-[180px] sm:h-[260px] md:h-[300px]"
              />
          </div>
        </div>
        
        {/* Part 3 */}
        <div className="w-full max-w-[1420px] flex flex-col md:flex-row items-center px-2 sm:px-6 py-8 md:ml-12 lg:ml-24">
          {/* <div className="w-full flex flex-col items-center md:items-start md:w-[50%] "></div> */}
          <div className="flex justify-center items-center w-full md:w-1/2 order-last md:order-first">
            <Image
              src="/landing/main3.png"
              alt="Value Proposition"
              height={200}
              width={200}
              style={{ objectFit: 'contain' }}
              className="rounded-2xl drop-shadow-lg w-[180px] sm:w-[220px] md:w-[300px]"
            />
          </div>
          <div className="w-full flex flex-col items-center md:items-start md:w-1/2">
            <SplitText
              text="Endless Practice"
              className="text-5xl text-center md:text-left text-[#9A41FF] font-bold mb-4 min-w-[340px]"
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
              text="Out of practice problems? No worries! Access a wide variety of problems from teachers across schools and universities—never run out of challenges again!"
              className="text-lg text-center md:text-left text-[#454545] mb-4 py-1 max-w-[350px] md:max-w-[600px]"
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

        <div className="py-6 sm:py-10"></div>
      </div>

      <Footer />
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <CORSStatusIndicator showDetails={false} autoCheck={false} />
        </div>
      )}
    </div>
  );
}
