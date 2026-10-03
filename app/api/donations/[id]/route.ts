import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";
import { isValidObjectId } from "mongoose";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const resolvedParams = await params;
  if (!isValidObjectId(resolvedParams.id)) return NextResponse.json({ error: "Invalid donation ID" }, { status: 400 });
  await connectMongoose();

  if (session.user.role === "admin") {
    const med = await Medicine.findById(resolvedParams.id).select("+packagingEvidence").lean();
    if (!med) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ 
      success: true, 
      status: med.status, 
      result: med.verificationResult,
      packagingEvidence: med.packagingEvidence,
    });
  }

  const med = await Medicine.findOne({ 
    _id: resolvedParams.id, 
    donorId: session.user.id 
  }).lean();
  
  if (!med) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  return NextResponse.json({ 
    success: true, 
    status: med.status, 
    result: med.verificationResult 
  });
}
