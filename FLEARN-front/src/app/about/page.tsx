import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Infomation here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
        <div className="w-full max-w-[1620px] items-center flex flex-col px-25 py-7">
          <p className="text-5xl text-center text-[#9A41FF] font-bold">
            About us
          </p>

          <div className="text-lg text-start text-[#454545] mb-4 py-10 w-full">
            At Flearn, we believe learning should be engaging, accessible, and enjoyable. Too often, studying feels like a chore — with overwhelming lessons, weak foundations, or dull content that makes students lose motivation.<br></br>
            That&rsquo;s why we created Flearn: a web app that transforms education into a fun, game-like experience. With interactive quizzes, daily streaks, and progress tracking, we help learners stay motivated and make studying something to look forward to.
          </div>
          <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
            Our mission is to help students build confidence and understanding step by step. We empower teachers with tools to create and share effective practice sets, while giving students a platform that makes learning simpler, less stressful, and more rewarding.
          </div>
          <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
            Why Flearn?<br></br>
            ■ Engaging: Game-like learning with streaks and progress rewards<br></br>
            ■ Accessible: Easy-to-use platform for both students and teachers<br></br>
            ■ Motivating: Encourages consistent practice without the stress<br></br>
            Whether you&rsquo;re catching up on a subject, preparing for class, or exploring new topics, Flearn is here to make the journey more enjoyable.
          </div>
          <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
            🚀 Built with passion by ISPbanana.
          </div>
          <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
            Ispbanana (Flearn Team)<br></br>
            ■ Email: ispbanana.contact@gmail.com<br></br>
            ■ Website: hongrocker49.thddns.net:2725
          </div>
        </div>

        <div className="py-10"></div>
      </div>

      <Footer />
    </div>
  );
}
