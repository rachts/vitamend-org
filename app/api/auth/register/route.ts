import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { User } from "@/models/User";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

function normalizeUserRole(role: string): string {
  const roleMap: Record<string, string> = {
    "Donate Medicines": "donor",
    donor: "donor",
    "Receive Medicines": "recipient",
    recipient: "recipient",
    Volunteer: "volunteer",
    volunteer: "volunteer",
    admin: "admin",
    ngo: "ngo",
  };
  return roleMap[role] ?? "donor";
}

export async function POST(req: NextRequest) {
  try {
    const limit = await rateLimit(req, 5, 1);
    if (!limit.allowed) return NextResponse.json({ success: false, message: "Too many requests" }, { status: 429 });
    const payload = z.object({
      name: z.string().trim().min(2).max(100),
      email: z.string().trim().email().max(254),
      password: z.string().min(8).max(128),
      role: z.enum(["donor", "recipient", "volunteer", "ngo", "Donate Medicines", "Receive Medicines", "Volunteer"]).optional(),
      phone: z.string().trim().max(30).optional(),
      address: z.string().trim().max(300).optional(),
    }).parse(await req.json());
    await connectMongoose();
    const { name, password, role, phone, address } = payload;
    const email = payload.email.toLowerCase();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userExists = await (User as any).findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    // Registration must never be able to mint an administrator account.
    const normalizedRole = normalizeUserRole(role || "donor");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = await (User as any).create({
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
    return NextResponse.json(
      { success: false, message: error instanceof z.ZodError ? "Invalid registration details" : "Failed to register account" },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}
