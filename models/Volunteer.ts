import mongoose, { Document, Schema, Model } from "mongoose";
import type { z } from "zod";
import type { volunteerApplicationSchema } from "@/lib/volunteer-validation";

export const VolunteerStatus = ["pending", "approved", "rejected"] as const;
export interface IVolunteer extends Document, z.infer<typeof volunteerApplicationSchema> {
  status: typeof VolunteerStatus[number];
  createdAt: Date;
  updatedAt: Date;
}
const VolunteerSchema = new Schema<IVolunteer>({
  fullName: { type: String, required: true, maxlength: 120 },
  email: { type: String, required: true, maxlength: 254, index: true },
  phone: { type: String, maxlength: 30 },
  city: { type: String, required: true, maxlength: 120 },
  qualification: { type: String, maxlength: 1000 },
  role: { type: String, required: true },
  availability: { type: String, required: true },
  status: { type: String, enum: VolunteerStatus, default: "pending" },
}, { timestamps: true });

export const Volunteer = (mongoose.models.Volunteer as Model<IVolunteer>) || mongoose.model<IVolunteer>("Volunteer", VolunteerSchema);
