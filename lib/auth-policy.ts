export type UserRole = "user" | "donor" | "recipient" | "ngo" | "volunteer" | "admin";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeUserRole(role: unknown): UserRole {
  const roles: Record<string, UserRole> = {
    "Donate Medicines": "donor", "Receive Medicines": "recipient", Volunteer: "volunteer",
    user: "user", donor: "donor", recipient: "recipient", ngo: "ngo", volunteer: "volunteer", admin: "admin",
  };
  return typeof role === "string" && Object.hasOwn(roles, role) ? roles[role] : "user";
}

// Return a local path, never a protocol-relative URL or a different origin.
export function safeCallbackUrl(value: string | null | undefined, baseUrl: string): string {
  if (!value || /[\\\u0000-\u0020\u007f]/.test(value) || value.startsWith("//")) return "/dashboard";
  try {
    const base = new URL(baseUrl);
    const target = new URL(value, base);
    if (target.origin !== base.origin || target.username || target.password) return "/dashboard";
    return target.pathname + target.search + target.hash;
  } catch {
    return "/dashboard";
  }
}
