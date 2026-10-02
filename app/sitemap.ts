import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://vitamend.in";
  const now = new Date();

  return [
    { url: `${baseUrl}`, lastModified: now, priority: 1.0 },
    { url: `${baseUrl}/donate`, lastModified: now, priority: 0.9 },
    { url: `${baseUrl}/store`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/clinics`, lastModified: now, priority: 0.8 },
    { url: `${baseUrl}/volunteer`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/transparency`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/donor-guide`, lastModified: now, priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, priority: 0.6 },
    { url: `${baseUrl}/demo`, lastModified: now, priority: 0.6 },
    { url: `${baseUrl}/founders`, lastModified: now, priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: now, priority: 0.5 },
    { url: `${baseUrl}/terms-of-service`, lastModified: now, priority: 0.5 },
    { url: `${baseUrl}/ai-disclosure`, lastModified: now, priority: 0.5 },
    { url: `${baseUrl}/legal/privacy`, lastModified: now, priority: 0.4 },
    { url: `${baseUrl}/legal/terms`, lastModified: now, priority: 0.4 },
    { url: `${baseUrl}/preflight`, lastModified: now, priority: 0.3 },
    { url: `${baseUrl}/offline`, lastModified: now, priority: 0.2 },
  ];
}
