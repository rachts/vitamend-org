import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Learn how VitaMend collects, uses, stores, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-[#D8D2C4] rounded-lg p-6 sm:p-10">
        <header className="mb-8 border-b border-[#D8D2C4] pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1A14]">Privacy Policy</h1>
          <p className="text-sm text-[#5C5545] mt-2">Effective date: January 1, 2025</p>
        </header>

        <div className="space-y-8 text-[#1C1A14] leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">1. Overview and Purpose</h2>
            <p>
              VitaMend operates an online platform to facilitate the safe redistribution of unopened, unexpired surplus medicines from individual donors and institutions to certified community health clinics and registered non-profit healthcare providers in India. This Privacy Policy describes how we collect, store, and process your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect only information necessary to authenticate users, facilitate donations, and fulfill verification obligations:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5545]">
              <li>
                <strong className="text-[#1C1A14]">Account Information:</strong> Name, email address, password hash, and optional institutional role (donor, volunteer, clinic representative).
              </li>
              <li>
                <strong className="text-[#1C1A14]">Donation and Request Data:</strong> Medicine brand name, generic chemical name, manufacturer, batch number, expiry date, package quantity, and city or pickup location.
              </li>
              <li>
                <strong className="text-[#1C1A14]">Uploaded Packaging Images:</strong> Photographs of medicine strips, packaging cartons, or blister packs submitted for OCR scanning and pharmacist review.
              </li>
              <li>
                <strong className="text-[#1C1A14]">Technical Logs:</strong> Browser user-agent and IP addresses stored temporarily for rate limiting and fraud prevention.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">3. Data Storage and Infrastructure</h2>
            <p>
              Your user account data, medicine inventory records, and audit logs are securely stored in MongoDB Atlas cloud databases with encryption at rest and TLS encryption in transit. Uploaded packaging images are stored in secure blob object stores with restricted access.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">4. AI and OCR Processing</h2>
            <p>
              When you upload a medicine packaging photo, the image is transmitted securely to Google Gemini AI models for optical character recognition (OCR). The AI service extracts text including the drug name, expiration date, and batch number. These images are processed exclusively for text extraction and are never used to train external public models. Final distribution decisions are always verified by human personnel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">5. Information Sharing and Disclosure</h2>
            <p>
              VitaMend does not sell, rent, or trade your personal information. Information is shared only under the following strictly defined conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5545] mt-2">
              <li>
                <strong className="text-[#1C1A14]">With Registered Partner Clinics:</strong> Only donation item details and logistics pickup/dropoff coordinates are provided to coordinating receiving clinics.
              </li>
              <li>
                <strong className="text-[#1C1A14]">Infrastructure Providers:</strong> Database and hosting services (Vercel, MongoDB Atlas, Upstash Redis) operating under strict data protection agreements.
              </li>
              <li>
                <strong className="text-[#1C1A14]">Legal and Regulatory Compliance:</strong> When required by statutory Indian healthcare authorities or law enforcement subpoenas.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">6. User Rights and Data Deletion</h2>
            <p>
              You have the right to review, update, or request deletion of your account and personal records at any time. To request data export or permanent account deletion, please email us directly. We will process your request within 30 business days, subject to mandatory statutory retention requirements for completed medicine transfer manifests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">7. Contact Information</h2>
            <p>
              For privacy inquiries, data access requests, or policy questions, please contact our data team at:
            </p>
            <p className="mt-2 font-medium">
              Email: <a href="mailto:contact@vitamend.in" className="text-[#2C3320] underline hover:text-[#3D4A2E]">contact@vitamend.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
