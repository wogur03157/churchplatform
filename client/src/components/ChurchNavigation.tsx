import { Link, useLocation } from "wouter";

const TABS = [
  { label: "교회 소개", href: "/church/about" },
  { label: "예배 안내", href: "/church/worship" },
  { label: "오시는 길", href: "/church/directions" },
];

export default function ChurchNavigation() {
  const [location] = useLocation();

  return (
    <nav className="border-b border-brand-gold/20 bg-white">
      <div className="container flex gap-2 overflow-x-auto py-3">
        {TABS.map((tab) => {
          const active = location === tab.href;
          return (
            <Link key={tab.href} href={tab.href}>
              <a
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-brown text-brand-cream"
                    : "text-brand-brown/70 hover:bg-brand-cream/60"
                }`}
              >
                {tab.label}
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
