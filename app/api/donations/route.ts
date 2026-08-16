import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const donationSchema = z.object({
  medicineName: z.string().min(1).max(200),
  genericName: z.string().max(200).optional(),
  dosage: z.string().max(100).optional(),
  batchNumber: z.string().max(50).optional(),
  manufacturer: z.string().max(200).optional(),
  quantity: z.coerce.number().int().min(1).max(1000).default(1),
  expiryDate: z.string().datetime().optional(),
  images: z.array(z.string().url()).max(5).optional(),
  base64Images: z.array(
    z.object({
      data: z.string().min(1),
      mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    })
  ).max(5).optional(),
});

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req);
  if (!limit.success) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.json();
    const body = donationSchema.parse(rawBody);

    await connectMongoose();

    const expiryDate = body.expiryDate ? new Date(body.expiryDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    const donation = await Medicine.create({
      donorId: session.user.id,
      name: body.medicineName,
      genericName: body.genericName,
      dosage: body.dosage,
      batchNumber: body.batchNumber,
      manufacturer: body.manufacturer,
      quantity: body.quantity,
      expiryDate,
      images: body.images || [],
      status: "under_review",
    });

    const donationId = donation._id.toString();

    // Trigger AI verification pipeline asynchronously if images are provided
    if (body.base64Images && body.base64Images.length > 0) {
      const { runVerificationPipeline } = await import("@/lib/ai-verification-engine");
      // Don't block response, but handle failure gracefully
      runVerificationPipeline(donationId, body.base64Images).catch(async (err) => {
        console.error("Async verification pipeline failed:", err);
        await Medicine.findByIdAndUpdate(donationId, { status: "under_review" });
      });
    }

    return NextResponse.json({ success: true, donationId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    await connectMongoose();

    const { searchParams } = new URL(req.url);
    const rawPage = searchParams.get("page") ?? "1";
    const rawLimit = searchParams.get("limit") ?? "20";
    const page = Number.isNaN(Number(rawPage)) ? 1 : Math.max(1, Number(rawPage));
    const limit = Number.isNaN(Number(rawLimit)) ? 20 : Math.min(100, Math.max(1, Number(rawLimit)));

    let query: Record<string, unknown> = {};
    if (session?.user?.id) {
      query = { donorId: session.user.id };
    }

    const donations = await Medicine.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, donations, page, limit });
  } catch (error) {
    console.error("API /donations GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", donations: [] },
      { status: 500 }
    );
  }
}
