import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useLocation } from "wouter";

type Action = {
  label: string;
  emoji: string;
  href: string;
};

const ACTIONS: Action[] = [
  { label: "상담 신청", emoji: "💬", href: "/canaan/online-consultation" },
  { label: "새가족 안내", emoji: "🙏", href: "/community/new-member" },
  { label: "온라인 성도 등록", emoji: "✍️", href: "/canaan/online-registration" },
];

export default function QuickActionFab() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  return (
    <div className="fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3">
      {/* 펼쳐진 메뉴 */}
      {open && (
        <div className="flex flex-col items-end gap-2 animate-in slide-in-from-bottom-3 fade-in duration-200">
          {/* 설명 텍스트 */}
          <div className="bg-white border border-border rounded-2xl shadow-lg px-5 py-3.5 max-w-[220px] text-right">
            <p className="text-sm font-semibold text-foreground mb-1">온라인으로 신청하세요</p>
            <p className="text-xs text-muted-foreground leading-relaxed">아래 버튼을 눌러 상담·등록을 간편하게 신청하실 수 있습니다.</p>
          </div>

          {/* 버튼 목록 */}
          {ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => { setOpen(false); navigate(action.href); }}
              className="flex items-center gap-2.5 bg-white text-foreground text-sm font-medium px-5 py-3 rounded-full shadow-lg border border-border hover:bg-secondary transition-colors whitespace-nowrap"
            >
              <span className="text-base">{action.emoji}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* 메인 FAB 버튼 */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 bg-accent-gold text-foreground font-semibold px-6 py-3.5 rounded-full shadow-xl hover:brightness-105 transition-all duration-200"
        aria-label={open ? "닫기" : "온라인 상담 / 등록"}
      >
        {open ? (
          <>
            <X className="h-5 w-5" />
            <span className="text-sm">닫기</span>
          </>
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">온라인 상담 · 등록</span>
          </>
        )}
      </button>
    </div>
  );
}
