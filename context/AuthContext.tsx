"use client";

import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<unknown>;
  signUp: (email: string, password: string, name: string, role?: string) => Promise<unknown>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession() || {};
  const loading = status === "loading";

  const user = useMemo<AuthUser | null>(() => {
    if (session?.user) {
      return {
        id: session.user.id || "",
        email: session.user.email || "",
        name: session.user.name || "",
        role: session.user.role || "user",
      };
    }
    return null;
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await nextAuthSignIn("credentials", { redirect: false, email, password });
    if (result?.error) {
      throw new Error(result.error);
    }
    return result;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name: string, role = "user") => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Registration failed");
      return signIn(email, password);
    },
    [signIn]
  );

  const handleSignOut = useCallback(() => {
    nextAuthSignOut({ callbackUrl: "/" });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error: null, signIn, signUp, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const { data: session, status } = useSession() || {};
  const context = useContext(AuthContext);

  if (context) return context;

  return {
    user: session?.user
      ? {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.name || "",
          role: session.user.role || "user",
        }
      : null,
    loading: status === "loading",
    error: null,
    signIn: async (email: string, password: string) =>
      nextAuthSignIn("credentials", { redirect: false, email, password }),
    signUp: async () => {
      throw new Error("Use /auth/signup page for registration");
    },
    signOut: () => nextAuthSignOut({ callbackUrl: "/" }),
  };
}
