"use client"

import React, { useEffect, useRef, useState } from "react"
import { AlertTriangle, ArrowRight, Camera, Check, CheckCircle2, Clipboard, FileText, Image as ImageIcon, Loader2, RefreshCw, ShieldCheck, Sparkles, Upload } from "lucide-react"
import Link from "next/link"
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

interface ValidationResult {
  isValid: boolean
  summary?: string
  errors?: { field: string; message: string }[]
  warnings?: { field: string; message: string }[]
}

interface TestOcrResult {
  success: boolean
  confidence: number
  processingTimeMs?: number
  rawText?: string
  extracted?: ParsedOcrData
  validation?: ValidationResult
  error?: string
  code?: string
  isDemoMode?: boolean
}

const fields: { key: keyof ParsedOcrData; label: string; hint: string; required?: boolean }[] = [
  { key: "medicineName", label: "Medicine name", hint: "Brand or generic name", required: true },
  { key: "dosage", label: "Strength / dosage", hint: "For example, 500mg" },
  { key: "batchNumber", label: "Batch number", hint: "Printed batch or lot code", required: true },
  { key: "expiryDate", label: "Expiry date", hint: "Usually MM/YYYY", required: true },
  { key: "manufacturer", label: "Manufacturer", hint: "Company printed on pack" },
  { key: "mrp", label: "MRP", hint: "Maximum retail price" },
]

