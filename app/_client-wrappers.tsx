"use client";

import { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Lenis from "lenis";

export default function ClientWrappers({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Defer past React 19 concurrent hydration
    const raf = requestAnimationFrame(() => {
      AOS.init({ once: true, duration: 600 });

      if (!lenisRef.current) {
        lenisRef.current = new Lenis({ lerp: 0.1 });
        function update(time: number) {
          lenisRef.current?.raf(time);
          requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
