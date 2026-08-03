import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://vitamend.in";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/donate", "/store", "/transparency", "/volunteer", "/founders", "/demo", "/legal/privacy", "/legal/terms"],
      disallow: ["/dashboard", "/admin", "/inventory", "/verification", "/settings", "/profile", "/platform", "/notifications", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
