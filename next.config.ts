import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ae01.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "ae04.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "*.aliexpress.com",
      },
      {
        protocol: "https",
        hostname: "s.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "img.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  headers: async () => [
    {
      source: "/OneSignalSDKWorker.js",
      headers: [
        {
          key: "Service-Worker-Allowed",
          value: "/",
        },
      ],
    },
  ],
};

export default nextConfig;
