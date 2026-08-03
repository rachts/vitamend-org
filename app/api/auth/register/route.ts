import { NextRequest, NextResponse } from "next/server";
import connectMongoose from "@/lib/db";
import { User } from "@/models/User";

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
    await connectMongoose();
    const { name, email, password, role, phone, address } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userExists = await (User as any).findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const normalizedRole = normalizeUserRole(role);

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
    const err = error as Error;
    return NextResponse.json(
      { success: false, message: err.message || "Failed to register account" },
      { status: 500 }
    );
  }
}
