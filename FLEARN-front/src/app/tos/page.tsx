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
          <b style={{ fontWeight:550 }}>1&#41; Who we are:</b>
          <p className="px-5 sm:px-5">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the FLEARN website, mobile apps, and services (collectively, the &ldquo;Service&rdquo;) operated by ISPBanana. <br></br>
            By creating an account or using the Service, you agree to these Terms and to our Privacy Policy. <br></br>
            If you don&rsquo;t agree, do not use the Service.
          </p>
        </div>

        {/* no.2 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>2&#41; Registration:</b>
          <p className="px-5 sm:px-5">
            In connection with registering for and using the Service, you agree: <br></br>
            <p className="px-5 sm:px-5">
              <b style={{ fontWeight:550 }}>(a.)</b> To provide FLearn with accurate, current, and complete information about yourself and/or your organization as requested during the registration process.<br></br>          
              <b style={{ fontWeight:550 }}>(b.)</b> To maintain the confidentiality of your password and any other information related to the security of your account.<br></br>
              <b style={{ fontWeight:550 }}>(c.)</b> To promptly update any registration information you provide to FLearn to ensure that it remains accurate, current, and complete.<br></br>
              <b style={{ fontWeight:550 }}>(d.)</b> To accept full responsibility for all usage of your account and for any actions that occur through your account.<br></br>
            </p>
          </p>
        </div>

        {/* no.3 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>3&#41; Educational purpose (No professional advice):</b>
          <p className="px-5 sm:px-5">
            The Service teaches math, and science for study and practice. <br></br>
            The Service does not provide professional, financial, medical, or legal advice and must not be used for high-stakes decisions or as a substitute for a qualified teacher/tutor.<br></br>
          </p>
        </div>

        {/* no.4 */}  
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">  
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            <b style={{ fontWeight:550 }}></b>4&#41; License & ownership:
          </h2>    
            <p className="px-5 sm:px-5">
              ■ We grant you a limited, personal, non-transferable, revocable license to use the Service for learning.<br></br>
              ■ All content, software, and materials are owned by us or our licensors and are protected by IP laws.<br></br>
              ■ You may not copy, scrape, sell, reverse-engineer, or create derivative works except as allowed by law or these Terms.<br></br>
            </p>
        </div>

        {/* no.5 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed"> 
          <b style={{ fontWeight:550 }}>5&#41; Your content:</b>         
          <p className="px-5 sm:px-5">
            If you submit text, answers, notes, images, or feedback (“User Content”), you grant us a worldwide, non-exclusive, 
            royalty-free license to use, reproduce, modify, and display that content only to operate and improve the service. <br></br>
            You retain ownership of your User Content.<br></br>
          </p>
        </div>

        {/* no.6 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>6&#41; Acceptable use:</b>
          <p className="px-5 sm:px-5">
            You agree not to:<br></br>
            <p className="px-5 sm:px-5">
              ■ Upload malware, spam, or content that is unlawful, infringing, or harassing;<br></br>
              ■ Attempt to bypass security or copy our databases;<br></br>
              ■ Use automated tools to excessively query or harvest content;<br></br>
              ■ Misuse community features (if any). <br></br>
              ■ We may remove content or suspend accounts that violate these rules.<br></br>
            </p>
          </p>
        </div>

        {/* no.7 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>7&#41; Subscriptions, payments, and refunds (if applicable):</b>
          <p className="px-5 sm:px-5">
            ■ Some features may require a paid plan. Prices and features are shown at checkout and may change.<br></br>
            ■ Billing is handled by our payment processor; by purchasing, you agree to their terms.<br></br>
            ■ Renewals are automatic unless you cancel before the renewal date.<br></br>
            ■ Refunds follow our posted refund policy or local consumer laws.<br></br>
            ■ Trials/promotions may be changed or ended at any time.<br></br>
          </p>
        </div>

        {/* no.8*/}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">          
          <b style={{ fontWeight:550 }}>8&#41; Classroom & minors:</b> 
          <p className="px-5 sm:px-5">
            ■ Parents/Guardians: You consent to your child&rsquo;s use and to our processing of necessary learning data as described in the Privacy Policy.<br></br>
            ■ Schools/Teachers: You confirm you have authority to create student accounts and to share the minimal data needed for classroom features. We act as a processor of that data.<br></br>
          </p>
        </div>

        {/* no.9 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>9&#41; Privacy & data:</b>
          <p className="px-5 sm:px-5">
            We collect only the data needed to run the Service (e.g., account info, device data, learning activity). <br></br>
            See the Privacy Policy for details on what we collect, why, retention, children&rsquo;s data, international transfers, and your rights (access, deletion, objection). <br></br>
            We may use de-identified, aggregated learning data for analytics and research.<br></br>
          </p>
        </div>

        {/* no.10 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>10&#41; Third-party links & services:</b>
          <p className="px-5 sm:px-5">
            The Service may link to third-party websites or use third-party libraries (e.g., analytics, payments). <br></br>
            We&rsquo;re not responsible for their content or practices.<br></br>
          </p>
        </div>

        {/* no.11 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>11&#41; Beta features & changes:</b>
          <p className="px-5 sm:px-5">
            We may test new or experimental features (“Beta”).  <br></br>
            Beta is provided as-is and may change or stop at any time. <br></br>
            We may also update lessons (e.g., to fix errors or improve alignment).<br></br>
          </p>
        </div>

        {/* no.12 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>12&#41; DMCA / copyright complaints:</b>
            If you believe content infringes your copyright, send a notice to us with: <br></br>
            <p className="px-5 sm:px-5">
              <b style={{ fontWeight:550 }}>(a.)</b> Identification of the work.<br></br>
              <b style={{ fontWeight:550 }}>(b.)</b> The allegedly infringing material/URL.<br></br>
              <b style={{ fontWeight:550 }}>(c.)</b> Your contact.<br></br>
              <b style={{ fontWeight:550 }}>(d.)</b> A good-faith statement and signature. We may remove content and, when appropriate, terminate repeat infringes.<br></br>
            </p>
        </div>

        {/* no.13 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>13&#41; Disclaimers:</b>
          <p className="px-5 sm:px-5">
            THE SERVICE AND CONTENT ARE PROVIDED “AS IS” AND “AS AVAILABLE.” 
            WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED (INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT). <br></br>
            We do not warrant accuracy, reliability, or availability, and learning outcomes may vary.<br></br>
          </p>
        </div>

        {/* no.14 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>14&#41; Limitation of liability:</b>
          <p className="px-5 sm:px-5">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, 
            CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; 
            OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE EVENT (OR USD 50 IF YOU PAID NOTHING).<br></br>
          </p>
        </div>

        {/* no.15 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>15&#41; Indemnity:</b>
          <p className="px-5 sm:px-5">
            You agree to indemnify and hold us harmless from claims, damages, and costs arising from your misuse of the Service or violation of these Terms.<br></br>
          </p>
        </div>

        {/* no.16 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>16&#41; Termination:</b>
          <p className="px-5 sm:px-5">
            You may stop using the Service at any time. <br></br>
            We may suspend or terminate your account for violations or risks to users or the platform. <br></br>
            Upon termination, your license ends; sections that by nature should survive (e.g., IP, disclaimers, limits, indemnity) will survive.<br></br>
          </p>
        </div>

        {/* no.17 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>17&#41; Governing law & dispute resolution:</b>
          <p className="px-5 sm:px-5">
            These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law rules. <br></br>
            Disputes will be resolved in the courts of [City/Country] (or by arbitration at [Institution], if you choose to add arbitration). <br></br>
            Consumers may also have non-waivable local rights.<br></br>
          </p>
        </div>

        {/* no.18 */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
          <b style={{ fontWeight:550 }}>18&#41; Changes to these Terms: </b>
          <p className="px-5 sm:px-5">
            We may update these Terms. If changes are material, we&rsquo;ll provide notice (e.g., in-app or email). <br></br>
            Continued use after the effective date means you accept the new Terms.<br></br>
          </p>
        </div>

        {/* Contact */}
        <div className="text-base sm:text-lg text-left text-[#454545] py-6 w-full leading-relaxed">
            <b style={{ fontWeight:550 }}>Ispbanana (Flearn Team)</b><br></br>
            ■ Email: ispbanana.contact@gmail.com<br></br>
            ■ Website: hongrocker49.thddns.net:2725<br></br>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
