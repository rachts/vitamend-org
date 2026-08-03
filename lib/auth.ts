import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectMongoose from "@/lib/db";
import { User } from "@/models/User";

function normalizeUserRole(role: string): string {
  const roleMap: Record<string, string> = {
    "Donate Medicines": "donor",
    donor: "donor",
    "Receive Medicines": "recipient",
    recipient: "recipient",
    Volunteer: "volunteer",
    volunteer: "volunteer",
    admin: "admin",
  };
  return roleMap[role] ?? "donor";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectMongoose();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await (User as any).findOne({ email: credentials.email }).select("+password");
        if (!user) return null;
        const isValid = await user.matchPassword(credentials.password as string);
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
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "donor";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
