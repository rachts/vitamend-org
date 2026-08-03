import mongoose, { Document, Schema, Model } from "mongoose";

export const NotificationType = ["donation_update", "review_needed", "inventory_alert", "distribution_update", "system"] as const;

export interface INotification extends Document {
  userId: string;
  type: typeof NotificationType[number];
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: NotificationType, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = (mongoose.models.Notification as Model<INotification>) || mongoose.model<INotification>("Notification", NotificationSchema);
