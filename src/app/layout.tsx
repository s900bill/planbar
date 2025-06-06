"use client";

import React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Head from "next/head";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <html lang="zh-TW" className="bg-black">
      <Head>
        <title>Planbar 行事曆</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body
        className={`${inter.variable} antialiased bg-black`}
      >
        {/* 導航列統一樣式 */}
        <nav className="fixed top-0 left-0 w-full flex gap-4 px-8 py-4 bg-black border-b border-gray-800 z-40 text-gray-300 text-base">
          <Link
            href="/"
            className={
              pathname === "/"
                ? "font-bold text-blue-400"
                : "hover:text-blue-400 transition"
            }
          >
            行事曆
          </Link>
          <Link
            href="/coaches"
            className={
              pathname.startsWith("/coaches")
                ? "font-bold text-blue-400"
                : "hover:text-blue-400 transition"
            }
          >
            教練管理
          </Link>
          <Link
            href="/students"
            className={
              pathname.startsWith("/students")
                ? "font-bold text-blue-400"
                : "hover:text-blue-400 transition"
            }
          >
            學生管理
          </Link>
        </nav>
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
