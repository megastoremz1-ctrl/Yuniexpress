"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
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
