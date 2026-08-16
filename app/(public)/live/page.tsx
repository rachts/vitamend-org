"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSupplyChainStore, SupplyChainEvent } from "@/lib/store/supply-chain-store";
import { useNarration } from "@/lib/hooks/use-narration";
import { Play, Square } from "lucide-react";
import LiveLedger from "@/components/supply-chain/live-ledger";
import LiveCounters from "@/components/supply-chain/live-counters";

// Dynamic import for the globe to prevent hydration errors on SSR
const GlobeVisualization = dynamic(() => import("@/components/supply-chain/globe-visualization"), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black flex items-center justify-center"><div className="w-12 h-12 border-t-2 border-emerald-500 rounded-full animate-spin"></div></div>
});

export default function LivingSupplyChainPage() {
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const { addEvent, addArc, clearArcs, incrementStat, setDemoMode } = useSupplyChainStore();
  useNarration();

  // Demo sequence orchestration
  useEffect(() => {
    if (!isDemoRunning) return;
    const timers: NodeJS.Timeout[] = [];
    const runSequence = () => {
      // Clear previous
      clearArcs();
      // Cities
      const delhi: [number, number] = [28.7041, 77.1025];
      const mumbai: [number, number] = [19.0760, 72.8777];
      
      // T=0s: WhatsApp Donation Received in Delhi
      timers.push(setTimeout(() => {
        addEvent({
          id: Math.random().toString(),
          type: "DONATION_CREATED",
          title: "New WhatsApp Donation",
          description: "Donor submitted a photo from New Delhi.",
          sourceCity: "Delhi",
          timestamp: Date.now()
        });
      }, 1000));

      // T=3s: OCR Completes
      timers.push(setTimeout(() => {
        addEvent({
          id: Math.random().toString(),
          type: "OCR_COMPLETED",
          title: "AI Vision Extraction",
          description: "Extracted: Paracetamol 500mg, Expiry: 2026-10",
          medicineName: "Paracetamol 500mg",
          confidence: 96,
          timestamp: Date.now()
        });
      }, 4000));

      // T=7s: AI Verification Pending
      timers.push(setTimeout(() => {
        addEvent({
          id: Math.random().toString(),
          type: "VERIFICATION_PENDING",
          title: "AI Safety Check",
          description: "Analyzing for tampering, recalls, and expiry.",
          medicineName: "Paracetamol 500mg",
          timestamp: Date.now()
        });
      }, 8000));

      // T=11s: Pharmacist Approved
      timers.push(setTimeout(() => {
        addEvent({
          id: Math.random().toString(),
          type: "PHARMACIST_APPROVED",
          title: "Approved & Inventoried",
          description: "Pharmacist finalized check. Added to network.",
          medicineName: "Paracetamol 500mg",
          timestamp: Date.now()
        });
      }, 12000));

      // T=14s: Pulse Travels (Routing)
      timers.push(setTimeout(() => {
        addEvent({
          id: Math.random().toString(),
          type: "ROUTED_TO_CLINIC",
          title: "Routed to Clinic",
          description: "Match found! Routing to Safdarjung Community Clinic.",
          sourceCity: "Delhi",
          destCity: "Mumbai",
          medicineName: "Paracetamol 500mg",
          timestamp: Date.now()
        });

        // Trigger Globe Arc Animation
        addArc({
          startLat: delhi[0],
          startLng: delhi[1],
          endLat: mumbai[0],
          endLng: mumbai[1],
          color: ["#22c55e", "#3b82f6"] // Green to Blue
        });
      }, 15000));

      // T=19s: Delivered
      timers.push(setTimeout(() => {
        addEvent({
          id: Math.random().toString(),
          type: "DELIVERED",
          title: "Medicine Delivered",
          description: "Received by Safdarjung Community Clinic.",
          timestamp: Date.now()
        });

        // Increment stats
        incrementStat("medicinesSaved", 1);
        incrementStat("carbonPrevented", 0.5);
        
        // Slight delay before ending demo
        timers.push(setTimeout(() => {
          setIsDemoRunning(false);
          setDemoMode(false);
        }, 3000));

      }, 20000));
    };

    runSequence();

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isDemoRunning, addEvent, addArc, clearArcs, incrementStat, setDemoMode]);

  // Real-time polling when NOT in demo mode
  useEffect(() => {
    if (isDemoRunning) return;

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
  }, [isDemoRunning, addEvent]);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden font-sans">
      <GlobeVisualization />
      
      {/* HUD Elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <LiveLedger />
        <LiveCounters />

        {/* Demo Mode Controls */}
        <div className="absolute top-6 right-6 pointer-events-auto">
          <button 
            onClick={() => {
              setIsDemoRunning(!isDemoRunning);
              setDemoMode(!isDemoRunning);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${isDemoRunning ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500/30'}`}
          >
            {isDemoRunning ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isDemoRunning ? "Stop Demo" : "Start Demo Mode"}
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center pointer-events-auto">
          <h1 className="text-3xl font-serif tracking-tight text-white/90 drop-shadow-xl">
            The Living Supply Chain
          </h1>
          <p className="text-sm font-medium text-emerald-400/90 tracking-widest uppercase mt-2 drop-shadow-md">
            Live Network Visualization
          </p>
        </div>
      </div>
    </main>
  );
}
