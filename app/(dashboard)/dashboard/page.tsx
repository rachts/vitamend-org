"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Upload, Activity, Clock, XCircle, Package, Heart } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession() || {};
  const [donations, setDonations] = useState<Record<string, unknown>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/donations");
      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", res.status, text);
        return;
      }
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await res.text();
        console.error("Expected JSON, got:", contentType, text.substring(0, 200));
        return;
      }
      const data = await res.json();
      if (data.donations) {
        setDonations(data.donations);
      }
    } catch (e) {
      console.error("Failed to fetch donations:", e);
    }
  };

  useEffect(() => {
    fetchDonations();
    const interval = setInterval(fetchDonations, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      const donationRes = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicines: [{ name: files[0].name.replace(/\.[^/.]+$/, ""), quantity, expiryDate: "2026-12-31" }],
          donorInfo: {
            name: session?.user?.name || "Anonymous Donor",
            email: session?.user?.email || "donor@vitamend.in",
            phone: "0000000000",
            address: "Default Address",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
          },
          images: [imageUrl],
        }),
      });

      if (donationRes.ok) {
        setIsModalOpen(false);
        setFiles([]);
        fetchDonations();
      }
    } catch (err) {
      console.error("Failed to submit donation:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalDonations = donations.length;
  const approvedCount = donations.filter((d) => ["approved", "distributed"].includes(d.status as string)).length;
  const pendingCount = donations.filter((d) => d.status === "pending").length;
  const rejectedCount = donations.filter((d) => d.status === "rejected").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[var(--text-primary)]">
            Welcome back, {session?.user?.name || "Donor"}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Track your medicine donations and verification progress in real-time.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" /> Donate Medicine
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-saas flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Donations</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalDonations}</h3>
          </div>
        </div>

        <div className="card-saas flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Approved / Distributed</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{approvedCount}</h3>
          </div>
        </div>

        <div className="card-saas flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Under Review</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pendingCount}</h3>
          </div>
        </div>

        <div className="card-saas flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Rejected</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{rejectedCount}</h3>
          </div>
        </div>
      </div>

      <div className="card-saas">
        <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100 mb-4">
          Recent Donation Activity
        </h2>
        {donations.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No donation history found. Start by donating surplus medicines!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 dark:border-neutral-800 text-slate-400 font-medium text-xs uppercase">
                <tr>
                  <th className="pb-3">Medicine</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
                {donations.map((d: Record<string, unknown>, idx: number) => {
                  const medicines = (d.medicines as Array<{ name: string; quantity: number }>) || [];
                  const medName = medicines[0]?.name || "Medicine Batch";
                  const qty = medicines[0]?.quantity || 1;
                  const status = (d.status as string) || "pending";
                  const createdAt = (d.createdAt as string) || new Date().toISOString();

                  return (
                    <tr key={(d._id as string) || idx} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/50">
                      <td className="py-3.5 font-medium text-slate-900 dark:text-slate-100">{medName}</td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">{qty}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            status === "approved" || status === "distributed"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : status === "rejected"
                              ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400 text-xs">
                        {new Date(createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card-saas max-w-md w-full p-6 relative">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-slate-100 mb-4">
              Donate Surplus Medicine
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Medicine Strip / Box Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="w-full text-sm border border-slate-200 dark:border-neutral-800 rounded-xl p-2"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Quantity (Strips/Units)
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full border border-slate-200 dark:border-neutral-800 rounded-xl p-2.5 text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Submit Donation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
