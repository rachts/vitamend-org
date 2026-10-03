import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { rateLimit } from "@/lib/rate-limit";
import { donationSchema, MAX_DONATION_BODY_BYTES, parseDonationExpiry } from "@/lib/donation-contract";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const limit = await rateLimit(req);
  if (!limit.success) {
    return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });
  }

  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const reader = req.body?.getReader();
    if (!reader) return NextResponse.json({ success: false, error: "Missing body" }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_DONATION_BODY_BYTES) {
        await reader.cancel();
        return NextResponse.json({ success: false, error: "Payload too large" }, { status: 413 });
      }
      chunks.push(value);
    }
    const rawBody = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const body = donationSchema.parse(rawBody);

    await connectMongoose();

    const expiryDate = parseDonationExpiry(body.expiryDate)!;

    const donation = await Medicine.create({
      donorId: session.user.id,
      name: body.medicineName,
      genericName: body.genericName,
      dosage: body.dosage,
      batchNumber: body.batchNumber,
      manufacturer: body.manufacturer,
      brand: body.brand,
      condition: body.condition,
      category: body.category,
      notes: body.notes,
      donorName: body.donorName,
      donorEmail: body.donorEmail,
      donorPhone: body.donorPhone,
      donorAddress: body.donorAddress,
      expiryLabel: body.expiryDate,
      packagingEvidence: body.base64Images || [],
      quantity: body.quantity,
      expiryDate,
      images: body.images || [],
      status: "under_review",
    });

    const donationId = donation._id.toString();

    // Await work within the request lifetime. Evidence remains persisted if analysis fails.
    if (body.base64Images && body.base64Images.length > 0) {
      const { runVerificationPipeline } = await import("@/lib/ai-verification-engine");
      try {
        await runVerificationPipeline(donationId);
      } catch {
        // Never lose the receipt for a successfully persisted donation.
        console.error("Donation analysis unavailable; human review required");
      }
    }

    return NextResponse.json({ success: true, donationId, status: "under_review" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.errors }, { status: 400 });
    }
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await connectMongoose();

    const { searchParams } = new URL(req.url);
    const rawPage = searchParams.get("page") ?? "1";
    const rawLimit = searchParams.get("limit") ?? "20";
    const page = Number.isFinite(Number(rawPage)) ? Math.min(100000, Math.max(1, Math.floor(Number(rawPage)))) : 1;
    const limit = Number.isFinite(Number(rawLimit)) ? Math.min(100, Math.max(1, Math.floor(Number(rawLimit)))) : 20;

    const query = { donorId: session.user.id };

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
