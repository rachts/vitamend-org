import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectMongoose from "@/lib/db";
import { ClinicRequest } from "@/models/ClinicRequest";
import { rateLimit } from "@/lib/rate-limit";

const clinicRequestSchema = z.object({
  clinicName: z.string().min(2).max(200),
  licenseNo: z.string().min(2).max(100),
  contactPerson: z.string().min(2).max(100),
  email: z.string().email(),
  medicineNeeded: z.string().max(200).optional(),
  quantityNeeded: z.coerce.number().int().min(1).max(50000).optional(),
  urgency: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  city: z.string().max(100).optional(),
  type: z.enum(["shortage_report", "registration"]).optional().default("shortage_report"),
});

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req);
  if (!limit.success) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  try {
    const rawBody = await req.json();
    const validatedData = clinicRequestSchema.parse(rawBody);

    await connectMongoose();

    const requestDoc = await ClinicRequest.create({
      clinicName: validatedData.clinicName,
      licenseNo: validatedData.licenseNo,
      contactPerson: validatedData.contactPerson,
      email: validatedData.email,
      medicineNeeded: validatedData.medicineNeeded,
      quantityNeeded: validatedData.quantityNeeded,
      urgency: validatedData.urgency || "HIGH",
      city: validatedData.city,
      type: validatedData.type,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      requestId: requestDoc._id.toString(),
      message: "Clinic request recorded successfully. Our coordination team will review within 24 hours.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Clinic request error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongoose();
    const requests = await ClinicRequest.find({ status: { $in: ["pending", "matching", "dispatched"] } })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("clinicName city medicineNeeded quantityNeeded urgency status createdAt")
      .lean();

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Fetch clinic requests error:", error);
    return NextResponse.json({ success: false, requests: [] }, { status: 500 });
  }
}
