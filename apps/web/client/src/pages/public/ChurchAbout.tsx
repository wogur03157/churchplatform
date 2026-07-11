import PublicPageLayout from "@/components/PublicPageLayout";

export default function ChurchAbout() {
  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">영신교회 소개</h1>
        <p className="text-muted-foreground text-lg mb-12">하나님의 사랑으로 세워진 공동체</p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">교회 소개</h2>
            <p className="text-muted-foreground leading-relaxed">
              영신교회는 서울 양천구 목동에 위치한 교회로, 하나님의 말씀을 중심으로 성장하는 공동체입니다.
              우리 교회는 예배, 교육, 봉사, 교제를 통해 하나님의 나라를 이 땅에 세워가고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">교회 비전</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "하나님 사랑", desc: "진정한 예배와 말씀 묵상을 통해 하나님과 깊은 관계를 맺는 공동체" },
                { title: "이웃 사랑",   desc: "지역사회와 세상을 향해 그리스도의 사랑을 실천하는 공동체" },
                { title: "함께 성장",   desc: "신앙의 여정을 함께 걸어가며 서로를 세워가는 공동체" },
              ].map((v) => (
                <div key={v.title} className="p-6 border rounded-xl bg-muted/30">
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">교회 역사</h2>
            <div className="space-y-3 border-l-2 border-primary/30 pl-6">
              {[
                { year: "1990", text: "영신교회 창립" },
                { year: "2000", text: "성전 건축 및 이전" },
                { year: "2010", text: "선교 비전 선포" },
                { year: "2020", text: "온라인 사역 확장" },
                { year: "2026", text: "지역사회 섬김 강화" },
              ].map((h) => (
                <div key={h.year} className="flex gap-4">
                  <span className="font-semibold text-primary w-12 shrink-0">{h.year}</span>
                  <span className="text-muted-foreground">{h.text}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">담임목사</h2>
            <div className="flex gap-6 items-start p-6 border rounded-xl">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground shrink-0">
                목
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">담임목사</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  영신교회를 이끌며 하나님의 말씀을 선포하고 성도들을 섬기고 있습니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PublicPageLayout>
  );
}
