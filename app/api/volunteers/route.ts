import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { Volunteer } from "@/models/Volunteer";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const limit = await rateLimit(req, 5, 1);
    if (!limit.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    await connectMongoose();
    const body = z.object({
      fullName: z.string().trim().min(2).max(120),
      email: z.string().trim().email().max(254),
      phone: z.string().trim().min(5).max(30),
      address: z.string().trim().max(300).optional(),
      availability: z.string().trim().max(100).optional(),
      experience: z.string().trim().max(1000).optional(),
    }).parse(await req.json());

    const volunteer = await Volunteer.create(body);

    return NextResponse.json({ success: true, volunteer }, { status: 201 });
  } catch (error: unknown) {
    console.error("Volunteer submission error:", error);
    return NextResponse.json(
      { error: error instanceof z.ZodError ? "Invalid application details" : "Failed to submit application" },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
