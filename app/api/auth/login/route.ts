import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, message: "This endpoint is deprecated. Use NextAuth /auth/signin." },
    { status: 410 }
  );
}
