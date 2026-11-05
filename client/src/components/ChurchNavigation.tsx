import { useLocation } from "wouter";

/* 디자인(ys) 교회 소개 하위 탭. 같은 자리에서 페이지 주소로 이동합니다. */
const pages = [
  { href: "/church/about", hash: "영신교회", label: "영신교회" },
  { href: "/church/worship", hash: "예배안내", label: "예배안내" },
  { href: "/church/directions", hash: "오시는길", label: "오시는 길" },
];

export default function ChurchNavigation({ activePage }: { activePage: string }) {
  const [, navigate] = useLocation();

  return (
    <div className="flex gap-1 md:gap-2 w-full overflow-x-auto">
      {pages.map((page) => (
        <button
          key={page.hash}
          onClick={() => navigate(page.href)}
          className={activePage===page.hash? "flex-1 md:w-full text-center py-3 md:py-2.5 px-4 rounded-xl text-[0.8625rem] md:text-[0.8625rem] sm:text-sm font-semibold md:font-medium transition-all cursor-pointer whitespace-nowrap bg-brand-sage text-white shadow-md shadow-brand-sage/20 border border-brand-sage":"flex-1 md:w-full text-center py-3 md:py-2.5 px-4 rounded-xl text-[0.8625rem] md:text-[0.8625rem] sm:text-sm font-semibold md:font-medium transition-all cursor-pointer whitespace-nowrap text-brand-brown bg-brand-sage/10 border border-brand-sage/15 hover:text-brand-sage hover:bg-brand-sage/20 hover:border-brand-sage"}
        >
          {page.label}
        </button>
      ))}
    </div>
  );
}
