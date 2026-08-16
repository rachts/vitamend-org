import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const allowedOrigins = [
  "https://vitamend.in",
  "http://localhost:3000",
  ...(process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o.length > 0),
];

export default auth(function middleware(req) {
  const { nextUrl } = req;
  const session = req.auth;

  const origin = req.headers.get("origin") ?? "";
  const isAllowed = allowedOrigins.includes(origin) || origin === `https://${process.env.VERCEL_URL || ""}`;
  const allowOrigin = isAllowed ? origin : allowedOrigins[0] ?? "https://vitamend.in";

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self)");

  // CORS
  const isApi = nextUrl.pathname.startsWith("/api");
  if (isApi) {
    response.headers.set("Access-Control-Allow-Origin", allowOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // OPTIONS preflight
  if (isApi && req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // Route protection
  const isDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isAdmin = nextUrl.pathname.startsWith("/admin");

  if ((isDashboard || isAdmin) && !session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  if (isAdmin && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
