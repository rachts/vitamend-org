import mongoose, { Document, Model } from "mongoose";

export interface IClinicRequest extends Document {
  clinicName: string;
  licenseNo: string;
  contactPerson: string;
  email: string;
  medicineNeeded?: string;
  quantityNeeded?: number;
  urgency?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  city?: string;
  type: "shortage_report" | "registration";
  status: "pending" | "matching" | "dispatched" | "fulfilled";
  createdAt: Date;
  updatedAt: Date;
}

const clinicRequestSchema = new mongoose.Schema<IClinicRequest>(
  {
    clinicName: { type: String, required: true, trim: true },
    licenseNo: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
    },
    medicineNeeded: { type: String, trim: true },
    quantityNeeded: { type: Number },
    urgency: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      default: "HIGH",
    },
    city: { type: String, trim: true },
    type: {
      type: String,
      enum: ["shortage_report", "registration"],
      default: "shortage_report",
    },
    status: {
      type: String,
      enum: ["pending", "matching", "dispatched", "fulfilled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const ClinicRequest: Model<IClinicRequest> =
  (mongoose.models.ClinicRequest as Model<IClinicRequest>) ||
  mongoose.model<IClinicRequest>("ClinicRequest", clinicRequestSchema);

export default ClinicRequest;
