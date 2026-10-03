export class StockError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function assertDistributionTransition(from: string, to: string) {
  const transitions: Record<string, string[]> = {
    pending: ["in_transit", "cancelled"],
    in_transit: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };
  if (!transitions[from]?.includes(to)) throw new StockError("Illegal or repeated distribution transition", 409);
}

export function validateApproval(medicine: Record<string, unknown>, now = Date.now()) {
  for (const field of ["name", "dosage", "batchNumber", "manufacturer"]) {
    if (typeof medicine[field] !== "string" || !(medicine[field] as string).trim()) {
      throw new StockError(`${field} is required before approval`);
    }
  }
  if (!Number.isInteger(medicine.quantity) || Number(medicine.quantity) < 1 || Number(medicine.quantity) > 100000) {
    throw new StockError("A valid quantity is required before approval");
  }
  if (!isUnexpiredDate(medicine.expiryDate, now)) throw new StockError("A valid, unexpired expiry date is required before approval");
}

export function isUnexpiredDate(value: unknown, now = Date.now()) {
  if (value instanceof Date) return Number.isFinite(value.getTime()) && value.getTime() > now;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) return false;
  const timestamp = Date.parse(value);
  // Date.parse normalizes impossible calendar dates (e.g. February 30); reject that.
  return Number.isFinite(timestamp) && timestamp > now && new Date(timestamp).toISOString().slice(0, 10) === value.slice(0, 10);
}
