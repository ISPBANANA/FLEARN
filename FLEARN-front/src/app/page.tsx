import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero Section */}
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center z-0">
        <p className="text-7xl font-semibold text-[#454545] text-right">What do you<br></br>wanna <span className="font-bold text-[#9A41FF]">FLearn</span><br></br>Today</p>
      </div>

      {/* Infomation here */}
      <div className="p-4 h-auto w-full flex items-center z-1 bg-white flex-col" style={{ boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.25)' }}>
        <div className="w-full max-w-[1620px] items-center flex flex-col p-25">
          <SplitText
            text="Fun Learning!"
            className="text-5xl text-center text-[#9A41FF] font-bold mb-4"
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
            className="text-lg text-center text-[#454545] mb-4 py-1 w-2/5"
            delay={5}
            duration={0.1}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            textAlign="center"
          />
        </div>
        <div className="w-full max-w-[1620px] items-start flex flex-col p-25">
          <SplitText
            text="Value Proposition"
            className="text-5xl text-center text-[#9A41FF] font-bold mb-4"
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
            className="text-lg text-left text-[#454545] mb-4 py-1 w-2/5"
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
        <div className="w-full max-w-[1620px] items-end flex flex-col p-25">
          <SplitText
            text="Endless Practice"
            className="text-5xl text-center text-[#9A41FF] font-bold mb-4 w-2/5"
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
            className="text-lg text-left text-[#454545] mb-4 py-1 w-2/5"
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

        <div className="py-10"></div>
      </div>

      <Footer />
    </div>
  );
}
