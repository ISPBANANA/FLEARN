import Image from "next/image";
import { Nav } from "@/components/nav";
import SplitText from "@/components/SplitText";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Hero Section */}
      <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center z-0">
        <p className="text-7xl font-bold text-[#000000] text-right">What do you<br></br>wanna <span className="font-bold text-[#9A41FF]">FLearn</span><br></br>Today</p>
      </div>

      {/* Infomation here */}
      <div className="p-15 h-100 w-full flex items-center z-1 bg-white flex-col" style={{ boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.25)' }}>
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
          className="text-lg text-center text-black opacity-70 mb-4 py-1 w-2/5"
          delay={5}
          duration={0.1}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          textAlign="center"
        />

        {/* Add more sections, cards, or features here */}
      </div>

    </div>
  );
}
