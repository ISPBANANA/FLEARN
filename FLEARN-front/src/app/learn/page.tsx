import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import SplitText from "@/components/SplitText";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <Footer />
    </div>
  );
}
