import { useState } from "react";
import PublicHeader from "./PublicHeader";
import FloatingHelp from "./FloatingHelp";
import PrayerRequestModal from "./PrayerRequestModal";
import SiteFooter from "./SiteFooter";

export default function PublicPageLayout({
  children,
  variant = "shell",
}: {
  children: React.ReactNode;
  /** shell: 소개·게시판 공통 글자 크기. copy: 디자인에 적힌 글자 크기를 그대로 쓰는 페이지 */
  variant?: "shell" | "copy";
}) {
  const [isPrayerOpen, setIsPrayerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <PublicHeader />
      <FloatingHelp onPrayerRequest={() => setIsPrayerOpen(true)} />
      <PrayerRequestModal open={isPrayerOpen} onClose={() => setIsPrayerOpen(false)} />
      <main className={`flex-1 subpage-layout ${variant === "copy" ? "subpage-copy-standard" : "subpage-shell"}`}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
