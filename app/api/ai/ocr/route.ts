import { type NextRequest, NextResponse } from "next/server"
import { OCRService } from "@/lib/ai/ocr-service"
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

    const result = await OCRService.extractText(imageUrl)

    return NextResponse.json({
      text: result.text,
      confidence: result.confidence,
      words: result.words,
    })
  } catch (error: unknown) {
    logger.error("OCR API error:", (error as Error).message)
    return NextResponse.json({ error: "Failed to extract text from image" }, { status: 500 })
  }
}
