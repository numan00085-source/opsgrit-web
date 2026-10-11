/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The bot searches the published articles at runtime, so make sure every article ships with its function.
  outputFileTracingIncludes: {
    "/api/bot": ["./content/posts/**/*"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
