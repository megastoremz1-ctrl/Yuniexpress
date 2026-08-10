import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // =========================================================
      // CLOUDFLARE R2 / YUNIEXPRESS
      // =========================================================
      {
        protocol: "https",
        hostname: "assets.yuniexpress.shop",
      },

      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },

      // =========================================================
      // ALIEXPRESS
      // =========================================================
      {
        protocol: "https",
        hostname: "**.aliexpress-media.com",
      },

      {
        protocol: "https",
        hostname: "**.alicdn.com",
      },

      {
        protocol: "https",
        hostname: "**.aliexpress.com",
      },

      // =========================================================
      // GOOGLE
      // =========================================================
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // =========================================================
  // PERFORMANCE
  // =========================================================

  compress: true,

  poweredByHeader: false,

  reactStrictMode: false,

  // =========================================================
  // HEADERS
  // =========================================================

  headers: async () => [
    {
      source: "/sw.js",

      headers: [
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
        {
          key: "Cache-Control",
          value: "no-cache",
        },
      ],
    },

    {
      source: "/OneSignalSDKWorker.js",

      headers: [
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },

    // =======================================================
    // CACHE DOS ÍCONES
    // =======================================================

    {
      source: "/icons/:path*",

      headers: [
        {
          key: "Cache-Control",
          value:
            "public, max-age=31536000, immutable",
        },
      ],
    },

    // =======================================================
    // CACHE DE IMAGENS PNG
    // =======================================================

    {
      source: "/:path*.png",

      headers: [
        {
          key: "Cache-Control",
          value:
            "public, max-age=86400",
        },
      ],
    },
  ],
};

export default nextConfig;