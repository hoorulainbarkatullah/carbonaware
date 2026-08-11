import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarbonAware | Track Your Carbon. Change Your Future.",
  description: "CarbonAware is an AI-powered sustainability platform helping users measure emissions, receive smart reduction recommendations, complete challenges, and contribute to a net-zero future.",
  keywords: ["sustainability", "carbon tracking", "carbon aware", "AI recommendations", "eco-friendly rewards", "climate action"],
  openGraph: {
    title: "CarbonAware | AI-Powered Sustainability Platform",
    description: "Track your carbon footprint, get AI recommendations, and make a real difference.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
