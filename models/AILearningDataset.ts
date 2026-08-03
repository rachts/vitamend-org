import mongoose, { Document, Schema, Model } from "mongoose";

export const CorrectionType = ["classification", "ocr", "tamper", "duplicate"] as const;

export interface IAILearningDataset extends Document {
  medicineId: string;
  originalPrediction: unknown;
  correctedPrediction: unknown;
  correctionType: typeof CorrectionType[number];
  correctedBy: string;
  usedForTraining: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AILearningDatasetSchema = new Schema<IAILearningDataset>(
  {
    medicineId: { type: String, required: true },
    originalPrediction: { type: Schema.Types.Mixed },
    correctedPrediction: { type: Schema.Types.Mixed },
    correctionType: { type: String, enum: CorrectionType, required: true },
    correctedBy: { type: String, required: true },
    usedForTraining: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AILearningDataset = (mongoose.models.AILearningDataset as Model<IAILearningDataset>) || mongoose.model<IAILearningDataset>("AILearningDataset", AILearningDatasetSchema);