export default function TestOcrPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<TestOcrResult | null>(null)
  const [draft, setDraft] = useState<ParsedOcrData>({ medicineName: null, batchNumber: null, expiryDate: null, manufacturer: null, dosage: null, mrp: null })
  const [cameraActive, setCameraActive] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  useEffect(() => () => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((track) => track.stop())
  }, [])

  const handleFileSelect = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please choose an image", description: "Upload a JPG, PNG, or WEBP photo of the packaging.", variant: "destructive" })
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image is too large", description: "Please choose an image smaller than 10 MB.", variant: "destructive" })
      return
    }
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    void processImage(file)
  }

  const processImage = async (file: File) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("image", file)
    const startedAt = Date.now()
    try {
      const response = await fetch("/api/ocr", { method: "POST", body: formData })
      const data = await response.json()
      const nextResult: TestOcrResult = { ...data, processingTimeMs: data.processingTimeMs || Date.now() - startedAt }
      setResult(nextResult)
      if (data.success && data.extracted) {
        setDraft({ ...data.extracted })
        toast({ title: "Label read", description: `${data.confidence || 0}% confidence. Review the highlighted fields before continuing.` })
      } else {
        toast({ title: "Could not read this label", description: data.error || "Try a clearer photo with the text facing the camera.", variant: "destructive" })
      }
    } catch {
      setResult({ success: false, confidence: 0, error: "We could not reach the OCR service. Check your connection and try again." })
      toast({ title: "Connection problem", description: "Your image is still on this device. Try again when you are back online.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const startCamera = async () => {
    try {
      setCameraActive(true)
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1600 }, height: { ideal: 1200 } } })
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
    } catch {
      setCameraActive(false)
      toast({ title: "Camera unavailable", description: "Use the upload button or allow camera access in your browser.", variant: "destructive" })
      cameraInputRef.current?.click()
    }
  }

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((track) => track.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext("2d")?.drawImage(video, 0, 0)
    canvas.toBlob((blob) => { if (blob) { stopCamera(); handleFileSelect(new File([blob], `medicine-scan-${Date.now()}.jpg`, { type: "image/jpeg" })) } }, "image/jpeg", 0.95)
  }

  const updateDraft = (key: keyof ParsedOcrData, value: string) => setDraft((current) => ({ ...current, [key]: value || null }))

  const continueToDonation = () => {
    localStorage.setItem("vitamend:ocr-draft", JSON.stringify(draft))
    window.location.href = "/donate"
  }

  const copyResults = async () => {
    const text = fields.map(({ key, label }) => `${label}: ${draft[key] || "Not detected"}`).join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      toast({ title: "Copy unavailable", description: "Your browser did not allow clipboard access. Select the details manually instead.", variant: "destructive" })
    }
  }

  const confidence = result?.confidence || 0
  const hasMissingRequired = fields.filter((field) => field.required).some((field) => !draft[field.key])
  const needsReview = hasMissingRequired || confidence < 80 || Boolean(result?.validation?.errors?.length)

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <section className="border-b border-[var(--border)] bg-[var(--bg-secondary)] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-dark)]"><Sparkles className="h-4 w-4" /> VitaMend scan desk</div>
              <h1 className="font-serif text-4xl leading-tight sm:text-6xl">Turn a package photo into a safer donation.</h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">Our vision system reads the label. You stay in control: review every detail, correct anything it missed, then send the verified draft to donation intake.</p>
            </div>
            <Link href="/donor-guide" className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium hover:bg-[var(--bg-primary)]">Read safety guide <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            {["1 · Capture the label", "2 · Review the readout", "3 · Send to pharmacist review"].map((step, index) => <div key={step} className={`rounded-md border px-4 py-3 ${index === 0 ? "border-[var(--accent-dark)] bg-[var(--accent-dark)] text-white" : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)]"}`}><span className="font-mono text-xs opacity-70">0{index + 1}</span><span className="ml-3 font-medium">{step.slice(4)}</span></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[0_18px_50px_rgba(44,51,32,0.06)] sm:p-7">
          <div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Step 01</p><h2 className="mt-1 font-serif text-2xl">Show us the label</h2></div><ShieldCheck className="h-6 w-6 text-[var(--accent-dark)]" /></div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-[var(--border)] bg-[#182018]">
            {cameraActive ? <><video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted aria-label="Live medicine packaging camera preview" /><div className="absolute inset-5 rounded border-2 border-white/70" /><div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2"><button type="button" onClick={capturePhoto} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#182018]"><Camera className="h-4 w-4" /> Capture label</button><button type="button" onClick={stopCamera} className="rounded-md bg-black/60 px-4 py-2 text-sm text-white">Cancel</button></div></> : previewUrl ? <><Image src={previewUrl} alt="Selected medicine packaging" width={1200} height={900} unoptimized className="h-full w-full object-contain" />{isLoading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#182018]/85 text-white"><Loader2 className="mb-3 h-8 w-8 animate-spin text-[#a9c58b]" /><p className="text-sm font-medium">Reading the label…</p><p className="mt-1 text-xs text-white/70">Looking for name, batch, expiry and manufacturer</p></div>}</> : <div className="flex h-full flex-col items-center justify-center px-8 text-center text-white"><div className="mb-4 rounded-full bg-[#a9c58b]/15 p-4"><ImageIcon className="h-8 w-8 text-[#a9c58b]" /></div><p className="font-medium">No photo yet</p><p className="mt-2 max-w-xs text-sm leading-6 text-white/65">Keep the package flat, fill the frame, and make sure the batch and expiry print is sharp.</p></div>}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => fileInputRef.current?.click()} disabled={isLoading || cameraActive} className="btn-primary-saas h-11"><Upload className="h-4 w-4" /> Upload photo</button><button onClick={cameraActive ? capturePhoto : startCamera} disabled={isLoading} className="btn-secondary-saas h-11"><Camera className="h-4 w-4" /> {cameraActive ? "Capture" : "Use camera"}</button></div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handleFileSelect(event.target.files?.[0])} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => handleFileSelect(event.target.files?.[0])} />
          <div className="mt-6 grid gap-3 border-t border-[var(--border)] pt-5 text-xs text-[var(--text-secondary)] sm:grid-cols-3"><div><Check className="mb-1 h-4 w-4 text-emerald-700" />Good lighting</div><div><Check className="mb-1 h-4 w-4 text-emerald-700" />Text in focus</div><div><Check className="mb-1 h-4 w-4 text-emerald-700" />No glare</div></div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[0_18px_50px_rgba(44,51,32,0.06)] sm:p-7">
          <div className="mb-5 flex items-center justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">Step 02</p><h2 className="mt-1 font-serif text-2xl">Review the readout</h2></div>{result && <button onClick={() => selectedFile && void processImage(selectedFile)} disabled={isLoading} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-dark)]"><RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Re-scan</button>}</div>
          {!result && !isLoading ? <div className="flex min-h-[420px] flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] px-8 text-center"><FileText className="mb-4 h-10 w-10 text-[var(--text-muted)]" /><p className="font-medium">Your extracted details will appear here</p><p className="mt-2 max-w-sm text-sm leading-6 text-[var(--text-secondary)]">We never silently accept a scan. Every value is editable before it reaches the donation form.</p></div> : isLoading ? <div className="flex min-h-[420px] flex-col items-center justify-center text-center"><Loader2 className="mb-4 h-9 w-9 animate-spin text-[var(--accent-dark)]" /><p className="font-medium">Reading your medicine label</p><p className="mt-2 text-sm text-[var(--text-secondary)]">Checking the visible text against medicine safety fields.</p></div> : <div className="space-y-5">
            <div className={`flex items-start gap-3 rounded-lg border p-4 ${needsReview ? "border-amber-300 bg-amber-50/60" : "border-emerald-200 bg-emerald-50/60"}`}><div className={`mt-0.5 rounded-full p-1.5 ${needsReview ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{needsReview ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</div><div className="flex-1"><p className="text-sm font-semibold">{needsReview ? "Human review needed" : "Strong first read — please still verify"}</p><p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{result?.validation?.summary || "AI assists the review; it does not replace the physical package or pharmacist sign-off."}</p></div><span className="font-mono text-sm font-bold">{confidence}%</span></div>
            <div className="grid gap-3 sm:grid-cols-2">{fields.map(({ key, label, hint, required }) => <label key={key} className="group"><span className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]"><span>{label}{required && <span className="ml-1 text-[var(--accent-rust)]">*</span>}</span>{!draft[key] && <span className="font-normal normal-case tracking-normal text-amber-700">Check manually</span>}</span><input value={draft[key] || ""} onChange={(event) => updateDraft(key, event.target.value)} placeholder={hint} className="w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-dark)] focus:ring-2 focus:ring-[var(--accent-dark)]/10" /></label>)}</div>
            {result?.validation?.warnings?.length ? <div className="rounded-md border border-amber-200 bg-amber-50/50 p-3 text-xs leading-5 text-amber-900"><p className="font-semibold">Before you continue</p><ul className="mt-1 list-disc pl-4">{result.validation.warnings.slice(0, 3).map((warning) => <li key={warning.message}>{warning.message}</li>)}</ul></div> : null}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-5"><button onClick={copyResults} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"><Clipboard className="h-4 w-4" /> {copied ? "Copied" : "Copy details"}</button><button onClick={continueToDonation} disabled={hasMissingRequired} className="btn-primary-saas"><span>Continue to donation</span><ArrowRight className="h-4 w-4" /></button></div>
          </div>}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-3 sm:px-6 lg:px-8"><div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5"><ShieldCheck className="mb-3 h-5 w-5 text-[var(--accent-dark)]" /><h3 className="font-serif text-lg">No silent approvals</h3><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Every scan is advisory until a pharmacist reviews the physical packaging.</p></div><div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5"><RefreshCw className="mb-3 h-5 w-5 text-[var(--accent-dark)]" /><h3 className="font-serif text-lg">Retry without starting over</h3><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">A clearer photo can be rescanned without losing your place.</p></div><div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-5"><FileText className="mb-3 h-5 w-5 text-[var(--accent-dark)]" /><h3 className="font-serif text-lg">Built for real labels</h3><p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Handles common Indian formats such as B.No., Exp., Mfg. Lic. and MRP.</p></div></section>
    </main>
  )
}
