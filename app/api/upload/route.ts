import { type NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const limit = await rateLimit(request, 20, 2);
    if (!limit.allowed) return NextResponse.json({ success: false, error: "Too many requests" }, { status: 429 });

    const formData = await request.formData();
    const candidate = formData.get("file");
    const file = candidate instanceof File ? candidate : null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 415 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "File too large (max 10MB)" }, { status: 400 });
    }

    const extensions: Record<string, string> = {
      "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png",
      "image/webp": "webp", "application/pdf": "pdf",
    };
    const ext = extensions[file.type];
    if (!ext) return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 415 });
    const blobPath = `uploads/${crypto.randomUUID()}.${ext}`;

    const blob = await put(blobPath, file, {
      access: "public",
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      name: blob.pathname,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
  }
}
