"use client";

import React, { useState } from "react";
import { FAQSection } from "@/components/faq";
import {
  Users,
  UserCheck,
  Truck,
  ShieldCheck,
  Award,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";

export default function VolunteerPage() {
  const [selectedRole, setSelectedRole] = useState("Medical Volunteer");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    qualification: "",
    availability: "Part-time (2-5 hrs/wk)",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessNotice("Thank you for registering! Our volunteer orientation team will contact you within 48 hours.");
      setFormData({ fullName: "", email: "", phone: "", city: "", qualification: "", availability: "Part-time (2-5 hrs/wk)" });
      setTimeout(() => setSuccessNotice(null), 5000);
    }, 1200);
  };

  const roles = [
    {
      title: "Medical Volunteer",
      icon: UserCheck,
      badge: "Licensed Pharmacists & MDs",
      desc: "Perform remote or on-site secondary verification of OCR-flagged medicine lots, batch numbers, and physical packaging integrity.",
    },
    {
      title: "Pickup Logistics Agent",
      icon: Truck,
      badge: "Field Ops",
      desc: "Collect sealed surplus medicine donations from residential doorstep pickups and institutional hospital partners in your city.",
    },
    {
      title: "Verification Inspector",
      icon: ShieldCheck,
      badge: "Quality Control",
      desc: "Inspect intake packages at our regional storage hubs, checking temperature indicators and expiration threshold limits.",
    },
    {
      title: "Campus Ambassador",
      icon: GraduationCap,
      badge: "Student Leaders",
      desc: "Lead medicine intake drives, awareness workshops, and clinic partnership campaigns across university campuses.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Hero */}
        <div className="rounded-3xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
            <Users className="w-4 h-4" /> Join the VitaMend Volunteer Corps
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#3E492B]">
            Turn Your Time into Life-Saving Impact
          </h1>
          <p className="text-base sm:text-lg text-[#3E492B]/80 leading-relaxed font-sans max-w-2xl mx-auto">
            Whether you are a licensed pharmacist, medical student, logistics coordinator, or passionate advocate, your skills keep our redistribution network moving.
          </p>
        </div>

        {/* Roles Grid */}
        <div id="roles" className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
              VOLUNTEER PATHWAYS
            </span>
            <h2 className="text-3xl font-serif font-medium text-[#3E492B]">Available Volunteer Roles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.title;
              return (
                <div
                  key={r.title}
                  onClick={() => setSelectedRole(r.title)}
                  className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-[#3E492B] bg-white shadow-md ring-2 ring-[#3E492B]/20"
                      : "border-[#DDD8CF] bg-white/60 hover:bg-white/80"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#3E492B] text-white flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono bg-[#F5F2EC] px-2 py-0.5 rounded border border-[#DDD8CF] text-[#3E492B]/70">
                        {r.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-medium text-[#3E492B]">{r.title}</h3>
                    <p className="text-xs text-[#3E492B]/80 leading-relaxed">{r.desc}</p>
                  </div>

                  <div className="pt-3 border-t border-[#DDD8CF]/60 text-xs font-semibold text-[#3E492B] flex items-center gap-1">
                    {isSelected ? "Role Selected ✓" : "Click to Apply →"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Perks & Certification Section */}
        <div id="certification" className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
              BENEFITS & RECOGNITION
            </span>
            <h2 className="text-3xl font-serif font-medium text-[#3E492B]">Volunteer Perks & Certification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#3E492B]/80">
            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-2">
              <Award className="w-6 h-6 text-emerald-700" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">Official Certification</h4>
              <p className="leading-relaxed">Verifiable certificate of volunteer service detailing hours completed and lives impacted.</p>
            </div>

            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-2">
              <GraduationCap className="w-6 h-6 text-[#3E492B]" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">Clinical Training</h4>
              <p className="leading-relaxed">Workshops on digital pharmaceutical supply chains, CDSCO compliance, and OCR verification.</p>
            </div>

            <div className="p-5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 space-y-2">
              <HeartHandshake className="w-6 h-6 text-amber-700" />
              <h4 className="font-serif text-base font-medium text-[#3E492B]">Healthcare Network</h4>
              <p className="leading-relaxed">Connect with leading clinical pharmacologists, health NGO directors, and medical mentors.</p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 space-y-6">
          <div className="pb-4 border-b border-[#DDD8CF]">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
              JOIN US TODAY
            </span>
            <h2 className="text-2xl font-serif font-medium text-[#3E492B] mt-1">Volunteer Application Form</h2>
          </div>

          {successNotice && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-medium text-[#3E492B]">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Vikramaditya Nair"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#3E492B]">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#3E492B]">City / Location *</label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#3E492B]">Role Selection</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-white text-[#3E492B]"
                >
                  {roles.map((r) => (
                    <option key={r.title} value={r.title}>
                      {r.title} ({r.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-medium text-[#3E492B]">Professional Background / Qualifications</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="e.g. B.Pharm Student / Licensed Pharmacist / Logistics Coordinator"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#3E492B]/60 font-mono">SELECTED ROLE: {selectedRole.toUpperCase()}</span>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs px-6 py-3 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Application <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* FAQ Section */}
        <FAQSection title="Volunteer FAQ" />
      </div>
    </div>
  );
}
