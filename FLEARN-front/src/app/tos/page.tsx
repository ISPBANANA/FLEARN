import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />

      {/* Infomation here */}
      <div className="my-2 p-4 h-auto w-full flex items-center z-10 bg-white flex-col min-h-screen">
        <div className="w-full max-w-[1200px] mx-auto items-center flex flex-col px-6 sm:px-8 md:px-12 lg:px-24 py-7">
          <p className="text-3xl sm:text-4xl md:text-5xl text-center text-[#9A41FF] font-bold leading-tight">
            Terms of Service
          </p>
        <div className="text-lg text-start text-[#454545] py-10 w-full">
          1&#41; Who we are:<br></br>
          <p className="px-5">
            These Terms of Service (“Terms”) govern your use of the FLEARN website, mobile apps, and services (collectively, the “Service”) operated by ISPBanana.<br></br>
            By creating an account or using the Service, you agree to these Terms and to our Privacy Policy. If you don&rsquo;t agree, do not use the Service.<br></br>
          </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 w-full">
            2&#41; Registration:<br></br>
          <p className="px-5">
            In connection with registering for and using the Service, you agree<br></br>
            (a.) to provide FLearn with accurate, current, and complete information about yourself and/or your organization as requested during the registration process.<br></br>
            (b.) to maintain the confidentiality of your password and any other information related to the security of your account.<br></br>
            (c.) to promptly update any registration information you provide to FLearn to ensure that it remains accurate, current, and complete.<br></br>
            (d.) to accept full responsibility for all usage of your account and for any actions that occur through your account.<br></br>
          </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-5 w-full">
          3&#41; Educational purpose (no professional advice):<br></br>
            <p className="px-5">
              The Service teaches math, and science for study and practice. <br></br>
              The Service does not provide professional, financial, medical, or legal advice and must not be used for high-stakes decisions or as a substitute for a qualified teacher/tutor.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          4&#41; License & ownership:<br></br>
            <p className="px-5">
              ■ We grant you a limited, personal, non-transferable, revocable license to use the Service for learning.<br></br>
              ■ All content, software, and materials are owned by us or our licensors and are protected by IP laws.<br></br>
              ■ You may not copy, scrape, sell, reverse-engineer, or create derivative works except as allowed by law or these Terms.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          5&#41; Your content:<br></br>
          <p className="px-5">
            If you submit text, answers, notes, images, or feedback (“User Content”), you grant us a worldwide, non-exclusive, 
            royalty-free license to use, reproduce, modify, and display that content only to operate and improve the Service. 
            You retain ownership of your User Content.<br></br>
          </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          6&#41; Acceptable use:<br></br>
            You agree not to:<br></br>
            <p className="px-5">
              ■ Upload malware, spam, or content that is unlawful, infringing, or harassing;<br></br>
              ■ Attempt to bypass security or copy our databases;<br></br>
              ■ Use automated tools to excessively query or harvest content;<br></br>
              ■ Misuse community features (if any). <br></br>
              ■ We may remove content or suspend accounts that violate these rules.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          7&#41; Subscriptions, payments, and refunds (if applicable):<br></br>
            <p className="px-5">
              ■ Some features may require a paid plan. Prices and features are shown at checkout and may change.<br></br>
              ■ Billing is handled by our payment processor; by purchasing, you agree to their terms.<br></br>
              ■ Renewals are automatic unless you cancel before the renewal date.<br></br>
              ■ Refunds follow our posted refund policy or local consumer laws.<br></br>
              ■ Trials/promotions may be changed or ended at any time.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          8&#41; Classroom & minors:<br></br>
            <p className="px-5">
              ■ Parents/Guardians: You consent to your child&rsquo;s use and to our processing of necessary learning data as described in the Privacy Policy.<br></br>
              ■ Schools/Teachers: You confirm you have authority to create student accounts and to share the minimal data needed for classroom features. We act as a processor of that data.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          9&#41; Privacy & data:<br></br>
            <p className="px-5">
              We collect only the data needed to run the Service (e.g., account info, device data, learning activity). 
              See the Privacy Policy for details on what we collect, why, retention, children&rsquo;s data, international transfers, and your rights (access, deletion, objection). 
              We may use de-identified, aggregated learning data for analytics and research.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          10&#41; Third-party links & services:<br></br>
            <p className="px-5">
              The Service may link to third-party websites or use third-party libraries (e.g., analytics, payments). 
              We&rsquo;re not responsible for their content or practices.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          11&#41; Beta features & changes:<br></br>
            <p className="px-5">
              We may test new or experimental features (“Beta”). 
              Beta is provided as-is and may change or stop at any time. 
              We may also update lessons (e.g., to fix errors or improve alignment).<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          12&#41; DMCA / copyright complaints:<br></br>
            If you believe content infringes your copyright, send a notice to us with: <br></br>
            <p className="px-5">
              (a) Identification of the work.<br></br>
              (b) The allegedly infringing material/URL.<br></br>
              (c) Your contact.<br></br>
              (d) A good-faith statement and signature. We may remove content and, when appropriate, terminate repeat infringes.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          13&#41; Disclaimers:<br></br>
            <p className="px-5">
              THE SERVICE AND CONTENT ARE PROVIDED “AS IS” AND “AS AVAILABLE.” 
              WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED (INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT). 
              We do not warrant accuracy, reliability, or availability, and learning outcomes may vary.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          14&#41; Limitation of liability:<br></br>
            <p className="px-5">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; 
              OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE 12 MONTHS BEFORE THE EVENT (OR USD 50 IF YOU PAID NOTHING).<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          15&#41; Indemnity:<br></br>
            <p className="px-5">
              You agree to indemnify and hold us harmless from claims, damages, and costs arising from your misuse of the Service or violation of these Terms.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          16&#41; Termination:<br></br>
          <p className="px-5">
            You may stop using the Service at any time. We may suspend or terminate your account for violations or risks to users or the platform. 
            Upon termination, your license ends; sections that by nature should survive (e.g., IP, disclaimers, limits, indemnity) will survive.<br></br>
          </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          17&#41; Governing law & dispute resolution:<br></br>
            <p className="px-5">
              These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law rules. 
              Disputes will be resolved in the courts of [City/Country] (or by arbitration at [Institution], if you choose to add arbitration). 
              Consumers may also have non-waivable local rights.<br></br>
            </p>
        </div>
        <div className="text-lg text-start text-[#454545] mb-4 py-2 w-full">
          18&#41; Changes to these Terms:<br></br>
            <p className="px-5">
              We may update these Terms. If changes are material, we&rsquo;ll provide notice (e.g., in-app or email). 
              Continued use after the effective date means you accept the new Terms.
            </p>
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
