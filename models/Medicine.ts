import mongoose, { Document, Schema, Model } from "mongoose";

export const MedicineStatus = ["pending", "under_review", "approved", "rejected", "distributed", "disposed"] as const;

export interface IMedicine extends Document {
  donorId: string;
  name: string;
  genericName?: string;
  dosage?: string;
  batchNumber?: string;
  manufacturer?: string;
  quantity: number;
  expiryDate: Date;
  images: string[];
  status: typeof MedicineStatus[number];
  category?: string;
  verificationResult?: {
    confidence: number;
    isTampered: boolean;
    isDuplicate: boolean;
    isExpired: boolean;
    isRecalled: boolean;
    aiReasoning: string;
    extractedData: unknown;
  };
  reviewNotes?: string;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    donorId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    genericName: { type: String },
    dosage: { type: String },
    batchNumber: { type: String },
    manufacturer: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    expiryDate: { type: Date, required: true },
    images: [{ type: String }],
    status: { type: String, enum: MedicineStatus, default: "pending", index: true },
    category: { type: String },
    verificationResult: {
      confidence: { type: Number },
      isTampered: { type: Boolean },
      isDuplicate: { type: Boolean },
      isExpired: { type: Boolean },
      isRecalled: { type: Boolean },
      aiReasoning: { type: String },
      extractedData: { type: Schema.Types.Mixed },
    },
    reviewNotes: { type: String },
    reviewedBy: { type: String },
  },
  { timestamps: true }
);

MedicineSchema.index({ donorId: 1, status: 1 });
MedicineSchema.index({ status: 1, createdAt: -1 });

export const Medicine = (mongoose.models.Medicine as Model<IMedicine>) || mongoose.model<IMedicine>("Medicine", MedicineSchema);
