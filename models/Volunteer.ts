import mongoose, { Document, Schema, Model } from "mongoose";

export const VolunteerStatus = ["pending", "approved", "rejected"] as const;

export interface IVolunteer extends Document {
  fullName: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  experience: string;
  role: string;
  availability: Record<string, boolean>;
  motivation: string;
  emergencyName: string;
  emergencyPhone: string;
  reliableTransportation: boolean;
  canLift5kg: boolean;
  medicalConditions?: string;
  references?: string;
  status: typeof VolunteerStatus[number];
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema = new Schema<IVolunteer>(
  {
    fullName: { type: String, required: true },
    dob: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    occupation: { type: String, required: true },
    experience: { type: String, required: true },
    role: { type: String, required: true },
    availability: { type: Schema.Types.Mixed, required: true },
    motivation: { type: String, required: true },
    emergencyName: { type: String, required: true },
    emergencyPhone: { type: String, required: true },
    reliableTransportation: { type: Boolean, default: false },
    canLift5kg: { type: Boolean, default: false },
    medicalConditions: { type: String },
    references: { type: String },
    status: { type: String, enum: VolunteerStatus, default: "pending" },
  },
  { timestamps: true }
);

export const Volunteer = (mongoose.models.Volunteer as Model<IVolunteer>) || mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);
