import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import connectMongoose from "@/lib/db/mongoose";
import { Medicine } from "@/models/Medicine";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    await connectMongoose();
    const medicines = await Medicine.find({ status: "approved" }).populate("donor", "name email");
    return NextResponse.json({ success: true, message: "Medicines fetched", data: medicines });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 401 });
    }

    await connectMongoose();
    const body = await req.json();
    
    // In backend/models/User.js, the user might have an id or _id
    // Typically next-auth sets user.id
    const medicine = await Medicine.create({
      ...body,
      donor: (session.user as { id?: string; _id?: string }).id || (session.user as { _id?: string })._id
    });

    return NextResponse.json({ 
      success: true, 
      message: "Medicine added successfully", 
      data: medicine 
    }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, message: (error as Error).message }, { status: 500 });
  }
}
