import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "MehfoozAI — Her Awaz Suni Jaayegi",
  description: "Pakistan's first anonymous, AI-powered harassment reporting platform. Report safely. Stay protected.",
  keywords: ["harassment reporting", "Pakistan", "anonymous", "women safety", "AI", "FIR"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className="antialiased">
        {children}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="ab9a2ffe-5bf6-434e-a3b5-3252ef6b6155"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
