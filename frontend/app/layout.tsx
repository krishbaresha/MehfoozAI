import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MehfoozAI — Her Awaz Suni Jaayegi | Pakistan's First AI Harassment Reporting Platform",
  description: "Pakistan's first anonymous, AI-powered harassment reporting platform. Report harassment safely, securely, and stay protected with MehfoozAI.",
  keywords: ["harassment reporting", "Pakistan", "anonymous reporting", "women safety", "AI", "FIR", "MehfoozAI", "report harassment Pakistan", "safe workplace", "cybercrime reporting"],
  authors: [{ name: "MehfoozAI Team" }],
  openGraph: {
    title: "MehfoozAI — Her Awaz Suni Jaayegi",
    description: "Pakistan's first anonymous, AI-powered harassment reporting platform. Report safely. Stay protected.",
    siteName: "MehfoozAI",
    images: [
      {
        url: "/favicon.ico", // Ensure to replace with actual OG image path when available
        width: 800,
        height: 600,
        alt: "MehfoozAI Logo",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MehfoozAI — Her Awaz Suni Jaayegi",
    description: "Pakistan's first anonymous, AI-powered harassment reporting platform. Report safely. Stay protected.",
    images: ["/favicon.ico"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🛡️</text></svg>" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="ab9a2ffe-5bf6-434e-a3b5-3252ef6b6155"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
