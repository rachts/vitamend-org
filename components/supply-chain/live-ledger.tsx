"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupplyChainStore } from "@/lib/store/supply-chain-store";
import { Shield, Clock, CheckCircle, Package, Truck } from "lucide-react";

const getEventIcon = (type: string) => {
  switch (type) {
    case "DONATION_CREATED": return <Package className="w-4 h-4 text-emerald-400" />;
    case "OCR_COMPLETED": return <Clock className="w-4 h-4 text-blue-400" />;
    case "VERIFICATION_PENDING": return <Shield className="w-4 h-4 text-yellow-400" />;
    case "PHARMACIST_APPROVED": return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "ROUTED_TO_CLINIC": return <Truck className="w-4 h-4 text-purple-400" />;
    case "DELIVERED": return <CheckCircle className="w-4 h-4 text-white" />;
    default: return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

export default function LiveLedger() {
  const events = useSupplyChainStore((state) => state.events);

  return (
    <div className="absolute top-24 left-6 w-80 max-h-[70vh] overflow-hidden flex flex-col gap-4 z-10">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
        <h2 className="text-sm font-semibold tracking-widest uppercase text-white/80 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Network Activity
        </h2>
        
        <div className="flex flex-col gap-3 relative">
          {/* Vertical line connecting events */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10 z-0" />

          <AnimatePresence>
            {events.slice(0, 7).map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 flex gap-4 bg-white/5 border border-white/5 p-3 rounded-lg backdrop-blur-sm shadow-xl"
              >
                <div className="mt-0.5 bg-black/50 p-1.5 rounded-full ring-1 ring-white/10 shrink-0 self-start">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white/90">
                    {event.title}
                  </span>
                  <span className="text-[10px] text-white/60 leading-snug mt-1">
                    {event.description}
                  </span>
                  {event.confidence && (
                    <span className="text-[10px] text-emerald-400 mt-1 font-mono">
                      Confidence: {event.confidence}%
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
