"use client";

import React, { useState } from "react";
import useSWR from "swr";
import {
  Search,
  ClipboardList,
  Inbox,
  Plus,
  X,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  UploadCloud,
  QrCode,
  FileSpreadsheet,
} from "lucide-react";

interface InventoryItem {
  _id: string;
  medicineId: string;
  name: string;
  genericName?: string;
  category?: string;
  quantity: number;
  batchNumber?: string;
  expiryDate: string;
  manufacturer?: string;
  location: string;
  status: string;
  daysUntilExpiry?: number;
}

interface ApiResponse {
  items: InventoryItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const categories = ["All Stock", "Antibiotics", "Cardiovascular", "Analgesics", "Pediatric", "Chronic Care", "General"];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function InventoryPage() {
  const [activeCategory, setActiveCategory] = useState("All Stock");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [activeQrItem, setActiveQrItem] = useState<InventoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    quantity: "",
    expiryDate: "",
    category: "General",
    manufacturer: "",
    location: "Main Warehouse",
    batchNumber: "",
  });

  const apiUrl =
    activeCategory !== "All Stock"
      ? `/api/inventory?category=${encodeURIComponent(activeCategory)}`
      : "/api/inventory";

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(apiUrl, fetcher, {
    refreshInterval: 3000,
  });

  const inventoryItems = data?.items || [];

  const filteredItems = inventoryItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.genericName?.toLowerCase().includes(q) ||
      item.medicineId.toLowerCase().includes(q) ||
      item.batchNumber?.toLowerCase().includes(q)
    );
  });

  // KPI Calculations
  const totalMedicines = data?.pagination?.total ?? inventoryItems.length;
  const totalUnits = inventoryItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const expiringSoonCount = inventoryItems.filter((item) => (item.daysUntilExpiry ?? 999) < 90).length;
  const availableCount = inventoryItems.filter((item) => item.status === "available").length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExportCSV = () => {
    if (inventoryItems.length === 0) return;
    const headers = "Serial ID,Medicine Name,Generic Name,Category,Quantity,Expiry Date,Status,Location\n";
    const rows = inventoryItems
      .map(
        (i) =>
          `"${i.medicineId}","${i.name}","${i.genericName || ""}","${i.category || "General"}",${i.quantity},"${i.expiryDate}","${i.status}","${i.location}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Vitamend_Inventory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Medicine name is required.");
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setFormError("Please provide a valid quantity greater than 0.");
      return;
    }
    if (!formData.expiryDate) {
      setFormError("Expiry date is required.");
      return;
    }

    const selectedExpiry = new Date(formData.expiryDate);
    if (selectedExpiry <= new Date()) {
      setFormError("Expiry date must be in the future.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          genericName: formData.genericName.trim() || undefined,
          quantity: Number(formData.quantity),
          expiryDate: formData.expiryDate,
          category: formData.category,
          manufacturer: formData.manufacturer.trim() || undefined,
          location: formData.location.trim() || "Main Warehouse",
          batchNumber: formData.batchNumber.trim() || undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setFormError(result.error || "Failed to create inventory item.");
        setSubmitting(false);
        return;
      }

      await mutate();
      setIsModalOpen(false);
      setFormData({
        name: "",
        genericName: "",
        quantity: "",
        expiryDate: "",
        category: "General",
        manufacturer: "",
        location: "Main Warehouse",
        batchNumber: "",
      });

      setToastMessage("Medicine added successfully");
      setTimeout(() => setToastMessage(null), 4000);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#3E492B] text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 font-medium text-xs border border-[#DDD8CF]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#DDD8CF]">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#3E492B]/70 mb-1">
            <span>Operations Console</span>
            <span>/</span>
            <span className="text-[#3E492B]">Medicine Inventory</span>
          </div>
          <h1 className="text-3xl font-serif font-medium text-[#3E492B] tracking-tight">
            Verified Medicine Inventory & Dispatch Hub
          </h1>
          <p className="text-[#3E492B]/80 text-sm mt-1 max-w-2xl font-sans">
            Monitor verified medicine stock and coordinate safe delivery routing to partner community health clinics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs px-3.5 py-2.5 flex items-center gap-1.5"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="btn-secondary text-xs px-3.5 py-2.5 flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" /> Bulk CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Manual Inventory
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3E492B]/60" />
          <input
            type="text"
            placeholder="Search by medicine name, generic name, or batch ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm text-sm text-[#3E492B] placeholder:text-[#3E492B]/50 focus:outline-none focus:ring-2 focus:ring-[#3E492B]/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#3E492B] text-white"
                  : "bg-white/60 text-[#3E492B]/80 hover:text-[#3E492B] border border-[#DDD8CF]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Medicines", value: totalMedicines.toString(), sub: "Catalog Types", icon: Package },
          { title: "Total Units", value: totalUnits.toLocaleString(), sub: "Total Dose Units", icon: Inbox },
          { title: "Expiring <90 Days", value: expiringSoonCount.toString(), sub: "Priority Dispatch", icon: Clock, alert: expiringSoonCount > 0 },
          { title: "Available for Dispatch", value: availableCount.toString(), sub: "Verified Ready", icon: CheckCircle2 },
        ].map((kpi) => (
          <div key={kpi.title} className="rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-5 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#3E492B]/70">{kpi.title}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.alert ? "text-amber-600" : "text-[#3E492B]/60"}`} />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-[#3E492B] mt-2">{kpi.value}</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#DDD8CF]/60 text-[10px] font-mono text-[#3E492B]/70">
                <span>{kpi.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Table */}
        <div className="lg:col-span-2 rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-serif font-medium text-[#3E492B]">Available Verified Stock Registry</h2>
              <p className="text-xs text-[#3E492B]/70 mt-0.5">OCR label verified and cross-checked against safety ledgers</p>
            </div>
            <span className="text-[10px] font-mono bg-[#F5F2EC] px-2.5 py-1 rounded border border-[#DDD8CF] text-[#3E492B]/70">
              LIVE SWR SYNC
            </span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-[#3E492B]/70 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#3E492B]" />
              <p className="text-xs font-medium">Synchronizing live inventory from database...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 text-xs">
              Failed to load inventory. Please check server connection.
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardList className="w-10 h-10 mx-auto mb-3 text-[#3E492B]/40" />
              <p className="text-sm font-medium text-[#3E492B]">No verified inventory yet</p>
              <p className="text-xs text-[#3E492B]/70 mt-1 max-w-xs mx-auto">
                Medicines appear here once a donor completes a label scan or manual inventory is added.
              </p>
              <button onClick={() => setIsModalOpen(true)} className="btn-primary mt-5 text-xs">
                Add Manual Inventory
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#DDD8CF] text-[#3E492B]/70 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="pb-3 font-medium">Medicine</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Quantity</th>
                    <th className="pb-3 font-medium">Expiry</th>
                    <th className="pb-3 font-medium">Barcode / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDD8CF]/60">
                  {filteredItems.map((item) => {
                    const daysLeft = item.daysUntilExpiry ?? 0;
                    const isExpiringSoon = daysLeft < 90;
                    return (
                      <tr key={item._id} className="hover:bg-[#F5F2EC]/40 transition-colors">
                        <td className="py-3.5 pr-3">
                          <div className="font-medium text-[#3E492B]">{item.name}</div>
                          {item.genericName && (
                            <div className="text-[11px] text-[#3E492B]/60 italic">{item.genericName}</div>
                          )}
                          <div className="text-[10px] font-mono text-[#3E492B]/50">#{item.medicineId.slice(-6)}</div>
                        </td>
                        <td className="py-3.5 px-2 text-xs text-[#3E492B]/80">{item.category || "General"}</td>
                        <td className="py-3.5 px-2 font-mono text-xs font-semibold text-[#3E492B]">
                          {item.quantity.toLocaleString()} units
                        </td>
                        <td className="py-3.5 px-2 text-xs">
                          <div className="font-mono text-[#3E492B]">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                          <div className={`text-[10px] font-semibold ${isExpiringSoon ? "text-amber-700" : "text-emerald-700"}`}>
                            {daysLeft}d remaining
                          </div>
                        </td>
                        <td className="py-3.5 pl-2">
                          <button
                            onClick={() => setActiveQrItem(item)}
                            className="p-1.5 rounded-lg border border-[#DDD8CF] bg-white hover:bg-[#F5F2EC] text-[#3E492B] transition-colors"
                            title="Inspect QR & Digital Barcode"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#DDD8CF]/60 flex items-center justify-between text-[11px] text-[#3E492B]/70">
            <span>Inventory tracking updated via live SWR synchronization</span>
            <span className="font-mono">STATUS: ONLINE</span>
          </div>
        </div>

        {/* Clinic Need Requests Sidebar */}
        <div className="rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-serif font-medium text-[#3E492B]">Clinic Need Requests</h3>
              <p className="text-[11px] text-[#3E492B]/70 mt-0.5">Priority medicine routing queue</p>
            </div>
            <span className="text-[10px] font-mono bg-[#F5F2EC] text-[#3E492B]/70 px-2 py-0.5 rounded border border-[#DDD8CF]">0 ACTIVE</span>
          </div>
          <div className="border border-dashed border-[#DDD8CF] rounded-lg p-8 text-center">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-[#3E492B]/40" />
            <p className="text-sm font-medium text-[#3E492B]">No urgent shortage requests</p>
            <p className="text-xs text-[#3E492B]/70 mt-1">
              Partner clinics reporting critical shortages will appear here immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Add Manual Inventory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-[#DDD8CF] bg-[#F5F2EC] p-6 shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDD8CF]">
              <div>
                <h3 className="text-lg font-serif font-medium text-[#3E492B]">Add Manual Inventory</h3>
                <p className="text-xs text-[#3E492B]/70">Record a new verified medicine intake directly into MongoDB.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#3E492B]/60 hover:text-[#3E492B] p-1 rounded-lg hover:bg-white/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateInventory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-medium text-[#3E492B]">Medicine Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Amoxicillin 500mg"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Generic Name</label>
                  <input
                    type="text"
                    name="genericName"
                    placeholder="e.g. Amoxicillin Trihydrate"
                    value={formData.genericName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Quantity (Units) *</label>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="e.g. 500"
                    min="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                  >
                    {categories.filter((c) => c !== "All Stock").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    placeholder="e.g. Pfizer Inc."
                    value={formData.manufacturer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#3E492B]">Storage Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Main Warehouse Zone B"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-[#DDD8CF] bg-white text-[#3E492B]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#DDD8CF] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...
                    </>
                  ) : (
                    "Save Inventory Record"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {activeQrItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#DDD8CF] bg-[#F5F2EC] p-6 shadow-xl space-y-4 text-center">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CF]">
              <span className="font-serif font-medium text-base text-[#3E492B]">Digital QR Barcode</span>
              <button onClick={() => setActiveQrItem(null)} className="text-[#3E492B]/60 hover:text-[#3E492B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#DDD8CF] inline-block">
              <QrCode className="w-32 h-32 mx-auto text-[#3E492B]" />
            </div>

            <div>
              <h4 className="font-serif font-medium text-[#3E492B] text-lg">{activeQrItem.name}</h4>
              <p className="text-xs text-[#3E492B]/70 font-mono mt-1">ID: #{activeQrItem.medicineId}</p>
              <p className="text-[11px] text-[#3E492B]/60 font-mono mt-0.5">BATCH: {activeQrItem.batchNumber || "LOT-2026-X"}</p>
            </div>

            <button onClick={() => setActiveQrItem(null)} className="btn-primary w-full text-xs py-2">
              Close Digital Barcode
            </button>
          </div>
        </div>
      )}

      {/* Bulk CSV Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#DDD8CF] bg-[#F5F2EC] p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#DDD8CF]">
              <span className="font-serif font-medium text-base text-[#3E492B]">Bulk CSV Manifest Upload</span>
              <button onClick={() => setIsBulkModalOpen(false)} className="text-[#3E492B]/60 hover:text-[#3E492B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-[#DDD8CF] rounded-xl p-8 text-center space-y-3 bg-white/60">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-[#3E492B]/40" />
              <p className="text-xs text-[#3E492B]">Drag & drop formatted `.csv` manifest file or browse</p>
              <input type="file" accept=".csv" className="text-xs font-mono" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsBulkModalOpen(false)} className="btn-secondary text-xs px-4 py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
