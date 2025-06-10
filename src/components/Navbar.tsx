"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  return (
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
  );
}
