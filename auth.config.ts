import type { NextAuthConfig } from "next-auth";
import { normalizeUserRole, safeCallbackUrl } from "@/lib/auth-policy";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = typeof user.id === "string" ? user.id : undefined;
        token.role = normalizeUserRole(user.role);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = normalizeUserRole(token.role);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return new URL(safeCallbackUrl(url, baseUrl), baseUrl).toString();
    },
  },
  providers: [],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
