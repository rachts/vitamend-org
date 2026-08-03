import mongoose, { Document, Schema, Model } from "mongoose";

export const DistributionRecipient = ["hospital", "ngo", "community_center", "beneficiary"] as const;
export const DistributionStatus = ["pending", "in_transit", "delivered", "cancelled"] as const;

export interface IDistribution extends Document {
  inventoryId: string;
  recipientType: typeof DistributionRecipient[number];
  recipientId?: string;
  recipientName: string;
  quantity: number;
  status: typeof DistributionStatus[number];
  distributedBy?: string;
  distributedAt?: Date;
  deliveryProof?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DistributionSchema = new Schema<IDistribution>(
  {
    inventoryId: { type: String, required: true, index: true },
    recipientType: { type: String, enum: DistributionRecipient, required: true },
    recipientId: { type: String },
    recipientName: { type: String, required: true },
    quantity: { type: Number, required: true },
    status: { type: String, enum: DistributionStatus, default: "pending" },
    distributedBy: { type: String },
    distributedAt: { type: Date },
    deliveryProof: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Distribution = (mongoose.models.Distribution as Model<IDistribution>) || mongoose.model<IDistribution>("Distribution", DistributionSchema);
