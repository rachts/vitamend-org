import { NextResponse } from "next/server";
import { auth } from "@/auth";
import connectMongoose from "@/lib/db/mongoose";
import { Notification } from "@/models/Notification";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Notification ID missing" }, { status: 400 });
    }

    await connectMongoose();

    const notif = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { read: true },
      { new: true }
    );

    if (!notif) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification: notif });
  } catch (error: unknown) {
    console.error("PATCH /api/notifications/:id error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
