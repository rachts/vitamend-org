"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSupplyChainStore } from "@/lib/store/supply-chain-store";
import { Heart, Activity, Leaf, Pill } from "lucide-react";

const AnimatedCounter = ({ value, label, icon: Icon, color }: { value: number, label: string, icon: React.ComponentType<{ className?: string }>, color: string }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Simple spring-like animation effect for counter
    const start = displayValue;
    const end = value;
    if (start === end) return;
    
    const duration = 1000;
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.floor(start + (end - start) * easeProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col items-center p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl min-w-[140px]">
      <Icon className={`w-6 h-6 mb-2 ${color}`} />
      <motion.span 
        key={value} // triggers re-animation on value change
        initial={{ scale: 1.2, color: "#fff" }}
        animate={{ scale: 1, color: "#e2e8f0" }}
        className="text-3xl font-light tracking-tight font-serif"
      >
        {displayValue.toLocaleString()}
      </motion.span>
      <span className="text-[10px] uppercase tracking-widest text-white/50 mt-1 text-center">
        {label}
      </span>
    </div>
  );
};

export default function LiveCounters() {
  const stats = useSupplyChainStore((state) => state.stats);

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-10">
      <AnimatedCounter value={stats.medicinesSaved} label="Medicines Saved" icon={Pill} color="text-blue-400" />
      <AnimatedCounter value={stats.familiesHelped} label="Families Helped" icon={Heart} color="text-rose-400" />
      <AnimatedCounter value={stats.clinicsConnected} label="Clinics Connected" icon={Activity} color="text-emerald-400" />
      <AnimatedCounter value={stats.carbonPrevented} label="Carbon Prevented (kg)" icon={Leaf} color="text-green-400" />
    </div>
  );
}
