import PublicHeader from "./PublicHeader";
import QuickActionFab from "./QuickActionFab";
import FontSizePicker from "./FontSizePicker";

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <PublicHeader />
      <QuickActionFab />
      <main className="flex-1 pt-16">{children}</main>
      <footer className="py-12 bg-brand-brown text-brand-cream">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div>
              <h3 className="font-serif font-bold mb-2 text-brand-cream">영신교회</h3>
              <p className="text-sm text-brand-cream/55">서울특별시 양천구 목동로 19길 28</p>
            </div>
            <div>
              <h3 className="font-serif font-bold mb-2 text-brand-cream">예배 안내</h3>
              <p className="text-sm text-brand-cream/55">주일 1부 09:00 · 2부 11:00</p>
              <p className="text-sm text-brand-cream/55">수요예배 19:30 · 금요기도회 19:30</p>
            </div>
            <div>
              <h3 className="font-serif font-bold mb-2 text-brand-cream">연락처</h3>
              <p className="text-sm text-brand-cream/55">대표: 02-000-0000</p>
            </div>
          </div>
          <div className="border-t border-brand-cream/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-brand-cream/40">
            <div className="hidden sm:block">
              <FontSizePicker dark />
            </div>
            <p>© 2026 영신교회. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
