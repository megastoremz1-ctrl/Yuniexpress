"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import InstallPrompt from "@/components/layout/InstallPrompt";
import CookieConsent from "@/components/layout/CookieConsent";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Register service worker for PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered"))
        .catch(() => {});
    }
  }, []);

  return (
    <SessionProvider>
      {children}
      <InstallPrompt />
      <CookieConsent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            padding: "12px 16px",
          },
          success: {
            style: { background: "#10B981", color: "#fff" },
          },
          error: {
            style: { background: "#EF4444", color: "#fff" },
          },
        }}
      />
    </SessionProvider>
  );
}
