import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YuniExpress - Compras Internacionais em Meticais",
  description:
    "O seu marketplace internacional favorito em Mocambique. Compre produtos do mundo inteiro pagando em Meticais.",
  manifest: "/manifest.json",
  keywords: [
    "compras online",
    "marketplace",
    "mocambique",
    "meticais",
    "importacao",
    "yuniexpress",
  ],
  openGraph: {
    title: "YuniExpress",
    description: "Compras Internacionais em Meticais",
    type: "website",
    locale: "pt_MZ",
  },
};

export const viewport: Viewport = {
  themeColor: "#EAB308",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-MZ">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
