import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { User } from "@/models/User";
import { rateLimit } from "@/lib/rate-limit";
import crypto from "crypto";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const limit = await rateLimit(req, 10, 1);
    if (!limit.allowed) return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    const payload = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), newPassword: z.string() }).safeParse(await req.json());
    if (!payload.success) {
      return NextResponse.json(
        { success: false, message: "Token and new password are required" },
        { status: 400 }
      );
    }
    const { token, newPassword } = payload.data;

    if (newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { success: false, message: "Password must be between 8 and 128 characters" },
        { status: 400 }
      );
    }

    await connectMongoose();
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
