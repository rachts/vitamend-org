import { connectMongoose } from '@/lib/db';
import { Medicine } from '@/models/Medicine';
import { runVerificationPipeline } from '@/lib/ai-verification-engine';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const numMedia = parseInt(formData.get("NumMedia")?.toString() || "0", 10);
    
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

    if (!mediaUrl || !mediaContentType?.startsWith('image/')) {
      const twiml = `
        <Response>
          <Message>Sorry, I can only process images. Please send a clear photo of the medicine.</Message>
        </Response>
      `;
      return new Response(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }

    // Download the image
    const imageRes = await fetch(mediaUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
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
        <Message>${replyText}</Message>
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
