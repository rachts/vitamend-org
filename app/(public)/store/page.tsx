import type { Metadata } from "next";
import Link from "next/link";
import connectMongoose from "@/lib/db";
import { Inventory } from "@/models/Inventory";
import { TrustBadge } from "@/components/trust-badges";
import {
  Package,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Public Essential Medicine Store & Allocation Registry",
  description:
    "Browse verified, non-expired surplus medical supplies available for instant allocation to partner community health clinics.",
};

interface StoreItem {
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
  daysLeft: number;
}

async function getStoreInventory(): Promise<StoreItem[]> {
  try {
    await connectMongoose();
    const items = await Inventory.find({ status: "available" })
      .select("medicineId name genericName category quantity batchNumber expiryDate manufacturer location status")
      .sort({ expiryDate: 1 })
      .limit(50)
      .lean();

    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((item: any) => {
      const expiry = new Date(item.expiryDate);
      const diffTime = expiry.getTime() - now.getTime();
      const daysLeft = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      return {
        _id: String(item._id),
        medicineId: item.medicineId,
        name: item.name,
        genericName: item.genericName,
        category: item.category || "General",
        quantity: item.quantity,
        batchNumber: item.batchNumber,
        expiryDate: expiry.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
        manufacturer: item.manufacturer || "Certified Manufacturer",
        location: item.location || "Main Storage Hub",
        status: item.status,
        daysLeft,
      };
    });
  } catch (error) {
    console.error("Error fetching store inventory:", error);
    return [];
  }
}

export default async function PublicStorePage() {
  const inventory = await getStoreInventory();

  return (
    <div className="min-h-screen bg-[#F5F2EC] text-[#3E492B] font-sans pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Hero Banner */}
        <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-8 sm:p-10 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3E492B]/10 text-[#3E492B] text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Live Surplus Registry
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-[#3E492B]">
              Verified Essential Medicines Store
            </h1>
            <p className="text-base sm:text-lg text-[#3E492B]/80 leading-relaxed font-sans">
              Real-time inventory of OCR-scanned, pharmacist-verified surplus pharmaceuticals available for immediate dispatch to partner clinics.
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <TrustBadge variant="ai" size="sm" />
              <TrustBadge variant="pharmacist" size="sm" />
              <TrustBadge variant="cdsco" size="sm" />
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-end gap-2">
            <Link href="/clinics#request" className="btn-primary text-xs px-5 py-3 flex items-center gap-2">
              Request Clinic Allocation <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-[11px] font-mono text-[#3E492B]/60">SORTED BY NEAREST EXPIRY</span>
          </div>
        </div>

        {/* Inventory Store Cards */}
        {inventory.length === 0 ? (
          <div className="rounded-2xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-16 text-center space-y-5 max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-[#F5F2EC] flex items-center justify-center mx-auto text-[#3E492B]/40 border border-[#DDD8CF]">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-medium text-[#3E492B]">No Available Stock Found</h2>
              <p className="text-sm text-[#3E492B]/70 mt-2 max-w-md mx-auto leading-relaxed">
                All donated medicines have been dispatched to partner clinics. Be the first to donate surplus stock to replenish our community supply.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/donate" className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-3">
                Donate Surplus Medicine <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => {
              const isExpiringSoon = item.daysLeft < 90;
              return (
                <div
                  key={item._id}
                  className="rounded-xl border border-[#DDD8CF] bg-white/60 backdrop-blur-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-4">
                    {/* Header Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-[#F5F2EC] text-[#3E492B]/70 px-2.5 py-1 rounded border border-[#DDD8CF]">
                        {item.category}
                      </span>
                      {isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> EXPIRES SOON
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Title & Generic Name */}
                    <div>
                      <h3 className="text-xl font-serif font-medium text-[#3E492B] line-clamp-1">{item.name}</h3>
                      {item.genericName && (
                        <p className="text-xs text-[#3E492B]/70 italic mt-0.5">{item.genericName}</p>
                      )}
                    </div>

                    {/* Details List */}
                    <div className="space-y-2 pt-2 border-t border-[#DDD8CF]/60 text-xs">
                      <div className="flex justify-between items-center text-[#3E492B]/80">
                        <span className="text-[#3E492B]/60 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#3E492B]" /> Available Quantity:
                        </span>
                        <span className="font-semibold text-[#3E492B]">{item.quantity.toLocaleString()} units</span>
                      </div>

                      <div className="flex justify-between items-center text-[#3E492B]/80">
                        <span className="text-[#3E492B]/60 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#3E492B]" /> Manufacturer:
                        </span>
                        <span className="font-medium truncate max-w-[150px]">{item.manufacturer}</span>
                      </div>

                      <div className="flex justify-between items-center text-[#3E492B]/80">
                        <span className="text-[#3E492B]/60 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#3E492B]" /> Storage Location:
                        </span>
                        <span className="font-medium truncate max-w-[150px]">{item.location}</span>
                      </div>

                      <div className="flex justify-between items-center text-[#3E492B]/80 pt-1">
                        <span className="text-[#3E492B]/60 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#3E492B]" /> Expiry Date:
                        </span>
                        <span className="font-mono font-medium text-[#3E492B]">{item.expiryDate} ({item.daysLeft}d left)</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <div className="mt-6 pt-4 border-t border-[#DDD8CF]/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#3E492B]/70">ID: #{item.medicineId.slice(-6)}</span>
                    <Link href="/clinics#request" className="text-xs font-semibold text-[#3E492B] hover:underline flex items-center gap-1">
                      Reserve / Allocate <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
