import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Infomation here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-10 bg-white flex-col min-h-screen">
        <div className="w-full max-w-none mx-auto items-center flex flex-col px-6 sm:px-8 md:px-12 lg:px-24 py-7">
          <p className="text-3xl sm:text-4xl md:text-5xl text-center text-[#9A41FF] font-bold leading-tight">
            Privacy Policy
          </p>

          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Effective Date: </b><br></br>
            <u>September 2025</u>
          </div>

          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Introduction: </b>
            <p className="px-5 sm:px-5">
              Flearn, created by Ispbanana, is committed to protecting your privacy. <br></br>
              This Privacy Policy explains what information we collect, why we collect it, how it is used, and the choices available to you. <br></br>
              By using our app, you agree to the practices described in this policy.<br></br>
            </p>
          </div>

          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Information We Collect: </b>
            <p className="px-5 sm:px-5">
              We may collect several types of information to provide and improve our services: <br></br>
              <p className="px-5 sm:px-5">
                ■ Personal Information: Includes name, email, and login details you provide during sign-up. <br></br>
                ■ Usage Data: Records of quizzes taken, topics studied, progress, and learning streaks. <br></br>
                ■ Device & Technical Data: Such as browser type, IP address, operating system, and cookies used to analyze performance and security. <br></br>
                ■ Optional Information: Such as profile picture, education institution, or friends list connections.<br></br>
              </p>
            </p>
          </div>

          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Sharing of Information:</b>
            <p className="px-5 sm:px-5">
              We respect your privacy and do not sell your personal information to third parties. <br></br>
              We may share information only under limited circumstances: <br></br>
              <p className="px-5 sm:px-5">
                ■ With trusted service providers who help operate the platform (e.g., hosting, analytics). <br></br>
                ■ To comply with legal obligations, enforce our Terms of Service, or protect rights and safety. <br></br>
                ■ In case of a merger, acquisition, or restructuring, user information may be transferred.<br></br>
              </p>
            </p>
          </div>

          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Data Security:</b> 
            <p className="px-5 sm:px-5">
              We take reasonable measures, including encryption and secure servers, to protect your data. <br></br>
              However, no internet-based service can be fully secure, and we cannot guarantee absolute protection.<br></br>
            </p>
          </div>

          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Your Rights:</b> 
            <p className="px-5 sm:px-5">
              Depending on your location, you may have certain rights under Thailand&rsquo;s Personal Data Protection Act (PDPA):<br></br>
              <p className="px-5 sm:px-5">
                ■ Access, correct, or delete your personal information.<br></br>
                ■ Request a copy of your data in portable format.<br></br>
                ■ Restrict or object to how your data is processed.<br></br>
                ■ Withdraw consent for non-essential data usage.<br></br>
                ■ File a complaint with the Personal Data Protection Committee (PDPC).<br></br>
              </p>
              You can exercise these rights by contacting us at the email provided below.
            </p>
          </div>

          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Children&rsquo;s Privacy: </b>
            <p className="px-5 sm:px-5">
              Flearn is intended for educational use by students. <br></br>
              We do not knowingly collect personal data from children under 13 (or under the minimum legal age in your region) without parental consent. <br></br>
              If we become aware of such data, we will delete it immediately.<br></br>
            </p>
          </div>

          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Cookies & Tracking: </b>
            <p className="px-5 sm:px-5">
              Flearn may use cookies or similar technologies to remember user preferences, maintain login sessions, and analyze site performance.<br></br> 
              You can control or disable cookies through your browser settings, though some features may not work properly without them.<br></br>
            </p>
          </div>

          <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
            Changes to Policy: 
            <p className="px-5">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. 
              Any updates will be posted here with the revised date at the top. We encourage you to review it regularly.
            </p>
          </div>

          <div className="text-lg text-start text-[#454545] mb-4 py-3 w-full">
            Contact Us: 
            <p className="px-5">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:
            </p>
          </div>
          
          <div className="text-lg text-start text-[#454545] mb-4 py-20 w-full">
              Ispbanana (Flearn Team)<br></br>
              ■ Email: ispbanana.contact@gmail.com<br></br>
              ■ Website: hongrocker49.thddns.net:2725<br></br>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
