import { Notification, NotificationType, User } from "@/models";
import connectMongoose from "@/lib/db/mongoose";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendNotificationOptions {
  userId: string;
  type: typeof NotificationType[number];
  title: string;
  message: string;
  metadata?: unknown;
  email?: string; // If provided, attempt to send an email as well
}

export async function sendNotification({
  userId,
  type,
  title,
  message,
  metadata,
  email,
}: SendNotificationOptions) {
  try {
    await connectMongoose();

    // 1. Create In-App Notification
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      metadata,
    });

    // 2. Send Email if requested and configured
    if (email && resend) {
      await resend.emails.send({
        from: "VitaMend <notifications@vitamend.org>", // Update with verified domain if deploying
        to: email,
        subject: title,
        html: `
          <div style="font-family: 'Inter', sans-serif; background-color: #F5F2EC; padding: 40px; color: #3E492B;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #ddd8cf;">
              <h1 style="font-family: 'Cormorant Garamond', serif; color: #3E492B; margin-bottom: 20px;">${title}</h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
                ${message}
              </p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd8cf; font-size: 12px; color: #a0aec0;">
                <p>VitaMend — Redefining the lifecycle of care.</p>
              </div>
            </div>
          </div>
        `,
      });
    }

    return notification;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return null;
  }
}

/**
 * Convenience method to notify all reviewers (admins and volunteers)
 */
export async function notifyReviewers(medicineId: string, medicineName: string) {
  try {
    await connectMongoose();
    
    // Find all users with admin or volunteer roles
    const UserModel = User as unknown as { find: (query: unknown) => Promise<{ _id: { toString: () => string } }[]> };
    const reviewers = await UserModel.find({ role: { $in: ["admin", "volunteer"] } });
    
    const notifications = reviewers.map((reviewer) => ({
      userId: reviewer._id.toString(),
      type: "review_needed",
      title: "Action Required: Medicine Review",
      message: `A new donation of "${medicineName}" has been flagged by AI and requires manual review.`,
      metadata: { medicineId },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error("Failed to notify reviewers:", error);
  }
}
