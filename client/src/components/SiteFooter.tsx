import { Instagram, Youtube } from "lucide-react";
import FontSizePicker from "./FontSizePicker";
import IconLogo from "./IconLogo";

/* 네이버 블로그/카페 계열의 'N' 아이콘 */
function NaverIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M5 4h4.6l5.4 8.2V4H19v16h-4.6L9 11.8V20H5z" />
    </svg>
  );
}

/* 디자인(ys) 푸터. 홈과 세부 페이지에서 같이 씁니다. */
export default function SiteFooter() {
  return (
    <>
    <footer className="py-16 bg-brand-cream border-t border-brand-gold/20">
      <div className="max-w-[var(--content-max)] mx-auto px-6 text-center">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-1.5" id="logo-footer">
            <div className="md:hidden block">
              <IconLogo size={33} />
            </div>
            <div className="hidden md:block">
              <IconLogo size={30} />
            </div>
            <span className="font-serif text-2xl md:text-3xl-compact font-semibold tracking-tight text-brand-brown leading-none mt-[0.1875rem]">영신교회</span>
          </div>
          <p className="text-sm md:text-sm text-brand-gold font-medium tracking-wider">하나님을 기쁘시게 사람을 행복하게</p>
        </div>
        <p className="text-base md:text-lg text-brand-brown/50 mb-8 max-w-xl mx-auto leading-relaxed">
          영신교회는 하나님을 향한 바른 예배와<br className="md:hidden" /> 이웃을 향한 사랑의 실천을<br className="hidden md:inline" /> 추구하는<br className="md:hidden" /> 믿음의 공동체입니다.
        </p>
        <div className="flex justify-center gap-6 mb-12">
          {[
              { name: "Instagram", href: "https://instagram.com/youngshin_church", icon: <Instagram className="w-[1.5125rem] h-[1.5125rem] md:w-[1.375rem] md:h-[1.375rem]" /> },
              { name: "YouTube", href: "https://www.youtube.com/@youngshin-church", icon: <Youtube className="w-[1.5125rem] h-[1.5125rem] md:w-[1.375rem] md:h-[1.375rem]" /> },
              { name: "네이버 카페", href: "https://cafe.naver.com/youngshinchurch", icon: <NaverIcon className="w-[1.5125rem] h-[1.5125rem] md:w-[1.375rem] md:h-[1.375rem]" /> },
            ].map(s => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[3.025rem] h-[3.025rem] md:w-11 md:h-11 flex items-center justify-center rounded-full bg-brand-gold/10 text-brand-brown/60 hover:bg-brand-sage hover:text-brand-cream transition-all duration-300 shadow-sm"
              aria-label={s.name}
            >
              {s.icon}
            </a>
          ))}
        </div>
        <div className="text-xs md:text-2xs uppercase tracking-tighter text-brand-brown/30">
          © 2026 YOUNGSHIN CHURCH. ALL RIGHTS RESERVED.
        </div>
        <div className="mt-6 flex justify-center">
          <FontSizePicker />
        </div>
      </div>
    </footer>
    </>
  );
}
