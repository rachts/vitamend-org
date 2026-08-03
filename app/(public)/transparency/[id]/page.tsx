import React from "react";
import connectMongoose from "@/lib/db";
import { Medicine, IMedicine } from "@/models/Medicine";
import { VerificationLog, IVerificationLog } from "@/models/VerificationLog";
import { ShieldCheck, ShieldAlert, FileText, Search, Activity, UserCheck, PackageCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export default async function TransparencyLedgerPage({ params }: PageProps) {
  await connectMongoose();
  
  const medicineId = params.id;
  const medicine = await Medicine.findById(medicineId).lean() as IMedicine | null;
  const logs = await VerificationLog.find({ medicineId }).sort({ createdAt: 1 }).lean() as IVerificationLog[];

  if (!medicine) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-error mb-4" />
        <h1 className="font-serif text-3xl text-on-surface mb-2">Record Not Found</h1>
        <p className="text-on-surface-variant max-w-md">
          We could not find a public ledger entry for this Medicine ID. It may be invalid or not yet processed.
        </p>
        <Link href="/" className="mt-8 btn-primary">Return Home</Link>
      </div>
    );
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "ocr": return <FileText className="w-5 h-5" />;
      case "ai_check": return <Activity className="w-5 h-5" />;
      case "db_check": return <Search className="w-5 h-5" />;
      case "decision": return <ShieldCheck className="w-5 h-5" />;
      case "manual_review": return <UserCheck className="w-5 h-5" />;
      default: return <PackageCheck className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-500/20 text-green-700 border-green-500/30";
      case "warning": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
      case "failure": return "bg-error/20 text-error border-error/30";
      default: return "bg-surface-container-high text-on-surface border-outline-variant";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-6">
      <div className="mb-12 border-b border-outline-variant/30 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full font-label-sm mb-4">
          <ShieldCheck className="w-4 h-4" />
          Public Ledger Record
        </div>
        <h1 className="font-serif text-4xl text-on-surface mb-2">
          {medicine.name} {medicine.dosage ? `(${medicine.dosage})` : ""}
        </h1>
        <p className="font-mono text-sm text-on-surface-variant mb-6">
          ID: {medicine._id.toString()}
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Status</div>
            <div className="font-label-lg capitalize text-on-surface">
              {medicine.status.replace("_", " ")}
            </div>
          </div>
          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Batch Number</div>
            <div className="font-label-lg text-on-surface">{medicine.batchNumber || "Unknown"}</div>
          </div>
          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Expiry Date</div>
            <div className="font-label-lg text-on-surface">
              {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : "Unknown"}
            </div>
          </div>
          <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Manufacturer</div>
            <div className="font-label-lg text-on-surface">{medicine.manufacturer || "Unknown"}</div>
          </div>
        </div>
      </div>

      <h2 className="font-serif text-2xl text-on-surface mb-8">Verification Journey</h2>
      
      <div className="relative border-l-2 border-outline-variant/30 ml-4 space-y-8 pb-12">
        {logs.map((log, index) => (
          <div key={log._id.toString()} className="relative pl-8 fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`absolute -left-[21px] w-10 h-10 rounded-full flex items-center justify-center border-2 bg-surface ${getStatusColor(log.status)}`}>
              {getStageIcon(log.stage)}
            </div>
            
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <h3 className="font-label-lg capitalize text-on-surface flex items-center gap-2">
                  {log.stage.replace("_", " ")}
                  {log.status === "failure" && <ShieldAlert className="w-4 h-4 text-error" />}
                </h3>
                <time className="font-mono text-xs text-on-surface-variant">
                  {new Date(log.createdAt).toLocaleString()}
                </time>
              </div>
              
              <div className="bg-surface-container-low rounded-lg p-3 font-mono text-sm text-on-surface-variant overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(log.details, null, 2)}
              </div>
              
              {log.confidence > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-xs font-medium text-on-surface-variant uppercase">AI Confidence</div>
                  <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${log.confidence > 90 ? 'bg-green-500' : log.confidence > 70 ? 'bg-yellow-500' : 'bg-error'}`}
                      style={{ width: `${log.confidence}%` }}
                    />
                  </div>
                  <div className="text-xs font-mono font-bold text-on-surface">{log.confidence.toFixed(1)}%</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
