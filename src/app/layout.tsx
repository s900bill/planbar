import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Planbar",
  description: "Planbar 課程排程系統，快速管理學生、教練與課程。",
  openGraph: {
    title: "Planbar",
    description: "Planbar 課程排程系統，快速管理學生、教練與課程。",
    url: "https://planbar-eight.vercel.app/calendar",
    siteName: "Planbar",
    images: [
      {
        url: "https://planbar-eight.vercel.app/logo.svg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="bg-black">
      <body className={`${inter.variable} antialiased bg-black`}>
        {/* 導航列統一樣式 */}
        <Navbar />
        <div className="pt-20 bg-black min-h-screen">
          <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-8">
            {children}
          </div>
        </div>
        {/* 版權聲明 */}
        <footer className="w-full text-center text-xs text-gray-500 py-4 border-t border-gray-800  bg-black">
          &copy; {new Date().getFullYear()} s900bill. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
