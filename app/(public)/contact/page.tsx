"use client";

import React, { useState } from "react";
import {
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  MessageSquare,
  Building2,
  Heart,
  Users,
  Newspaper,
  HelpCircle,
  Loader2,
} from "lucide-react";

export default function ContactPage() {
  const [category, setCategory] = useState<"Donation" | "Clinic" | "Volunteer" | "Media" | "General">("General");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccessNotice("Thank you for reaching out! Our healthcare team will respond within 24 business hours.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSuccessNotice(null), 5000);
    }, 1200);
  };

  const categories = [
    { id: "Donation", label: "Donation Inquiry", icon: Heart },
    { id: "Clinic", label: "Clinic & Hospital Support", icon: Building2 },
    { id: "Volunteer", label: "Volunteer Program", icon: Users },
    { id: "Media", label: "Media & Press", icon: Newspaper },
    { id: "General", label: "General Support", icon: HelpCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Hero */}
        <div className="rounded-3xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" /> Contact & Support Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight text-[#3E492B]">
            We&apos;re Here to Help
          </h1>
          <p className="text-sm sm:text-base text-[#3E492B]/80 font-sans">
            Connect with our medical operations team, donor assistance staff, or clinic coordination unit.
          </p>
        </div>

        {/* Main Grid: Form + Direct Contact Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inquiry Form */}
          <div className="lg:col-span-2 rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 space-y-6">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
                DIRECT INQUIRY
              </span>
              <h2 className="text-2xl font-serif font-medium text-[#3E492B] mt-1">Send Us a Message</h2>
            </div>

            {successNotice && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Category Selector Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#3E492B]/80 block">Select Inquiry Department *</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as "Donation" | "Clinic" | "Volunteer" | "Media" | "General")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isSelected
                          ? "bg-[#3E492B] text-white"
                          : "bg-[#F5F2EC] text-[#3E492B]/80 hover:bg-[#DDD8CF]/40 border border-[#DDD8CF]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Your Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Dr. Jane Smith"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B] focus:outline-none focus:ring-2 focus:ring-[#3E492B]/20"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B] focus:outline-none focus:ring-2 focus:ring-[#3E492B]/20"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B] focus:outline-none focus:ring-2 focus:ring-[#3E492B]/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder={`Regarding ${category}...`}
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B] focus:outline-none focus:ring-2 focus:ring-[#3E492B]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-[#3E492B]">Detailed Message *</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="How can our healthcare team assist you?"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD8CF] bg-[#F5F2EC]/40 text-[#3E492B] focus:outline-none focus:ring-2 focus:ring-[#3E492B]/20"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-[#3E492B]/60 font-mono">
                  DEPARTMENT: {category.toUpperCase()}
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs px-6 py-3 flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Submit Inquiry <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Direct Contact Info Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-6 space-y-5">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
                  REACH US DIRECTLY
                </span>
                <h3 className="text-xl font-serif font-medium text-[#3E492B] mt-1">Contact Channels</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5F2EC]/50 border border-[#DDD8CF]/60">
                  <Mail className="w-4 h-4 text-[#3E492B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#3E492B] block">Email Support</span>
                    <a href="mailto:contact@vitamend.in" className="text-[#3E492B]/80 hover:underline font-medium">
                      contact@vitamend.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5F2EC]/50 border border-[#DDD8CF]/60">
                  <MapPin className="w-4 h-4 text-[#3E492B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#3E492B] block">Headquarters</span>
                    <span className="text-[#3E492B]/80 leading-relaxed block">
                      Healthcare Supply Chain Hub, New Delhi, India
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5F2EC]/50 border border-[#DDD8CF]/60">
                  <Clock className="w-4 h-4 text-[#3E492B] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-[#3E492B] block">Operating Hours</span>
                    <span className="text-[#3E492B]/80">Mon – Sat: 09:00 AM – 07:00 PM IST</span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block mt-1 w-max">
                      Emergency Shortage Routing Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps Location Placeholder */}
            <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-6 space-y-3">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#3E492B]/70">
                HQ LOCATION
              </span>
              <div className="h-40 rounded-xl bg-[#F5F2EC] border border-[#DDD8CF] flex flex-col items-center justify-center text-center p-4 text-xs text-[#3E492B]/70">
                <MapPin className="w-8 h-8 text-[#3E492B]/40 mb-2" />
                <span className="font-serif font-medium text-[#3E492B] text-sm">New Delhi Logistics Center</span>
                <span>Supply Chain & Verification Facility</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
