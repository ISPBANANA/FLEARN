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
            Privacy Policy
          </p>
        </div>

        <div className="py-10"></div>
      </div>

      <Footer />
    </div>
  );
}
