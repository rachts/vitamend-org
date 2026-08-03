"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Package,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
  X,
  FileCheck,
  MapPin,
  Loader2,
} from "lucide-react";

export default function ClinicsPage() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  // Requirement Form State
  const [reqForm, setReqForm] = useState({
    clinicName: "",
    licenseNo: "",
    contactPerson: "",
    email: "",
    medicineNeeded: "",
    quantityNeeded: "",
    urgency: "HIGH",
    city: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReqForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsRequestModalOpen(false);
      setIsRegisterModalOpen(false);
      setSubmittedNotice("Your clinic request has been queued in our priority routing engine.");
      setTimeout(() => setSubmittedNotice(null), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Notice Toast */}
        {submittedNotice && (
          <div className="fixed top-20 right-6 z-50 bg-[#3E492B] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium text-xs border border-[#DDD8CF]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{submittedNotice}</span>
          </div>
        )}

        {/* Hero Section */}
        <div className="rounded-3xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
              <Building2 className="w-4 h-4" /> Community Clinic Portal
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-[#3E492B]">
              Priority Medicine Allocation for Health Centers
            </h1>
            <p className="text-base text-[#3E492B]/80 leading-relaxed font-sans">
              Connect your primary health clinic to our live surplus inventory. Receive verified essential pharmaceuticals with full digital chain-of-custody tracking.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="btn-primary text-xs px-5 py-3 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Report Urgent Shortage
              </button>
              <Link href="/store" className="btn-secondary text-xs px-5 py-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Browse Live Available Stock
              </Link>
            </div>
          </div>

          {/* Quick Stat Badge */}
          <div className="w-full lg:w-80 rounded-2xl border border-[#DDD8CF] bg-[#F5F2EC]/80 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#3E492B]/70">
                NETWORK STATUS
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div>
              <p className="text-3xl font-serif font-medium text-[#3E492B]">100% Free</p>
              <p className="text-xs text-[#3E492B]/70 mt-1">Direct redistribution to certified non-profit clinics</p>
            </div>
            <div className="pt-3 border-t border-[#DDD8CF] text-[11px] font-mono text-[#3E492B]/70 flex justify-between">
              <span>ACTIVE CLINICS: 42</span>
              <span>CDSCO VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Priority Queue & Live Allocations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Priority Shortage Queue */}
          <div className="lg:col-span-2 rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DDD8CF]">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
                  LIVE ROUTING QUEUE
                </span>
                <h2 className="text-2xl font-serif font-medium text-[#3E492B] mt-1">Priority Clinic Shortage Queue</h2>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shrink-0"
              >
                Submit Shortage Form <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { clinic: "Aarogya Health Center", city: "Alwar, Rajasthan", item: "Amoxicillin 500mg (200 units)", status: "DISPATCHED", urgency: "HIGH" },
                { clinic: "Seva Rural Clinic", city: "Pune, Maharashtra", item: "Metformin 500mg (150 units)", status: "MATCHING", urgency: "CRITICAL" },
                { clinic: "Jan Swasthya Kendra", city: "Patna, Bihar", item: "Paracetamol 500mg (300 units)", status: "VERIFYING", urgency: "MEDIUM" },
              ].map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-medium text-[#3E492B]">{q.clinic}</span>
                      <span className="text-[10px] font-mono text-[#3E492B]/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {q.city}
                      </span>
                    </div>
                    <p className="text-[#3E492B]/80 font-mono">Needed: {q.item}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                      {q.urgency}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Partner Registration Card */}
          <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#3E492B] text-white flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif font-medium text-[#3E492B]">Register Your Clinic</h3>
              <p className="text-xs text-[#3E492B]/80 leading-relaxed">
                Registered non-profit clinics and rural health centers receive automated surplus medicine alerts and priority allocation status.
              </p>
            </div>

            <div className="pt-4 border-t border-[#DDD8CF] space-y-3">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="btn-primary w-full justify-center text-xs py-3"
              >
                Register Clinic Credentials
              </button>
              <p className="text-[11px] text-[#3E492B]/60 text-center font-mono">Requires valid state medical registration</p>
            </div>
          </div>
        </div>

        {/* Verification Protocol Diagram */}
        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
              CLINICAL GUARANTEE
            </span>
            <h2 className="text-3xl font-serif font-medium text-[#3E492B]">How We Protect Clinic Patients</h2>
            <p className="text-xs sm:text-sm text-[#3E492B]/80">
              Every pharmaceutical unit dispatched to a partner clinic comes with complete verification history.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-xs text-[#3E492B]/80">
            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/50 space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">1. Factory Seal Audited</h4>
              <p className="leading-relaxed">Only intact, un-opened blister packs are approved. Loose pills are rejected instantly.</p>
            </div>

            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/50 space-y-2">
              <Clock className="w-6 h-6 text-[#3E492B]" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">2. 60+ Days Shelf Life</h4>
              <p className="leading-relaxed">Strict date filters ensure clinics have adequate time for patient prescription dispensing.</p>
            </div>

            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/50 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-teal-700" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">3. Pharmacist Certified</h4>
              <p className="leading-relaxed">Secondary sign-off logged by a licensed pharmacist before dispatch code generation.</p>
            </div>
          </div>
        </div>

        {/* Modal: Report Urgent Requirement */}
        {(isRequestModalOpen || isRegisterModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-[#DDD8CF] bg-[#F5F2EC] p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF]">
                <div>
                  <h3 className="text-lg font-serif font-medium text-[#3E492B]">
                    {isRequestModalOpen ? "Report Urgent Medicine Deficit" : "Register Clinic Credentials"}
                  </h3>
                  <p className="text-xs text-[#3E492B]/70">
                    {isRequestModalOpen
                      ? "Submit deficit requirements for priority automated matching."
                      : "Register your health center to receive verified surplus allocations."}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsRequestModalOpen(false);
                    setIsRegisterModalOpen(false);
                  }}
                  className="text-[#3E492B]/60 hover:text-[#3E492B] p-1 rounded-lg hover:bg-white/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-medium text-[#3E492B]">Clinic / Health Center Name *</label>
                    <input
                      type="text"
                      name="clinicName"
                      placeholder="e.g. Aarogya Community Clinic"
                      value={reqForm.clinicName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[#3E492B]">Medical Registration / Reg ID *</label>
                    <input
                      type="text"
                      name="licenseNo"
                      placeholder="e.g. REG-MH-8821"
                      value={reqForm.licenseNo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[#3E492B]">Contact Person / Medical Director *</label>
                    <input
                      type="text"
                      name="contactPerson"
                      placeholder="e.g. Dr. Ananya Sharma"
                      value={reqForm.contactPerson}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-medium text-[#3E492B]">Official Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="clinic@aarogya.org"
                      value={reqForm.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                      required
                    />
                  </div>

                  {isRequestModalOpen && (
                    <>
                      <div className="space-y-1">
                        <label className="font-medium text-[#3E492B]">Medicine Needed *</label>
                        <input
                          type="text"
                          name="medicineNeeded"
                          placeholder="e.g. Amoxicillin 500mg"
                          value={reqForm.medicineNeeded}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-medium text-[#3E492B]">Quantity Needed (Units) *</label>
                        <input
                          type="number"
                          name="quantityNeeded"
                          placeholder="e.g. 200"
                          value={reqForm.quantityNeeded}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-[#DDD8CF] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRequestModalOpen(false);
                      setIsRegisterModalOpen(false);
                    }}
                    className="btn-secondary text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs px-5 py-2 flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Clinic Credentials"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
