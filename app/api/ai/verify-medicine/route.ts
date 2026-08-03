import { type NextRequest, NextResponse } from "next/server"
import { MedicineVerificationService } from "@/lib/ai/medicine-verification"
import { rateLimit } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

const limiter = rateLimit(10, 1)

export async function POST(req: NextRequest) {
  const rateLimitResult = await limiter(req as unknown as Request)
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  try {
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    const result = await MedicineVerificationService.verifyMedicine(imageUrl)

    return NextResponse.json(result)
  } catch (error: unknown) {
    logger.error("Medicine verification API error:", (error as Error).message)
    return NextResponse.json({ error: "Failed to verify medicine" }, { status: 500 })
  }
}
