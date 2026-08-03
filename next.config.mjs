/** @type {import('next').NextConfig} */
// Force restart to clear mongoose model cache
const nextConfig = {
  reactStrictMode: true,
  
  webpack: (config, { isServer, nextRuntime }) => {
    // Silence jose Edge Runtime warnings — these APIs aren't actually used at build time
    config.ignoreWarnings = [
      {
        module: /node_modules[\\/]jose[\\/]/,
        message: /CompressionStream|DecompressionStream/,
      },
      {
        module: /node_modules[\\/]@auth[\\/]core[\\/]/,
        message: /CompressionStream|DecompressionStream/,
      },
    ];
    return config;
  },

  // Production build settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "vitamend.com" },
      { protocol: "https", hostname: "vitamend.in" },
      { protocol: "https", hostname: "vercel-storage.com" },
      { protocol: "https", hostname: "blob.vercel-storage.com" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" }, // Added Firebase Storage domain
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Standalone output for proper serverless bundling
  output: "standalone",

  // External packages for Node.js runtime
  serverExternalPackages: ["mongoose", "bcryptjs"], // mongoose and bcryptjs must be external for standalone output

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin" },
          { key: "Permissions-Policy", value: "camera=(self)" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        source: "/:all((?!api).*)\\.(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/auth/signin",
        permanent: true,
      },
      {
        source: "/register",
        destination: "/auth/signup",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
