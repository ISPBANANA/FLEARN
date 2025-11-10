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

      {/* effective date */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-1">Effective Date:</div>
            <div className="underline">September 2025</div>
          </div>

      {/* Introduction */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Introduction:</div>
            <div className="px-4 sm:px-6">
              Flearn, created by Ispbanana, is committed to protecting your privacy.
              This Privacy Policy explains what information we collect, why we collect it, how it is used, and the choices available to you.
              By using our app, you agree to the practices described in this policy.
            </div>
          </div>

      {/* Information collected */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Information We Collect:</div>
            <div className="px-4 sm:px-6">
              <div className="mb-2">We may collect several types of information to provide and improve our services:</div>
              <ul className="list-none space-y-2 pl-4 sm:pl-6">
                <li>■ Personal Information: Includes name, email, and login details you provide during sign-up.</li>
                <li>■ Usage Data: Records of quizzes taken, topics studied, progress, and learning streaks.</li>
                <li>■ Device & Technical Data: Such as browser type, IP address, operating system, and cookies used to analyze performance and security.</li>
                <li>■ Optional Information: Such as profile picture, education institution, or friends list connections.</li>
              </ul>
            </div>
          </div>

      {/* Sharing information */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Sharing of Information:</div>
            <div className="px-4 sm:px-6">
              <div className="mb-2">We respect your privacy and do not sell your personal information to third parties. We may share information only under limited circumstances:</div>
              <ul className="list-none space-y-2 pl-4 sm:pl-6">
                <li>■ With trusted service providers who help operate the platform (e.g., hosting, analytics).</li>
                <li>■ To comply with legal obligations, enforce our Terms of Service, or protect rights and safety.</li>
                <li>■ In case of a merger, acquisition, or restructuring, user information may be transferred.</li>
              </ul>
            </div>
          </div>

      {/* Data security */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Data Security:</div>
            <div className="px-4 sm:px-6">
              We take reasonable measures, including encryption and secure servers, to protect your data.
              However, no internet-based service can be fully secure, and we cannot guarantee absolute protection.
            </div>
          </div>

      {/* Your rights */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Your Rights:</div>
            <div className="px-4 sm:px-6">
              <div className="mb-2">Depending on your location, you may have certain rights under Thailand&rsquo;s Personal Data Protection Act (PDPA):</div>
              <ul className="list-none space-y-2 pl-4 sm:pl-6 mb-2">
                <li>■ Access, correct, or delete your personal information.</li>
                <li>■ Request a copy of your data in portable format.</li>
                <li>■ Restrict or object to how your data is processed.</li>
                <li>■ Withdraw consent for non-essential data usage.</li>
                <li>■ File a complaint with the Personal Data Protection Committee (PDPC).</li>
              </ul>
              <div>You can exercise these rights by contacting us at the email provided below.</div>
            </div>
          </div>

      {/* Children's privacy */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Children&rsquo;s Privacy:</div>
            <div className="px-4 sm:px-6">
              Flearn is intended for educational use by students.
              We do not knowingly collect personal data from children under 13 (or under the minimum legal age in your region) without parental consent.
              If we become aware of such data, we will delete it immediately.
            </div>
          </div>

      {/* Cookies */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Cookies & Tracking:</div>
            <div className="px-4 sm:px-6">
              Flearn may use cookies or similar technologies to remember user preferences, maintain login sessions, and analyze site performance.
              You can control or disable cookies through your browser settings, though some features may not work properly without them.
            </div>
          </div>

      {/* Changes to policy */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Changes to Policy:</div>
            <div className="px-4 sm:px-6">
              We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations.
              Any updates will be posted here with the revised date at the top. We encourage you to review it regularly.
            </div>
          </div>

      {/* Contact us */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Contact Us:</div>
            <div className="px-4 sm:px-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:
            </div>
          </div>
      
      {/* Ispbananateam */}
          <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <div className="font-semibold mb-2">Ispbanana (Flearn Team)</div>
            <ul className="list-none space-y-1 pl-4 sm:pl-6">
              <li>■ Email: ispbanana.contact@gmail.com</li>
              <li>■ Website: hongrocker49.thddns.net:2725</li>
            </ul>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
