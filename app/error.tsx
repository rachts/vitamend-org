"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Router error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg border border-[#D8D2C4] p-8 text-center">
        <div className="mx-auto mb-6 w-12 h-12 rounded-md bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-2xl font-serif text-[#1C1A14] mb-2">
          Something went wrong
        </h1>
        <p className="text-[#5C5545] text-sm mb-1">
          An unexpected error occurred while processing your request.
        </p>
        {error.digest && <p className="text-xs font-mono text-[#9A9080] mb-6">Error Reference: {error.digest}</p>}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#2C3320] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3D4A2E] transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#D8D2C4] bg-white px-5 py-2.5 text-sm font-medium text-[#1C1A14] hover:bg-[#EDE9DF] transition-colors"
          >
            <Home className="w-4 h-4" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
