import mongoose, { Document, Schema, Model } from "mongoose";

export const LogStage = ["ocr", "ai_check", "db_check", "decision", "manual_review"] as const;
export const LogStatus = ["success", "warning", "failure"] as const;

export interface IVerificationLog extends Document {
  medicineId: string;
  stage: typeof LogStage[number];
  status: typeof LogStatus[number];
  details: unknown;
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationLogSchema = new Schema<IVerificationLog>(
  {
    medicineId: { type: String, required: true, index: true },
    stage: { type: String, enum: LogStage, required: true },
    status: { type: String, enum: LogStatus, required: true },
    details: { type: Schema.Types.Mixed },
    confidence: { type: Number },
  },
  { timestamps: true }
);

export const VerificationLog = (mongoose.models.VerificationLog as Model<IVerificationLog>) || mongoose.model<IVerificationLog>("VerificationLog", VerificationLogSchema);
