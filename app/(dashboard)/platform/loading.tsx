import React from "react"

export default function PlatformLoading() {
  return (
    <div className="fixed inset-0 z-[9999] min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] select-none font-body p-6">
      <div className="flex flex-col items-center gap-5">
        <div className="font-heading text-[22px] font-[600] text-[#0F172A] tracking-[-0.02em]">
          Vita<span className="text-[#0F766E]">Mend</span>
        </div>
        <div className="w-[24px] h-[24px] rounded-full border-[3px] border-[#E2E8F0] border-t-[#0F766E] animate-spin"></div>
      </div>
    </div>
  )
}
