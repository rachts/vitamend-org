import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Medicine } from "@/models/Medicine";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  await connectMongoose();
  const resolvedParams = await params;

  if (session.user.role === "admin") {
    const med = await Medicine.findById(resolvedParams.id).lean();
    if (!med) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ 
      success: true, 
      status: med.status, 
      result: med.verificationResult 
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
