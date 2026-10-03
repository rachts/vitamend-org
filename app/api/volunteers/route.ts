import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { Volunteer } from "@/models/Volunteer";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { volunteerApplicationSchema } from "@/lib/volunteer-validation";

export async function POST(req: Request) {
  try {
    const limit = await rateLimit(req, 5, 1);
    if (!limit.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const body = volunteerApplicationSchema.parse(await req.json());
    await connectMongoose();

    const volunteer = await Volunteer.create(body);

    return NextResponse.json({ success: true, applicationId: volunteer._id.toString() }, { status: 201 });
  } catch (error: unknown) {
    console.error("Volunteer submission error:", error);
    return NextResponse.json(
      { error: error instanceof z.ZodError ? "Invalid application details" : "Failed to submit application" },
      { status: error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 500 }
    );
  }
}
