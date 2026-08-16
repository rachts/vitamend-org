"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSupplyChainStore } from "@/lib/store/supply-chain-store";
import type { GlobeMethods } from "react-globe.gl";

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export default function GlobeVisualization() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const activeArcs = useSupplyChainStore((state) => state.activeArcs);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Focus camera on India
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 1.2 }, 4000);
      
      // Add auto-rotation
      const controls = globeRef.current.controls();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = false; // keep the cinematic framing
      }
    }
  }, []);

  // Hardcoded glow points for major Indian cities
  const cities = [
    { name: "Delhi", lat: 28.7041, lng: 77.1025, size: 0.1, color: "#22c55e" },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777, size: 0.1, color: "#3b82f6" },
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946, size: 0.1, color: "#eab308" },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639, size: 0.1, color: "#ec4899" },
    { name: "Chennai", lat: 13.0827, lng: 80.2707, size: 0.1, color: "#a855f7" },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867, size: 0.1, color: "#06b6d4" },
  ];

  if (typeof window === 'undefined') return null;

  return (
    <div className="absolute inset-0 z-0 bg-transparent flex items-center justify-center overflow-hidden">
      <Globe
        ref={globeRef}
        width={windowSize.width}
        height={windowSize.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"
        
        // Point configuration
        pointsData={cities}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointAltitude="size"
        pointRadius={0.15}
        pointsMerge={true}
        
        // Arcs configuration (Pulses)
        arcsData={activeArcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcAltitude={0.2}
        arcStroke={0.5}
      />
    </div>
  );
}
