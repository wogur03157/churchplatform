import PublicHeader from "./PublicHeader";

export default function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-10 bg-muted/50">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <div>
              <h3 className="font-semibold mb-2">영신교회</h3>
              <p className="text-sm text-muted-foreground">서울특별시 양천구 목동로 19길 28</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">예배 안내</h3>
              <p className="text-sm text-muted-foreground">주일 1부 09:00 · 2부 11:00</p>
              <p className="text-sm text-muted-foreground">수요예배 19:30 · 금요기도회 19:30</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">연락처</h3>
              <p className="text-sm text-muted-foreground">대표: 02-000-0000</p>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-sm text-muted-foreground">
            <p>© 2026 영신교회. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
