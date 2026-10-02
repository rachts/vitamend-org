import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI and OCR Disclosure",
  description: "How VitaMend uses artificial intelligence to assist label verification and why human verification remains mandatory.",
};

export default function AiDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#F5F2EC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white border border-[#D8D2C4] rounded-lg p-6 sm:p-10">
        <header className="mb-8 border-b border-[#D8D2C4] pb-6">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1C1A14]">AI and OCR Disclosure</h1>
          <p className="text-sm text-[#5C5545] mt-2">Transparency regarding machine learning in medicine intake</p>
        </header>

        <div className="space-y-8 text-[#1C1A14] leading-relaxed text-sm sm:text-base">
          <section className="bg-[#EDE9DF] border border-[#D8D2C4] p-4 rounded-md">
            <h2 className="text-base font-semibold text-[#2C3320] uppercase tracking-wide mb-1">
              Core Safety Principle
            </h2>
            <p className="text-sm text-[#1C1A14]">
              Label scanning is assisted by AI and may contain errors. Always verify medicine details against the physical packaging before distribution. Automated models never make final dispensing or distribution decisions without human review.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">1. Where AI is Used</h2>
            <p>
              When a donor or volunteer uploads a photograph of a medicine box, blister strip, or bottle, VitaMend uses an optical character recognition (OCR) pipeline assisted by Google Gemini multimodal models to read text directly from the image.
            </p>
            <p className="mt-2 text-[#5C5545]">
              The model extracts the printed brand name, active generic salt, manufacturer name, batch or lot number, and expiration date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">2. Third-Party Model Provider</h2>
            <p>
              Packaging images submitted for scanning are securely transmitted to Google Gemini vision APIs. Only images submitted directly through the intake scan form are sent. No donor account passwords, government identity documents, or financial information are ever transmitted to the vision model.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">3. Known Limitations of Machine Vision</h2>
            <p className="mb-2">Computer vision models can make mistakes. Factors that can cause OCR errors include:</p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5545]">
              <li>Low lighting, glares, or reflections on foil blister packaging.</li>
              <li>Faded, curved, or partially obscured printed batch stamps.</li>
              <li>Non-standard date formats (e.g. DD/MM/YYYY vs. MM/YY).</li>
              <li>Similar-sounding drug names or alternate manufacturer spellings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">4. Mandatory Human Verification</h2>
            <p>
              Because pharmaceutical errors carry serious healthcare risks, VitaMend strictly treats automated OCR as an intake accelerator, not an authority:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#5C5545] mt-2">
              <li>Donors review and correct every field before submitting their donation.</li>
              <li>Pharmacists and trained verification staff inspect physical packaging prior to inventory admission.</li>
              <li>Every physical shipment is cross-verified against verified packaging details before delivery to recipient clinics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-[#2C3320] mb-3">5. Questions or Feedback</h2>
            <p>
              If you have questions about our technology or wish to report an OCR discrepancy:
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
