import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectMongoose from "@/lib/db";
import { User } from "@/models/User";
import { authConfig } from "@/auth.config";
import { normalizeEmail, normalizeUserRole } from "@/lib/auth-policy";
import { checkRateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") return null;
        const email = normalizeEmail(credentials.email);
        if (!email || email.length > 254 || !credentials.password || credentials.password.length > 128) return null;
        if (!(await checkRateLimit(request, 5)).allowed) return null;
        await connectMongoose();
        const user = await User.findOne({ email }).select("+password");
        if (!user) return null;
        const isValid = await user.matchPassword(credentials.password);
        if (!isValid) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: normalizeUserRole(user.role),
        };
      },
    }),
  ],
});
