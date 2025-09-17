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
        <div className="text-lg text-start text-[#454545] mb-4 py-10 w-full">
          Effective Date<br></br>
          September 2025
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 w-full">
          Introduction: <br></br>
            Flearn, created by Ispbanana, is committed to protecting your privacy. 
            This Privacy Policy explains what information we collect, why we collect it, how it is used, and the choices available to you. 
            By using our app, you agree to the practices described in this policy.<br></br>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
          Information We Collect: <br></br>
          We may collect several types of information to provide and improve our services: <br></br>
          ■ Personal Information: Includes name, email, and login details you provide during sign-up. <br></br>
          ■ Usage Data: Records of quizzes taken, topics studied, progress, and learning streaks. <br></br>
          ■ Device & Technical Data: Such as browser type, IP address, operating system, and cookies used to analyze performance and security. <br></br>
          ■ Optional Information: Such as profile picture, education institution, or friends list connections.<br></br>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
          Sharing of Information: <br></br>
          We respect your privacy and do not sell your personal information to third parties. 
          We may share information only under limited circumstances: <br></br>
          ■ With trusted service providers who help operate the platform (e.g., hosting, analytics). <br></br>
          ■ To comply with legal obligations, enforce our Terms of Service, or protect rights and safety. <br></br>
          ■ In case of a merger, acquisition, or restructuring, user information may be transferred.<br></br>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
          Data Security: <br></br>
          We take reasonable measures, including encryption and secure servers, to protect your data. 
          However, no internet-based service can be fully secure, and we cannot guarantee absolute protection.
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
          Your Rights: <br></br>
          Depending on your location, you may have certain rights under Thailand’s Personal Data Protection Act (PDPA):<br></br>
          ■ Access, correct, or delete your personal information.<br></br>
          ■ Request a copy of your data in portable format.<br></br>
          ■ Restrict or object to how your data is processed.<br></br>
          ■ Withdraw consent for non-essential data usage.<br></br>
          ■ File a complaint with the Personal Data Protection Committee (PDPC).<br></br>
          You can exercise these rights by contacting us at the email provided below.
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
          Children’s Privacy: <br></br>
           Flearn is intended for educational use by students. 
           We do not knowingly collect personal data from children under 13 (or under the minimum legal age in your region) without parental consent. 
           If we become aware of such data, we will delete it immediately.
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
          Cookies & Tracking: <br></br>
          Flearn may use cookies or similar technologies to remember user preferences, maintain login sessions, and analyze site performance. 
          You can control or disable cookies through your browser settings, though some features may not work properly without them.
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
          Changes to Policy: <br></br>
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. 
          Any updates will be posted here with the revised date at the top. We encourage you to review it regularly.
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
          Contact Us: <br></br>
          If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-20 w-full">
            Ispbanana (Flearn Team)<br></br>
            ■ Email: ispbanana.contact@gmail.com<br></br>
            ■ Website: hongrocker49.thddns.net:2725
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
