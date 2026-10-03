"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSupplyChainStore, SupplyChainEvent } from "@/lib/store/supply-chain-store";
import { useNarration } from "@/lib/hooks/use-narration";
import LiveLedger from "@/components/supply-chain/live-ledger";
import LiveCounters from "@/components/supply-chain/live-counters";

// Dynamic import for the globe to prevent hydration errors on SSR
const GlobeVisualization = dynamic(() => import("@/components/supply-chain/globe-visualization"), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black flex items-center justify-center"><div className="w-12 h-12 border-t-2 border-emerald-500 rounded-full animate-spin"></div></div>
});

export default function LivingSupplyChainPage() {
  const { addEvent } = useSupplyChainStore();
  useNarration();

  // Poll only persisted backend events; no synthetic activity is generated.
  useEffect(() => {
    let isSubscribed = true;
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        
        if (data.success && isSubscribed) {
          // Push new events (store handles deduplication by ID)
          data.events.forEach((evt: SupplyChainEvent) => {
             addEvent(evt);
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchEvents(); // initial fetch
    const interval = setInterval(fetchEvents, 5000); // poll every 5s

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [addEvent]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      <GlobeVisualization />
      
      {/* HUD Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <LiveLedger />
        <LiveCounters />

        {/* Title Overlay */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-auto">
          <h1 className="text-3xl font-serif tracking-tight text-white/90">
            The Living Supply Chain
          </h1>
          <p className="text-sm font-medium text-emerald-400 tracking-widest uppercase mt-2">
            Live database activity · updates every 5 seconds
          </p>
        </div>
      </div>
    </main>
  );
}
