import { connectMongoose } from '@/lib/db';
import { Medicine } from '@/models/Medicine';
import { runVerificationPipeline } from '@/lib/ai-verification-engine';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limit';

function escapeXml(value: string): string {
  return value.replace(/[<>&'\"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] || char));
}

function validTwilioSignature(req: Request, fields: Record<string, string>): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = req.headers.get('x-twilio-signature');
  if (!authToken || !signature) return process.env.NODE_ENV !== 'production';
  const data = Object.keys(fields).sort().reduce((result, key) => result + key + fields[key], new URL(req.url).toString());
  const expected = crypto.createHmac('sha1', authToken).update(data).digest('base64');
  const actual = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fields = Object.fromEntries(Array.from(formData.entries()).filter(([, value]) => typeof value === 'string').map(([key, value]) => [key, String(value)]));
    if (!validTwilioSignature(req, fields)) return new Response('Forbidden', { status: 403 });
    const limit = await rateLimit(req, 20, 2);
    if (!limit.allowed) return new Response('Too Many Requests', { status: 429 });
    const numMedia = Math.min(4, Math.max(0, parseInt(formData.get("NumMedia")?.toString() || "0", 10) || 0));
    
    if (numMedia === 0) {
      const twiml = `
        <Response>
          <Message>Welcome to VitaMend! Please reply with a photo of the medicine you'd like to donate.</Message>
        </Response>
      `;
      return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }

    // Get the first image
    const mediaUrl = formData.get("MediaUrl0")?.toString();
    const mediaContentType = formData.get("MediaContentType0")?.toString();

    let parsedMediaUrl: URL;
    try { parsedMediaUrl = new URL(mediaUrl || ''); } catch { parsedMediaUrl = new URL('https://invalid.local'); }
    const allowedMediaHost = parsedMediaUrl.protocol === 'https:' && (parsedMediaUrl.hostname === 'api.twilio.com' || parsedMediaUrl.hostname.endsWith('.twiliocdn.com'));
    if (!mediaUrl || !allowedMediaHost || !mediaContentType?.startsWith('image/')) {
      const twiml = `
        <Response>
          <Message>Sorry, I can only process images. Please send a clear photo of the medicine.</Message>
        </Response>
      `;
      return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }

    // Download the image
    const imageRes = await fetch(parsedMediaUrl, { signal: AbortSignal.timeout(15000) });
    if (!imageRes.ok) throw new Error('Twilio media download failed');
    const contentLength = Number(imageRes.headers.get('content-length') || 0);
    if (contentLength > 10 * 1024 * 1024) throw new Error('Twilio media is too large');
    const arrayBuffer = await imageRes.arrayBuffer();
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) throw new Error('Twilio media is too large');
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    await connectMongoose();

    // Create a temporary medicine record
    const med = await Medicine.create({
      donorId: "whatsapp_donor",
      name: "Processing...",
      status: "pending",
      quantity: 1,
      expiryDate: new Date(),
      // For Demo, default category
      category: "General",
    });

    // Run verification pipeline (runs OCR and checks)
    const result = await runVerificationPipeline(med._id.toString(), [{
      data: base64,
      mimeType: mediaContentType
    }]);

    // Fetch the updated medicine to get OCR details
    const updatedMed = await Medicine.findById(med._id);

    let replyText = "";

    if (result.success) {
      if (result.decision === "approved") {
        replyText = `✅ Medicine Verified Successfully!
Medicine: ${updatedMed?.name || 'Unknown'}
Expiry: ${updatedMed?.expiryDate ? new Date(updatedMed.expiryDate).toLocaleDateString() : 'N/A'}
Confidence: ${updatedMed?.verificationResult?.confidence}%

Your medicine is eligible for donation! Please click here to arrange pickup: https://vitamend.vercel.app/donate/pickup/${med._id}`;
      } else if (result.decision === "under_review") {
        replyText = `⚠️ Medicine Under Review
Medicine: ${updatedMed?.name || 'Unknown'}
Confidence was slightly low (${updatedMed?.verificationResult?.confidence}%). A pharmacist will manually review your submission. We will notify you shortly.`;
      } else {
        replyText = `❌ Donation Rejected
We detected a safety issue with this medicine (e.g. Expired, Tampered, or Recalled).
Reason: ${updatedMed?.verificationResult?.aiReasoning || "Failed safety checks."}
Thank you for your understanding.`;
      }
    } else {
      replyText = `❌ We encountered an error processing your image. Please try sending a clearer photo.`;
    }

    const twiml = `
      <Response>
        <Message>${escapeXml(replyText)}</Message>
      </Response>
    `;

    return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
  } catch (error) {
    console.error("Twilio webhook error:", error);
    const twiml = `
      <Response>
        <Message>Sorry, our AI system is currently down. Please try again later.</Message>
      </Response>
    `;
    return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
  }
}
