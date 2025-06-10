export const metadata = {
  title: "首頁 | Planbar",
  description: "Planbar 課程排程系統，快速管理學生、教練與課程。",
  openGraph: {
    title: "首頁 | Planbar",
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

// 導航列已改為 /calendar，請將原本 HomePage 元件內容移至 /calendar/page.tsx，這裡僅做 redirect
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/calendar");
  return null;
}
