import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing the use of the VitaMend platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-[#D8D2C4] rounded-lg p-6 sm:p-10">
        <header className="mb-8 border-b border-[#D8D2C4] pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1A14]">Terms of Service</h1>
          <p className="text-sm text-[#5C5545] mt-2">Effective date: January 1, 2025</p>
        </header>

        <div className="space-y-8 text-[#1C1A14] leading-relaxed text-sm sm:text-base">
          <section className="bg-[#EDE9DF] border border-[#D8D2C4] p-4 rounded-md">
            <h2 className="text-base font-semibold text-[#2C3320] uppercase tracking-wide mb-1">
              Important Healthcare Notice
            </h2>
            <p className="text-sm text-[#1C1A14]">
              VitaMend is a non-profit technology platform connecting surplus medicine donors with licensed clinics and verified charitable healthcare providers. VitaMend is not a licensed pharmacy, drug manufacturer, or medical practice. VitaMend does not provide medical advice, diagnosis, or treatment recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using VitaMend, whether as a donor, healthcare volunteer, or receiving clinic representative, you agree to be bound by these Terms of Service. If you do not agree with these terms, you must not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">2. Acceptable Use and Eligibility</h2>
            <p>
              Users must be at least 18 years old to register an account or submit donations. Receiving institutions must be registered non-profit health organizations, charitable dispensaries, or certified community healthcare centers holding appropriate local health operational permissions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">3. Medicine Donation Requirements</h2>
            <p className="mb-2">All medicines submitted for redistribution through VitaMend must strictly satisfy the following criteria:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5545]">
              <li>
                <strong className="text-[#1C1A14]">Original Intact Packaging:</strong> Medicines must be sealed in their original manufacturer blister strips, bottles, or foil packs with intact safety seals.
              </li>
              <li>
                <strong className="text-[#1C1A14]">Shelf-Life Requirement:</strong> Medicines must have a minimum of 60 days remaining before the printed expiration date at the time of donation intake.
              </li>
              <li>
                <strong className="text-[#1C1A14]">Legible Packaging:</strong> Batch numbers, expiry dates, and manufacturer names must be clearly readable on the physical packaging.
              </li>
              <li>
                <strong className="text-[#1C1A14]">Non-Controlled Substances:</strong> We strictly prohibit narcotics, Schedule X/H1 psychotropic substances, cold-chain temperature-sensitive biologics without documented cold logs, opened syrups, and loose unsealed tablets.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">4. Prohibited Activities</h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5545] mt-2">
              <li>Sell, trade, or commercially monetize medicines obtained through the platform.</li>
              <li>Submit counterfeit, adulterated, expired, or recalled pharmaceutical products.</li>
              <li>Upload misleading, altered, or fraudulent packaging photographs.</li>
              <li>Directly distribute prescription medicines to individuals without a valid medical prescription from a licensed healthcare practitioner.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">5. Verification and Safety Limitations</h2>
            <p>
              Our optical character recognition (OCR) pipeline assists staff by reading text from packaging photographs. Automated checks are screening aids only. Every item must be inspected in person by qualified personnel prior to dispensing. VitaMend makes no warranty, express or implied, regarding pharmaceutical efficacy or storage history prior to donation intake.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, VitaMend, its founders, volunteers, and partners shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of the platform, donation processing, delivery logistics, or third-party administration of medicines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">7. Contact Information</h2>
            <p>
              For legal inquiries, partnership requests, or operational questions:
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
