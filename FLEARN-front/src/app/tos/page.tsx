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
            Terms of Service
          </p>

        {/* no.1 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">1) Who we are:</div>
          <div className="px-4 sm:px-6">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the FLEARN website, mobile apps, and services (collectively, the &ldquo;Service&rdquo;) operated by ISPBanana.
            By creating an account or using the Service, you agree to these Terms and to our Privacy Policy.
            If you don&rsquo;t agree, do not use the Service.
          </div>
        </div>

        {/* no.2 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">2) Registration:</div>
          <div className="px-4 sm:px-6">
            <div className="mb-2">In connection with registering for and using the Service, you agree:</div>
            <ul className="list-none space-y-2 pl-4 sm:pl-6">
              <li><span className="font-medium">(a)</span> To provide FLearn with accurate, current, and complete information about yourself and/or your organization as requested during the registration process.</li>
              <li><span className="font-medium">(b)</span> To maintain the confidentiality of your password and any other information related to the security of your account.</li>
              <li><span className="font-medium">(c)</span> To promptly update any registration information you provide to FLearn to ensure that it remains accurate, current, and complete.</li>
              <li><span className="font-medium">(d)</span> To accept full responsibility for all usage of your account and for any actions that occur through your account.</li>
            </ul>
          </div>
        </div>

        {/* no.3 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">3) Educational purpose (No professional advice):</div>
          <div className="px-4 sm:px-6">
            The Service teaches math, and science for study and practice.
            The Service does not provide professional, financial, medical, or legal advice and must not be used for high-stakes decisions or as a substitute for a qualified teacher/tutor.
          </div>
        </div>

        {/* no.4 */}  
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">  
          <div className="font-semibold mb-2">4) License & ownership:</div>    
          <ul className="list-none space-y-2 px-4 sm:px-6">
            <li>■ We grant you a limited, personal, non-transferable, revocable license to use the Service for learning.</li>
            <li>■ All content, software, and materials are owned by us or our licensors and are protected by IP laws.</li>
            <li>■ You may not copy, scrape, sell, reverse-engineer, or create derivative works except as allowed by law or these Terms.</li>
          </ul>
        </div>

        {/* no.5 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed"> 
          <div className="font-semibold mb-2">5) Your content:</div>         
          <div className="px-4 sm:px-6">
            If you submit text, answers, notes, images, or feedback ("User Content"), you grant us a worldwide, non-exclusive, 
            royalty-free license to use, reproduce, modify, and display that content only to operate and improve the service.
            You retain ownership of your User Content.
          </div>
        </div>

        {/* no.6 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">6) Acceptable use:</div>
          <div className="px-4 sm:px-6">
            <div className="mb-2">You agree not to:</div>
            <ul className="list-none space-y-2 pl-4 sm:pl-6 mb-2">
              <li>■ Upload malware, spam, or content that is unlawful, infringing, or harassing;</li>
              <li>■ Attempt to bypass security or copy our databases;</li>
              <li>■ Use automated tools to excessively query or harvest content;</li>
              <li>■ Misuse community features (if any).</li>
            </ul>
            <div>We may remove content or suspend accounts that violate these rules.</div>
          </div>
        </div>

        {/* no.7 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">7) Subscriptions, payments, and refunds (if applicable):</div>
          <ul className="list-none space-y-2 px-4 sm:px-6">
            <li>■ Some features may require a paid plan. Prices and features are shown at checkout and may change.</li>
            <li>■ Billing is handled by our payment processor; by purchasing, you agree to their terms.</li>
            <li>■ Renewals are automatic unless you cancel before the renewal date.</li>
            <li>■ Refunds follow our posted refund policy or local consumer laws.</li>
            <li>■ Trials/promotions may be changed or ended at any time.</li>
          </ul>
        </div>

        {/* no.8*/}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">          
          <div className="font-semibold mb-2">8) Classroom & minors:</div> 
          <ul className="list-none space-y-2 px-4 sm:px-6">
            <li>■ Parents/Guardians: You consent to your child&rsquo;s use and to our processing of necessary learning data as described in the Privacy Policy.</li>
            <li>■ Schools/Teachers: You confirm you have authority to create student accounts and to share the minimal data needed for classroom features. We act as a processor of that data.</li>
          </ul>
        </div>

        {/* no.9 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">9) Privacy & data:</div>
          <div className="px-4 sm:px-6">
            We collect only the data needed to run the Service (e.g., account info, device data, learning activity).
            See the Privacy Policy for details on what we collect, why, retention, children&rsquo;s data, international transfers, and your rights (access, deletion, objection).
            We may use de-identified, aggregated learning data for analytics and research.
          </div>
        </div>

        {/* no.10 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">10) Third-party links & services:</div>
          <div className="px-4 sm:px-6">
            The Service may link to third-party websites or use third-party libraries (e.g., analytics, payments).
            We&rsquo;re not responsible for their content or practices.
          </div>
        </div>

        {/* no.11 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">11) Beta features & changes:</div>
          <div className="px-4 sm:px-6">
            We may test new or experimental features ("Beta").
            Beta is provided as-is and may change or stop at any time.
            We may also update lessons (e.g., to fix errors or improve alignment).
          </div>
        </div>

        {/* no.12 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">12) DMCA / copyright complaints:</div>
          <div className="px-4 sm:px-6">
            <div className="mb-2">If you believe content infringes your copyright, send a notice to us with:</div>
            <ul className="list-none space-y-2 pl-4 sm:pl-6">
              <li><span className="font-medium">(a)</span> Identification of the work.</li>
              <li><span className="font-medium">(b)</span> The allegedly infringing material/URL.</li>
              <li><span className="font-medium">(c)</span> Your contact.</li>
              <li><span className="font-medium">(d)</span> A good-faith statement and signature. We may remove content and, when appropriate, terminate repeat infringes.</li>
            </ul>
          </div>
        </div>

        {/* no.13 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">13) Disclaimers:</div>
          <div className="px-4 sm:px-6">
            THE SERVICE AND CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE." 
            WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED (INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT).
            We do not warrant accuracy, reliability, or availability, and learning outcomes may vary.
          </div>
        </div>

        {/* no.14 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">14) Limitation of liability:</div>
          <div className="px-4 sm:px-6">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, 
            CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; 
            OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE EVENT (OR USD 50 IF YOU PAID NOTHING).
          </div>
        </div>

        {/* no.15 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">15) Indemnity:</div>
          <div className="px-4 sm:px-6">
            You agree to indemnify and hold us harmless from claims, damages, and costs arising from your misuse of the Service or violation of these Terms.
          </div>
        </div>

        {/* no.16 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">16) Termination:</div>
          <div className="px-4 sm:px-6">
            You may stop using the Service at any time.
            We may suspend or terminate your account for violations or risks to users or the platform.
            Upon termination, your license ends; sections that by nature should survive (e.g., IP, disclaimers, limits, indemnity) will survive.
          </div>
        </div>

        {/* no.17 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">17) Governing law & dispute resolution:</div>
          <div className="px-4 sm:px-6">
            These Terms are governed by the laws of Thailand, without regard to conflict of law rules.
            Disputes will be resolved in the courts of Thailand.
            Consumers may also have non-waivable local rights.
          </div>
        </div>

        {/* no.18 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <div className="font-semibold mb-2">18) Changes to these Terms:</div>
          <div className="px-4 sm:px-6">
            We may update these Terms. If changes are material, we&rsquo;ll provide notice (e.g., in-app or email).
            Continued use after the effective date means you accept the new Terms.
          </div>
        </div>

        {/* Contact */}
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
