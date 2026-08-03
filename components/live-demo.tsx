"use client"

import Image from "next/image";
import { useState, useRef } from "react"
import { Scan, ShieldAlert, ShieldCheck, CheckCircle2, AlertCircle, Loader2, UploadCloud, X, Cpu, Pill, Building2, Calendar, Activity as ActivityIcon } from "lucide-react"
import { OCRService, OCRCheckResponse } from "@/lib/ai/ocr-service"

type Status = "idle" | "scanning" | "result" | "error"

export function LiveDemo() {
  const [status, setStatus] = useState<Status>("idle")
  const [, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<OCRCheckResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      await processFile(selectedFile)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      await processFile(droppedFile)
    }
  }

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setStatus("scanning")
    setErrorMessage(null)
    setResult(null)

    try {
      // Call the actual OCR service
      const ocrResult = await OCRService.processImage(selectedFile)
      setResult(ocrResult)
      setStatus("result")
    } catch (error: unknown) {
      console.error(error)
      setErrorMessage((error as Error).message || "Failed to process image. Make sure the OCR backend is running.")
      setStatus("error")
    }
  }

  const resetDemo = () => {
    setStatus("idle")
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setResult(null)
    setErrorMessage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isApproved = result && !result.expired && !result.tampered && !result.needs_review

  return (
    <div className="w-full max-w-5xl mx-auto glass-panel border border-outline-variant/20 rounded-3xl overflow-hidden shadow-sm bg-surface-container-lowest">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Side: Scanner / Upload */}
        <div 
          className="relative p-6 lg:p-10 bg-surface-container-lowest border-b lg:border-b-0 lg:border-r border-outline-variant/20 flex flex-col items-center justify-center min-h-[400px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {status === "idle" ? (
            <div 
              className="w-full h-full min-h-[300px] border-2 border-dashed border-outline-variant/50 rounded-2xl flex flex-col items-center justify-center bg-surface hover:bg-surface-container-low transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="bg-primary-container text-on-primary-container p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud size={32} />
              </div>
              <h4 className="font-headline-sm text-on-surface mb-2">Upload Medicine Photo</h4>
              <p className="font-body-sm text-on-surface-variant text-center px-6">
                Drag and drop an image here, or click to browse.
              </p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden shadow-inner bg-black/5">
              {previewUrl && (
                <Image width={500} height={500} unoptimized 
                  loading="lazy"
                  src={previewUrl} 
                  alt="Uploaded Medicine"
                  className={`w-full h-full object-cover transition-all duration-700 ${status === "scanning" ? "brightness-75 blur-[1px]" : "brightness-100"}`}
                />
              )}
              
              {/* Scanning Overlay */}
              {status === "scanning" && (
                <>
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <span className="font-label-md text-primary bg-surface/80 px-4 py-2 rounded shadow-sm">Analyzing via AI...</span>
                  </div>
                </>
              )}

              {status === "result" && result && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/40 backdrop-blur-sm p-4 text-center">
                  {isApproved ? (
                    <div className="flex flex-col items-center gap-3 bg-green-500/10 p-6 rounded-2xl shadow-lg border border-green-500/20 backdrop-blur-md">
                      <ShieldCheck className="w-16 h-16 text-green-600" />
                      <span className="font-headline-sm text-green-700 font-bold">Verified Authentic</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 bg-error/10 p-6 rounded-2xl shadow-lg border border-error/20 backdrop-blur-md">
                      <ShieldAlert className="w-16 h-16 text-error" />
                      <span className="font-headline-sm text-error font-bold">Unsafe / Needs Review</span>
                    </div>
                  )}
                </div>
              )}

              {status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-sm p-4 text-center">
                  <div className="flex flex-col items-center gap-3 bg-error/10 p-6 rounded-2xl shadow-lg border border-error/20">
                    <X className="w-12 h-12 text-error" />
                    <span className="font-headline-sm text-error font-bold">Processing Failed</span>
                    <p className="text-sm text-error/80">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Results Panel */}
        <div className="p-6 lg:p-10 flex flex-col bg-surface">
          <div className="mb-8">
            <h3 className="font-headline-md text-on-surface mb-2 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              AI Extraction Results
            </h3>
            <p className="font-body-sm text-on-surface-variant">Real-time optical character recognition and pattern matching output.</p>
          </div>

          <div className="flex-1 space-y-4">
            <ResultItem 
              label="Product Identified"
              value={status === "idle" ? "---" : result?.medicine_name || "Unknown"}
              Icon={Pill}
              loading={status === "scanning"}
            />
            <ResultItem 
              label="Manufacturer ID (Batch)"
              value={status === "idle" ? "---" : result?.batch || "Unknown"}
              Icon={Building2}
              loading={status === "scanning"}
            />
            <ResultItem 
              label="Expiration Date"
              value={
                status === "idle" || status === "scanning" ? "---" :
                status === "error" ? "---" :
                result?.expiry ? `${result.expiry} ${result.expired ? "(Expired)" : "(Valid)"}` : "Not Found"
              }
              valueColor={
                status === "idle" || status === "scanning" || status === "error" ? "text-on-surface" :
                result?.expired ? "text-error font-bold" : "text-green-600 font-bold"
              }
              Icon={Calendar}
              loading={status === "scanning"}
            />
            <ResultItem 
              label="Authenticity Confidence"
              value={
                status === "idle" || status === "scanning" || status === "error" ? "---" :
                result?.confidence ? `${(result.confidence * 100).toFixed(1)}%` : "N/A"
              }
              Icon={ActivityIcon}
              loading={status === "scanning"}
            />
          </div>

          <div className="mt-8 pt-6 border-t border-outline-variant/20">
            <h4 className="font-label-sm text-on-surface-variant uppercase tracking-wider mb-4">Final Eligibility</h4>
            {status === "idle" || status === "scanning" ? (
              <div className="h-16 bg-surface-container-low rounded-xl flex items-center justify-center border border-dashed border-outline-variant/40">
                <span className="font-label-md text-on-surface-variant">
                  {status === "idle" ? "Upload an image to verify" : "Awaiting scan completion..."}
                </span>
              </div>
            ) : status === "error" ? (
              <div className="h-16 bg-error/10 rounded-xl flex items-center justify-center border border-error/20">
                <span className="font-label-md text-error">Scan failed</span>
              </div>
            ) : isApproved ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <h5 className="font-label-lg text-green-800 mb-1">Approved for Donation</h5>
                  <p className="font-body-sm text-green-700/80">This unit meets all safety requirements and is ready for the redistribution network.</p>
                </div>
              </div>
            ) : (
              <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-error mt-0.5 shrink-0" />
                <div>
                  <h5 className="font-label-lg text-error mb-1">Rejected</h5>
                  <p className="font-body-sm text-error/80">
                    {result?.tampered ? "Potential tampering detected. " : ""}
                    {result?.expired ? "Item is expired. " : ""}
                    {result?.needs_review ? "Manual review required. " : ""}
                    Must be routed to secure disposal.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {(status === "result" || status === "error") && (
            <button 
              onClick={resetDemo}
              className="mt-6 w-full py-3 border border-outline text-on-surface rounded-xl font-label-md hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2"
            >
              <Scan size={20} />
              Scan Another Item
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultItem({ label, value, Icon, loading, valueColor = "text-on-surface" }: { label: string, value: string, Icon: React.ComponentType<{ className?: string }>, loading?: boolean, valueColor?: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-on-surface-variant/50" />
        <span className="font-label-md text-on-surface-variant">{label}</span>
      </div>
      {loading ? (
        <div className="h-4 w-24 bg-surface-container-high rounded animate-pulse"></div>
      ) : (
        <span className={`font-body-md ${valueColor}`}>{value}</span>
      )}
    </div>
  )
}
