import { z } from "zod";

export const MAX_PACKAGING_BYTES = 512 * 1024;
export const MAX_DONATION_BODY_BYTES = 4 * 1024 * 1024;
export const packagingImageSchema = z.object({
  data: z.string().min(4).max(Math.ceil(MAX_PACKAGING_BYTES / 3) * 4)
    .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)
    .refine((data) => Buffer.byteLength(data, "base64") <= MAX_PACKAGING_BYTES, "Image is too large"),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
}).refine(({ data, mimeType }) => {
  const bytes = Buffer.from(data, "base64");
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
}, "Image content does not match its type");

// Month-only labels retain their precision; the end of that month is the expiry boundary.
export function parseDonationExpiry(value: string): Date | null {
  const month = /^(0[1-9]|1[0-2])\/(\d{4})$/.exec(value);
  if (month) {
    const year = Number(month[2]);
    if (year < 1900 || year > 9999) return null;
    return new Date(Date.UTC(year, Number(month[1]), 1) - 1);
  }
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10) ? date : null;
}

export const donationSchema = z.object({
  medicineName: z.string().trim().min(1).max(200),
  genericName: z.string().max(200).optional(),
  brand: z.string().max(200).optional(),
  dosage: z.string().max(100).optional(),
  batchNumber: z.string().max(50).optional(),
  manufacturer: z.string().max(200).optional(),
  quantity: z.coerce.number().int().min(1).max(1000),
  expiryDate: z.string().refine((value) => parseDonationExpiry(value) !== null, "Enter a valid MM/YYYY or ISO expiry date"),
  category: z.string().max(100).optional(),
  condition: z.enum(["Unopened/Sealed", "Opened but unused", "Partially used"]).optional(),
  notes: z.string().max(2000).optional(),
  donorName: z.string().max(200).optional(),
  donorEmail: z.string().email().max(254).optional(),
  donorPhone: z.string().max(50).optional(),
  donorAddress: z.string().max(1000).optional(),
  // Remote URLs are not packaging evidence and must not be silently discarded.
  images: z.array(z.string()).max(0).optional(),
  base64Images: z.array(packagingImageSchema).max(5).optional(),
});
