import mongoose, { Document, Schema, Model } from "mongoose";

export const InventoryStatus = ["available", "reserved", "expired", "distributed"] as const;

export interface IInventory extends Document {
  medicineId: string;
  name: string;
  genericName?: string;
  category?: string;
  quantity: number;
  batchNumber?: string;
  expiryDate: Date;
  manufacturer?: string;
  location: string;
  status: (typeof InventoryStatus)[number];
  donationId: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    medicineId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    genericName: { type: String },
    category: { type: String, default: "General", index: true },
    quantity: { type: Number, required: true },
    batchNumber: { type: String },
    expiryDate: { type: Date, required: true, index: true },
    manufacturer: { type: String },
    location: { type: String, default: "Main Warehouse", index: true },
    status: { type: String, enum: InventoryStatus, default: "available", index: true },
    donationId: { type: String, required: true },
  },
  { timestamps: true }
);

InventorySchema.index({ status: 1, location: 1, expiryDate: 1 });

export const Inventory =
  (mongoose.models.Inventory as Model<IInventory>) ||
  mongoose.model<IInventory>("Inventory", InventorySchema);
export default Inventory;
