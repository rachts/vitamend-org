"use client"

import React, { useState, useRef } from "react"
import { Loader2, Upload, Camera, FileText, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"

interface ParsedOcrData {
  medicineName: string | null
  batchNumber: string | null
  expiryDate: string | null
  manufacturer: string | null
  dosage?: string | null
  mrp?: string | null
}

interface TestOcrResult {
  success: boolean
  confidence: number
  processingTimeMs?: number
  rawText?: string
  extracted?: ParsedOcrData
  error?: string
  isDemoMode?: boolean
}

export default function TestOcrPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<TestOcrResult | null>(null)
  const [cameraActive, setCameraActive] = useState<boolean>(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const { toast } = useToast()

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    processImage(file)
  }

  const processImage = async (file: File) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("image", file)

    try {
      const startTime = Date.now()
      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      const duration = Date.now() - startTime

      if (!res.ok || !data.success) {
        setResult({
          success: false,
          confidence: 0,
          error: data.error || "Failed to process OCR scan.",
          processingTimeMs: duration
        })
        toast({
          title: "OCR Processing Error",
          description: data.error || "Failed to extract medicine details.",
          variant: "destructive",
        })
      } else {
        setResult({
          success: true,
          confidence: data.confidence || 95,
          processingTimeMs: data.processingTimeMs || duration,
          rawText: data.rawText || "No raw text returned.",
          extracted: {
            medicineName: data.extracted?.medicineName || null,
            batchNumber: data.extracted?.batchNumber || null,
            expiryDate: data.extracted?.expiryDate || null,
            manufacturer: data.extracted?.manufacturer || null,
            dosage: data.extracted?.dosage || null,
            mrp: data.extracted?.mrp || null,
          },
          isDemoMode: data.isDemoMode
        })
        toast({
          title: "Scan Analysis Complete",
          description: `Extracted ${data.extracted?.medicineName || "packaging text"} at ${data.confidence || 95}% confidence.`,
        })
      }
    } catch {
      setResult({
        success: false,
        confidence: 0,
        error: "Network communication failure or offline server connection.",
      })
      toast({
        title: "Connection Failed",
        description: "Could not contact OCR backend service.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      setCameraActive(true)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch {
      toast({
        title: "Camera Access Unavailable",
        description: "Please use direct image upload or enable camera permissions in your browser.",
        variant: "destructive",
      })
      setCameraActive(false)
      // Fallback to mobile capture file input
      cameraInputRef.current?.click()
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `live-capture-${Date.now()}.jpg`, { type: "image/jpeg" })
          stopCamera()
          handleFileSelect(file)
        }
      }, "image/jpeg", 0.95)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 border-b border-[#E2E8F0] pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-saas-primary font-mono text-[11px] uppercase">Internal QA Tooling</span>
              {result?.isDemoMode && (
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B] font-mono font-semibold text-[11px] uppercase">
                  ⚡ DEMO MODE ACTIVE
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl font-bold text-[#0F172A] tracking-[-0.02em]">
              OCR Engine Calibration & Live Testing Bench
            </h1>
            <p className="text-sm text-[#64748B] mt-1 font-body">
              Test live extraction accuracy across pharmaceutical packaging, Indian manufacturing licenses, and regional date formats.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => selectedFile && processImage(selectedFile)}
              disabled={!selectedFile || isLoading}
              className="btn-secondary-saas h-9 px-3.5 text-[13px] flex items-center gap-1.5"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Re-Scan Image
            </button>
          </div>
        </div>

        {/* Two-Column Testing Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Image Upload & Camera Capture */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-5">
            <h2 className="font-heading text-sm font-semibold text-[#0F172A] uppercase tracking-wider text-slate-700 mb-4 pb-2 border-b border-[#F1F5F9]">
              1. Input Packaging Image
            </h2>

            {/* Camera Viewport or Preview Display */}
            <div className="relative aspect-[4/3] bg-[#0F172A] rounded-md overflow-hidden border border-[#E2E8F0] flex flex-col items-center justify-center text-center mb-4">
              {cameraActive ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-10">
                    <button
                      onClick={capturePhoto}
                      className="px-5 py-2 bg-[#0F766E] text-white rounded-full font-medium text-sm shadow-lg hover:bg-[#0E665E] transition-all flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" /> Snap Packaging Label
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-slate-900/80 text-slate-200 rounded-full font-medium text-sm hover:bg-slate-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="relative w-full h-full group">
                  <Image src={previewUrl} alt="Medicine Box Preview" fill className="object-contain bg-slate-950" />
                  {isLoading && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-[#0F766E] mb-2" />
                      <span className="text-sm font-medium">Running Vision extraction algorithms...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-[#94A3B8]">
                  <Upload className="h-10 w-10 mb-3 opacity-60 text-[#0F766E]" />
                  <p className="text-sm font-medium text-slate-300">No label image selected</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                    Upload a photograph of front packaging showing Batch, Expiry, Brand, and MFG License.
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || cameraActive}
                className="btn-primary-saas h-10 w-full flex items-center justify-center gap-2 text-sm"
              >
                <Upload className="h-4 w-4" />
                Browse Files
              </button>
              <button
                type="button"
                onClick={cameraActive ? capturePhoto : startCamera}
                disabled={isLoading}
                className="btn-secondary-saas h-10 w-full flex items-center justify-center gap-2 text-sm"
              >
                <Camera className="h-4 w-4 text-[#0F766E]" />
                {cameraActive ? "Capture Now" : "Live Camera"}
              </button>
            </div>
            
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            <div className="mt-5 pt-4 border-t border-[#F1F5F9] text-xs text-[#64748B] space-y-1.5 font-body">
              <p className="font-semibold text-slate-700">Supported Pharmaceutical Labels:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Indian Pharmacopoeia (IP) & BP/USP packaging</li>
                <li>Formats: Mfg. Lic. No., B.No., Lot No., Exp., M.R.P.</li>
                <li>Automatic filtering of licensing codes & regional noise</li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Raw Extracted Text & Parsed Fields */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F1F5F9]">
              <h2 className="font-heading text-sm font-semibold text-[#0F172A] uppercase tracking-wider text-slate-700">
                2. OCR Extraction Diagnostics
              </h2>
              {result && (
                <div className="flex items-center gap-3 font-mono text-xs">
                  {result.processingTimeMs && (
                    <span className="text-slate-500">Latency: {result.processingTimeMs}ms</span>
                  )}
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    result.confidence >= 80 
                      ? 'bg-[#F0FDFA] text-[#0F766E] border-[#A7F3D0]' 
                      : 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]'
                  }`}>
                    Score: {result.confidence}% {result.confidence >= 80 ? '✓ HIGH' : '⚠ LOW'}
                  </span>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0F766E] mb-3" />
                <p className="text-sm font-medium text-[#0F172A]">Parsing visual geometry & pharmaceutical tokens...</p>
                <p className="text-xs text-[#64748B] mt-1">Applying RegEx filters against CDSCO safety pattern rules.</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {result.error && (
                  <div className="p-4 rounded-md bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold">Extraction Warning</p>
                      <p className="text-xs mt-0.5">{result.error}</p>
                    </div>
                  </div>
                )}

                {/* Parsed Fields Table */}
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase text-[#64748B] mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#0F766E]" />
                    Structured Pharmaceutical Parameters (Parsed)
                  </h3>
                  <div className="border border-[#E2E8F0] rounded-md overflow-hidden">
                    <table className="w-full text-sm font-body text-left">
                      <thead className="bg-[#F8FAFC] text-[#64748B] text-xs uppercase font-mono border-b border-[#E2E8F0]">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold w-1/3">Field Name</th>
                          <th className="py-2.5 px-4 font-semibold w-2/3">Extracted Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9]">
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-[#0F172A]">Medicine Name</td>
                          <td className="py-3 px-4 font-mono font-semibold text-[#0F766E]">
                            {result.extracted?.medicineName || <span className="text-slate-400 font-normal italic">Not detected</span>}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-[#0F172A]">Batch Number</td>
                          <td className="py-3 px-4 font-mono text-slate-800 uppercase">
                            {result.extracted?.batchNumber || <span className="text-slate-400 font-normal italic">Not detected</span>}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-[#0F172A]">Expiry Date</td>
                          <td className="py-3 px-4 font-mono text-slate-800">
                            {result.extracted?.expiryDate || <span className="text-slate-400 font-normal italic">Not detected</span>}
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-medium text-[#0F172A]">Manufacturer</td>
                          <td className="py-3 px-4 text-slate-800 font-medium">
                            {result.extracted?.manufacturer || <span className="text-slate-400 font-normal italic">Not detected</span>}
                          </td>
                        </tr>
                        {result.extracted?.dosage && (
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-medium text-[#0F172A]">Detected Dosage</td>
                            <td className="py-3 px-4 font-mono text-slate-700">{result.extracted.dosage}</td>
                          </tr>
                        )}
                        {result.extracted?.mrp && (
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-medium text-[#0F172A]">Maximum Retail Price (MRP)</td>
                            <td className="py-3 px-4 font-mono font-medium text-emerald-700">{result.extracted.mrp}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Raw Extracted Text Box */}
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase text-[#64748B] mb-2.5 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    Raw Unprocessed Optical Text (Vision Output)
                  </h3>
                  <div className="bg-[#0F172A] text-slate-300 p-4 rounded-md border border-[#E2E8F0] font-mono text-xs max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {result.rawText || "No text could be OCR-parsed from the uploaded image geometry."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center text-[#64748B]">
                <FileText className="h-12 w-12 text-slate-300 mb-3 opacity-60" />
                <p className="text-sm font-medium text-slate-600">Awaiting scan image input</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Upload or snap a packaging label on the left to immediately inspect field parsing logic and engine confidence scores.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
