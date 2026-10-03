import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import { isAllowedMutation } from "@/lib/request-security";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(req) {
  const { nextUrl } = req;
  const session = req.auth;

  const isApi = nextUrl.pathname.startsWith("/api/");
  const response = isApi && !isAllowedMutation(req)
    ? NextResponse.json({ success: false, message: "Same-origin request required" }, { status: 403 })
    : isApi && req.method === "OPTIONS"
      ? new NextResponse(null, { status: 204 })
      : NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(self)");

  // APIs are same-origin: do not advertise credentialed cross-origin access.
  if (isApi) return response;

  // Route protection
  const protectedRoutes = [
    "/dashboard",
    "/admin",
    "/inventory",
    "/settings",
    "/profile",
    "/platform",
    "/notifications",
    "/verification",
  ];
  const matchesRoute = (route: string) => nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`);
  const isProtected = protectedRoutes.some(matchesRoute);
  const isAdmin = matchesRoute("/admin");

  if (isProtected && !session?.user?.id) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callbackUrl}`, req.url));
  }

  if (isAdmin && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return response;
});

export const config = {
  matcher: ["/api/:path*", "/((?!api/|_next/|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|map|woff|woff2|ttf|pdf|webmanifest)$).*)"],
};
