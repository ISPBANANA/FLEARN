import Image from "next/image";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

interface ProfilePageProps {
  params: {
    uuid: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { uuid } = params;
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Information here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-1 bg-white flex-col min-h-screen">
        <h1>Profile Page</h1>
        <p>User UUID: {uuid}</p>
      </div>

      <Footer />
    </div>
  );
}
