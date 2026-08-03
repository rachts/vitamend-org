import { NextResponse } from "next/server";
import connectMongoose from "@/lib/db/mongoose";
import { Volunteer } from "@/models/Volunteer";

export async function POST(req: Request) {
  try {
    await connectMongoose();
    const body = await req.json();

    if (!body.fullName || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const volunteer = await Volunteer.create(body);

    return NextResponse.json({ success: true, volunteer }, { status: 201 });
  } catch (error: unknown) {
    console.error("Volunteer submission error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to submit application" },
      { status: 500 }
    );
  }
}
