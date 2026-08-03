import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db";
import { Notification } from "@/models/Notification";

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();

    const notifications = await Notification.find({
      userId: session.user.id,
      read: false,
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    return NextResponse.json({ notifications });
  } catch (error: unknown) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
