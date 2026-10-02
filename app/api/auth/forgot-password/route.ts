import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectMongoose from "@/lib/db";
import { User } from "@/models/User";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limit";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const limit = await rateLimit(req, 5, 1);
    if (!limit.allowed) return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    await connectMongoose();
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (User as any).findOne({ email: normalizedEmail });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      const baseUrl = process.env.NEXTAUTH_URL || "https://vitamend.in";
      const resetLink = `${baseUrl}/auth/reset-password?token=${resetToken}`;

      if (resend) {
        try {
          await resend.emails.send({
            from: "VitaMend <security@vitamend.org>",
            to: normalizedEmail,
            subject: "VitaMend Password Reset Request",
            html: `
              <div style="font-family: sans-serif; padding: 24px; color: #1C1A14; background-color: #F5F2EC;">
                <div style="max-width: 560px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #D8D2C4;">
                  <h2 style="color: #2C3320; margin-bottom: 16px;">Password Reset Request</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #5C5545;">
                    You requested a password reset for your VitaMend account. Click the button below to reset your password. This link will expire in 1 hour.
                  </p>
                  <div style="margin: 24px 0;">
                    <a href="${resetLink}" style="display: inline-block; background-color: #2C3320; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                      Reset Password
                    </a>
                  </div>
                  <p style="font-size: 12px; color: #8C8270;">
                    If you did not request this, please ignore this email. Your password will remain unchanged.
                  </p>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error("Failed to dispatch reset email via Resend:", emailErr);
        }
      } else {
        console.log(`[DEV] Password reset link for ${normalizedEmail}: ${resetLink}`);
      }
    }

    // Always return generic success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with that email address, a password reset link has been dispatched.",
    });
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
