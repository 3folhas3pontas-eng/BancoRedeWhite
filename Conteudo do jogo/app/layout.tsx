import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";

import "./globals.css";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Pixel Dig Legends",
  description:
    "An addictive infinite procedural 2D mining game with progression, enchantments, and vibrant pixel art aesthetics.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceMono.variable} font-mono antialiased`}
        style={{
          margin: 0,
          padding: 0,
          overflow: "hidden",
          background: "#0a0a0f",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        {children}
      </body>
    </html>
  );
}
