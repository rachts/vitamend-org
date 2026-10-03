import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { User } from "@/models/User";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeEmail, normalizeUserRole } from "@/lib/auth-policy";

export async function POST(req: NextRequest) {
  try {
    const limit = await rateLimit(req, 5, 1);
    if (!limit.allowed) return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    const payload = z.object({
      name: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(254),
      password: z.string().min(8).max(128),
      role: z.enum(["donor", "recipient", "ngo", "Donate Medicines", "Receive Medicines"]).optional(),
      phone: z.string().trim().max(30).optional(),
      address: z.string().trim().max(300).optional(),
    }).parse(await req.json());
    await connectMongoose();
    const { name, password, role, phone, address } = payload;
    const email = normalizeEmail(payload.email);

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Operational volunteer and administrator accounts require trusted provisioning.
    const normalizedRole = normalizeUserRole(role || "donor");

    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      phone,
      address,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        data: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const invalid = error instanceof z.ZodError || error instanceof SyntaxError;
    return NextResponse.json(
      { success: false, message: invalid ? "Invalid registration details" : "Failed to register account" },
      { status: invalid ? 400 : 500 }
    );
  }
}
