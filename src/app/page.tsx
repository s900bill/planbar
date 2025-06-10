// 導航列已改為 /calendar，請將原本 HomePage 元件內容移至 /calendar/page.tsx，這裡僅做 redirect
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/calendar");
  return null;
}
