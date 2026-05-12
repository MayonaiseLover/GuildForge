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
  title: {
    default: "GuildForge — AI-Powered Discord Server Architect",
    template: "%s | GuildForge"
  },
  description: "Describe your Discord server. Get it built in 60 seconds. AI-powered categories, channels, roles, permissions, AutoMod, embeds, webhooks, and bot recommendations.",
  keywords: ["Discord", "server builder", "AI", "MCP", "community", "automation", "roles", "channels"],
  authors: [{ name: "GuildForge" }],
  openGraph: {
    title: "GuildForge — AI-Powered Discord Server Architect",
    description: "Describe your Discord server. Get it built in 60 seconds.",
    type: "website",
    siteName: "GuildForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "GuildForge — AI-Powered Discord Server Architect",
    description: "Describe your Discord server. Get it built in 60 seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
