import { z } from "zod";

export const volunteerApplicationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).refine(value => value === "" || /^[+\d ()-]{5,30}$/.test(value)).optional(),
  city: z.string().trim().min(2).max(120),
  qualification: z.string().trim().max(1000).optional(),
  role: z.enum(["Medical Volunteer", "Pickup Logistics Agent", "Verification Inspector", "Campus Ambassador"]),
  availability: z.enum(["Part-time (2-5 hrs/wk)", "Weekends", "Flexible"]),
}).strict();
