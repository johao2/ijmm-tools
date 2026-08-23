import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the repository-owned AGENTS.md as the single governance source.
  agentRules: false,

  // Disable X-Powered-By header for production security hardening
  poweredByHeader: false,

  // Security Headers for Production Deployment
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
