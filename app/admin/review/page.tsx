"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ShieldAlert, CheckCircle, XCircle, ImageIcon } from "lucide-react";

interface VerificationResult {
  confidence?: number;
  isTampered?: boolean;
  isExpired?: boolean;
  isDuplicate?: boolean;
  isRecalled?: boolean;
  aiReasoning?: string;
}

interface ReviewMed {
  _id: string;
  name?: string;
  genericName?: string;
  dosage?: string;
  batchNumber?: string;
  manufacturer?: string;
  images?: string[];
  verificationResult?: VerificationResult;
}

interface FormData {
  name: string;
  genericName: string;
  dosage: string;
  batchNumber: string;
  manufacturer: string;
  [key: string]: string;
}

export default function AdminReviewPage() {
  const [queue, setQueue] = useState<ReviewMed[]>([]);
  const [selectedMed, setSelectedMed] = useState<ReviewMed | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "", genericName: "", dosage: "", batchNumber: "", manufacturer: ""
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/admin/review-queue");
      const data = await res.json();
      if (data.medicines) setQueue(data.medicines);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (selectedMed) {
      setFormData({
        name: selectedMed.name || "",
        genericName: selectedMed.genericName || "",
        dosage: selectedMed.dosage || "",
        batchNumber: selectedMed.batchNumber || "",
        manufacturer: selectedMed.manufacturer || "",
      });
      setNotes("");
    }
  }, [selectedMed]);

  const handleDecision = async (decision: "approved" | "rejected") => {
    if (!selectedMed) return;
    setLoading(true);

    try {
      await fetch("/api/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: selectedMed._id,
          decision,
          notes,
          correctedData: formData,
        }),
      });

      setSelectedMed(null);
      fetchQueue();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F5F2EC] overflow-hidden noise-bg">
      {/* LEFT PANE - QUEUE */}
      <div className="w-1/3 border-r border-[#ddd8cf] bg-white overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-[#ddd8cf] sticky top-0 bg-white z-10 shadow-sm">
          <h2 className="text-3xl font-serif text-[#3E492B]">Review Queue</h2>
          <p className="text-sm font-sans text-gray-500 mt-1">{queue.length} items pending review</p>
        </div>
        <div className="p-4 space-y-4 flex-1">
          {queue.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No items pending review.</div>
          ) : (
            queue.map((med) => {
              const res = med.verificationResult || {};
              return (
                <div
                  key={med._id}
                  onClick={() => setSelectedMed(med)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedMed?._id === med._id
                      ? "border-[#3E492B] bg-[#F5F2EC]/50 shadow-md"
                      : "border-[#ddd8cf] hover:border-[#3E492B]/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">{med.name}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        (res.confidence || 0) < 60 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {res.confidence || 0}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {res.isTampered && <span className="bg-red-100 text-red-700 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">Tamper Risk</span>}
                    {res.isExpired && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">Expired</span>}
                    {res.isDuplicate && <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">Duplicate</span>}
                    {res.isRecalled && <span className="bg-red-800 text-white text-[10px] px-2 py-1 rounded uppercase tracking-wider font-bold">Recalled</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE - DETAIL */}
      <div className="w-2/3 bg-[#F5F2EC] overflow-y-auto">
        {selectedMed ? (
          <div className="p-8 max-w-5xl mx-auto space-y-8">
            <h1 className="text-4xl font-serif text-gray-900">Verify: {selectedMed.name}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LEFT COL: Images & AI */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-[#ddd8cf] shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Provided Images
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedMed.images?.map((img: string, idx: number) => (
                      <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-[#ddd8cf]">
                        <Image width={500} height={500} unoptimized src={img} alt="medicine" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-800 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> AI Reasoning
                  </h3>
                  <p className="text-sm font-sans text-blue-900 leading-relaxed whitespace-pre-wrap">
                    {selectedMed.verificationResult?.aiReasoning || "No AI reasoning provided."}
                  </p>
                </div>
              </div>

              {/* RIGHT COL: Form & Decision */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-[#ddd8cf] shadow-sm">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                    Extracted Data (Edit to Correct)
                  </h3>
                  <div className="space-y-4">
                    {['name', 'genericName', 'dosage', 'batchNumber', 'manufacturer'].map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-gray-500 mb-1 capitalize">
                          {field.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <input
                          type="text"
                          value={formData[field]}
                          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                          className="w-full bg-[#F5F2EC] border border-[#ddd8cf] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E492B]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-[#ddd8cf] shadow-sm">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Review Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes explaining your decision..."
                    className="w-full bg-[#F5F2EC] border border-[#ddd8cf] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#3E492B]"
                  ></textarea>
                  
                  <div className="flex gap-4 mt-6">
                    <button
                      disabled={loading}
                      onClick={() => handleDecision("approved")}
                      className="flex-1 bg-[#3E492B] hover:bg-[#2d361f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" /> Approve
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleDecision("rejected")}
                      className="flex-1 bg-red-700 hover:bg-red-800 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <ShieldAlert className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-serif">Select an item from the queue to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
