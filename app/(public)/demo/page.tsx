import { LiveDemo } from "@/components/live-demo";
import Link from "next/link";

export default function DemoPage() {
  return <main className="min-h-screen bg-[#F5F2EC] px-4 pb-16 pt-24 text-[#3E492B]">
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="font-serif text-3xl">Medicine label extraction demo</h1>
      <p>Upload an image to request actual OCR results. Missing fields stay unknown and failed scans are not replaced with sample records. Extraction is not proof of authenticity or pharmacist approval.</p>
      <LiveDemo />
      <p>This demo does not create a donation, dispatch a courier, or record clinical impact. <Link href="/donate" className="underline">Open donation intake</Link> to submit a donation for review.</p>
    </div>
  </main>;
}
