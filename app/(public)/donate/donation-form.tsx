"use client"

import Image from "next/image";
import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ShieldCheck } from "lucide-react"

export default function DonationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [images, setImages] = useState<File[]>([])
  
  const [submittedDonationId, setSubmittedDonationId] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>("")
  const [verificationResult, setVerificationResult] = useState<{ aiReasoning?: string } | null>(null)
  
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    medicineName: "",
    brand: "",
    dosage: "",
    quantity: "",
    expiryDate: "",
    category: "",
    condition: "",
    notes: "",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    donorAddress: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (submittedDonationId && verificationStatus === "pending") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/donations/${submittedDonationId}`);
          const data = await res.json();
          if (data.success) {
            setVerificationStatus(data.status);
            if (data.status !== "pending") {
              setVerificationResult(data.result);
              clearInterval(interval);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [submittedDonationId, verificationStatus]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      toast({
        title: "Upload Limit Exceeded",
        description: "A maximum of 5 packaging photos may be attached.",
        variant: "destructive",
      })
      return
    }

    setImages((prev) => [...prev, ...files])

    if (files.length > 0 && files[0]) {
      await processImageWithOCR(files[0])
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    
    if (files.length + images.length > 5) {
      toast({
        title: "Upload Limit Exceeded",
        variant: "destructive",
      })
      return
    }

    setImages((prev) => [...prev, ...files])

    if (files.length > 0 && files[0]) {
      await processImageWithOCR(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const processImageWithOCR = async (_file: File) => {
    setIsProcessingOCR(true)
    
    // The AI pipeline handles OCR server-side after upload
    // We skip the client-side OCR extraction here to avoid heavy payloads
    try {
      toast({
        title: "Photo Attached",
        description: "Medicine details will be verified by our AI after submission.",
      })
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not attach image.",
        variant: "destructive",
      })
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const toBase64 = (file: File) => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const base64Images = await Promise.all(images.map(async (file) => {
        const dataUrl = await toBase64(file);
        const base64 = dataUrl.split(",")[1];
        return { data: base64, mimeType: file.type };
      }));

      const result = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: [],
          base64Images,
          quantity: Number.parseInt(formData.quantity) || 1,
        }),
      }).then(res => res.json())

      if (result.medicineId && !result.error) {
        toast({
          title: "Donation Submitted",
          description: "Your donation is now being processed by our AI...",
        })
        setSubmittedDonationId(result.medicineId || result.id || "dummy")
        setVerificationStatus("pending")
      } else {
        throw new Error(result.error || "Failed to submit donation")
      }
    } catch (err: unknown) {
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const labelClass = "block text-[var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--text-muted)] mb-2"
  const inputClass = "w-full bg-transparent border-0 border-b border-[var(--border)] px-0 py-2 focus:ring-0 focus:border-[var(--accent-dark)] transition-colors font-sans text-[var(--text-primary)] text-lg outline-none"

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-6">
      <div className="text-center mb-16">
        <h1 className="font-serif text-[var(--text-h1)] text-[var(--text-primary)] mb-4">Donate Medicines</h1>
        <p className="font-sans text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          Upload photos and our AI will automatically extract medicine details. Help us reduce medical waste and make healthcare accessible!
        </p>
      </div>

      {submittedDonationId ? (
        <div className="bg-white p-8 rounded-xl border border-[#ddd8cf] shadow-sm text-center">
          {verificationStatus === "pending" ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[var(--accent-dark)]" />
              <h2 className="text-2xl font-serif text-[var(--text-primary)]">AI Verification in Progress</h2>
              <p className="font-sans text-[var(--text-secondary)]">Please wait while our AI engine analyzes the provided images for authenticity, tampering, and expiration.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${verificationStatus === 'approved' ? 'bg-green-100 text-green-700' : verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                <ShieldCheck className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-serif text-[var(--text-primary)]">Verification Complete</h2>
              <p className="font-sans text-[var(--text-secondary)]">Status: <span className="font-bold capitalize">{verificationStatus.replace('_', ' ')}</span></p>
              {verificationResult?.aiReasoning && (
                <div className="bg-blue-50 p-4 rounded text-left mt-4 border border-blue-100 max-w-2xl w-full">
                  <p className="text-sm text-blue-900 font-sans whitespace-pre-wrap">{verificationResult.aiReasoning}</p>
                </div>
              )}
              <button onClick={() => {
                setSubmittedDonationId(null);
                setVerificationStatus("");
                setVerificationResult(null);
                setFormData({
                  medicineName: "", brand: "", dosage: "", quantity: "", expiryDate: "",
                  category: "", condition: "", notes: "",
                  donorName: "", donorEmail: "", donorPhone: "", donorAddress: "",
                });
                setImages([]);
              }} className="mt-6 bg-[var(--accent-dark)] text-white px-6 py-2 rounded font-medium hover:bg-[#2d361f]">
                Submit Another Donation
              </button>
            </div>
          )}
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="flex flex-col gap-16">
        
        {/* Section 01 */}
        <section className="flex flex-col gap-6">
          <div className="border-b border-[var(--border)] pb-2 mb-4">
            <span className="font-serif text-[var(--text-h2)] text-[var(--text-primary)]">Section 01</span>
          </div>
          <p className="font-sans text-[var(--text-secondary)] mb-2">Upload clear photos of your medicine packaging. Our AI will extract details automatically!</p>
          
          <div 
            className="w-full border border-dashed border-[var(--border)] p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors min-h-[200px]"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isProcessingOCR ? (
              <div className="flex flex-col items-center gap-4 text-[var(--text-primary)]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="font-sans text-xs uppercase tracking-widest">Scanning packaging...</span>
              </div>
            ) : (
              <span className="font-sans text-sm uppercase tracking-widest text-[var(--text-muted)]">
                Select Images (Max 5)
              </span>
            )}
            <input 
              ref={fileInputRef}
              accept="image/*" 
              className="hidden" 
              multiple 
              type="file" 
              onChange={handleImageUpload}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square border border-stone">
                  <Image width={500} height={500} unoptimized 
                    className="w-full h-full object-cover" 
                    src={URL.createObjectURL(img)}
                    alt="Packaging"
                  />
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute top-2 right-2 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] w-6 h-6 flex items-center justify-center text-xs hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 02 */}
        <section className="flex flex-col gap-8">
          <div className="border-b border-[var(--border)] pb-2 mb-4">
            <span className="font-serif text-[var(--text-h2)] text-[var(--text-primary)]">Section 02</span>
            <p className="font-sans text-[var(--text-secondary)] mt-1">Medicine Information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Medicine Name *</label>
              <input required name="medicineName" value={formData.medicineName} onChange={handleInputChange} className={inputClass} type="text" />
            </div>
            <div>
              <label className={labelClass}>Brand *</label>
              <input required name="brand" value={formData.brand} onChange={handleInputChange} className={inputClass} type="text" />
            </div>
            <div>
              <label className={labelClass}>Dosage *</label>
              <input required name="dosage" value={formData.dosage} onChange={handleInputChange} className={inputClass} type="text" />
            </div>
            <div>
              <label className={labelClass}>Quantity *</label>
              <input required name="quantity" value={formData.quantity} onChange={handleInputChange} className={inputClass} type="number" min="1" />
            </div>
            <div>
              <label className={labelClass}>Expiry Date *</label>
              <input required name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className={inputClass} type="text" placeholder="MM/YYYY" />
            </div>
            <div className="relative">
              <label className={labelClass}>Category *</label>
              <select required name="category" value={formData.category} onChange={handleInputChange} className={`${inputClass} appearance-none pr-8 cursor-pointer`}>
                <option value="" disabled></option>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Cream/Ointment">Cream/Ointment</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute right-0 bottom-3 pointer-events-none text-olive">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Condition *</label>
            <div className="flex flex-col sm:flex-row gap-6 mt-4">
              {['Unopened/Sealed', 'Opened but unused', 'Partially used'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent-dark)] transition-colors">
                    {formData.condition === opt && (
                      <div className="w-3 h-3 rounded-full bg-[var(--accent-dark)]"></div>
                    )}
                  </div>
                  <input 
                    type="radio" 
                    name="condition" 
                    value={opt} 
                    checked={formData.condition === opt}
                    onChange={handleInputChange}
                    className="hidden" 
                    required 
                  />
                  <span className="font-sans text-[var(--text-primary)] text-base">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>Additional Notes</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleInputChange} 
              className={`${inputClass} resize-none min-h-[40px]`}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
          </div>
        </section>

        {/* Section 03 */}
        <section className="flex flex-col gap-8">
          <div className="border-b border-[var(--border)] pb-2 mb-4">
            <span className="font-serif text-[var(--text-h2)] text-[var(--text-primary)]">Section 03</span>
            <p className="font-sans text-[var(--text-secondary)] mt-1">Your Information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input required name="donorName" value={formData.donorName} onChange={handleInputChange} className={inputClass} type="text" />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input required name="donorEmail" value={formData.donorEmail} onChange={handleInputChange} className={inputClass} type="email" />
            </div>
            <div>
              <label className={labelClass}>Phone *</label>
              <input required name="donorPhone" value={formData.donorPhone} onChange={handleInputChange} className={inputClass} type="tel" />
            </div>
            <div>
              <label className={labelClass}>Pickup Address *</label>
              <input required name="donorAddress" value={formData.donorAddress} onChange={handleInputChange} className={inputClass} type="text" />
            </div>
          </div>
        </section>

        {/* Submit Area */}
        <section className="pt-8 border-t border-[var(--border)] flex flex-col items-center gap-4">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-4">
            {isSubmitting ? "Submitting..." : "Submit Donation"}
          </button>
          <p className="font-sans text-xs text-[var(--text-muted)]">
            By submitting, you agree to our terms of service and privacy policy.
          </p>
        </section>

      </form>
      )}
    </div>
  )
}
