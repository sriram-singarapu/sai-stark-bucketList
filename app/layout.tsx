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
  title: "🌟 Sai Stark's Ultimate Bucket List | 78 Life Experiences",
  description:
    "Explore Sai Stark's Ultimate Life Experiences Bucket List: 78 extreme adventures, high-altitude expeditions, dream trips, and personal milestones.",
  icons: {
    icon: [
      { url: "/IMG-20250714-WA0063.jpg", sizes: "32x32", type: "image/jpg" },
      { url: "/IMG-20250714-WA0063.jpg", sizes: "192x192", type: "image/jpg" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#070b14] text-slate-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
