"use client";

import { useEffect, useRef } from "react";
import { useSupplyChainStore } from "../store/supply-chain-store";

export function useNarration() {
  const events = useSupplyChainStore((state) => state.events);
  const lastEventId = useRef<string | null>(null);

  useEffect(() => {
    if (events.length === 0) return;

    const latestEvent = events[0];
    
    // Only speak new events
    if (latestEvent.id === lastEventId.current) return;
    lastEventId.current = latestEvent.id;

    let textToSpeak = "";

    switch (latestEvent.type) {
      case "DONATION_CREATED":
        textToSpeak = "Incoming donation received via WhatsApp.";
        break;
      case "OCR_COMPLETED":
        textToSpeak = `AI Vision successfully identified ${latestEvent.medicineName || 'the medicine'}.`;
        break;
      case "PHARMACIST_APPROVED":
        textToSpeak = `${latestEvent.medicineName || 'Medicine'} approved by pharmacist and added to active inventory.`;
        break;
      case "ROUTED_TO_CLINIC":
        textToSpeak = `Routing donation from ${latestEvent.sourceCity || 'donor'} to clinic in ${latestEvent.destCity || 'destination'}.`;
        break;
      case "DELIVERED":
        textToSpeak = "Medicine successfully delivered to patient.";
        break;
    }

    if (textToSpeak && typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      // Try to find a good English voice (preferably female/calm for healthcare vibe)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Google UK English Female") || v.name.includes("Karen") || v.lang === "en-GB");
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.rate = 0.9; // Slightly slower, calmer
      utterance.pitch = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }

  }, [events]);
}
