import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Keep the repository-owned AGENTS.md as the single governance source.
  agentRules: false,

  // Disable X-Powered-By header for production security hardening
  poweredByHeader: false,

  // Cloudflare sirve las imágenes tal cual (logos ya optimizados), sin servicio de imágenes de pago
  images: { unoptimized: true },

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

// Permite usar los servicios de Cloudflare también con "next dev"
initOpenNextCloudflareForDev();
