/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Safe baseline headers. No Content-Security-Policy on purpose: a strict one would block Google AdSense.
  // The Daily Ops Puzzle was removed. Send old links to the tools index.
  async redirects() {
    return [
      { source: "/tools/daily-puzzle", destination: "/tools", permanent: true },
      { source: "/tools/ops-runner", destination: "/tools/ops-cup", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
        ],
      },
    ];
  },
  // The bot searches the published articles at runtime, so make sure every article ships with its function.
  outputFileTracingIncludes: {
    "/api/bot": ["./content/posts/**/*"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
