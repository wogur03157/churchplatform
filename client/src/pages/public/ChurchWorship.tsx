import PublicPageLayout from "@/components/PublicPageLayout";
import ChurchNavigation from "@/components/ChurchNavigation";

const WORSHIP_SCHEDULE = [
  {
    category: "주일예배",
    rows: [
      { name: "1부 예배",    time: "오전 09:00", location: "본당",      note: "전 연령" },
      { name: "2부 예배",    time: "오전 11:00", location: "본당",      note: "전 연령" },
      { name: "유·아동부",   time: "오전 11:00", location: "교육관 1층", note: "0세~초등" },
      { name: "청소년부",    time: "오전 11:00", location: "교육관 2층", note: "중·고등학생" },
      { name: "청년부",      time: "오후 02:00", location: "본당",      note: "20~30대" },
    ],
  },
  {
    category: "주중예배",
    rows: [
      { name: "새벽기도회", time: "매일 05:30",   location: "본당", note: "" },
      { name: "수요예배",   time: "수요일 19:30", location: "본당", note: "" },
      { name: "금요기도회", time: "금요일 19:30", location: "본당", note: "" },
    ],
  },
  {
    category: "소그룹",
    rows: [
      { name: "구역예배", time: "주중 (구역별)",  location: "각 구역", note: "목자에게 문의" },
      { name: "성경공부", time: "화요일 10:00",   location: "교육관", note: "사전 등록" },
    ],
  },
];

export default function ChurchWorship() {
  return (
    <PublicPageLayout>
      <ChurchNavigation />
      {/* Page header */}
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">WORSHIP</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">예배 안내</h1>
          <p className="text-brand-brown/60 text-lg">영신교회의 예배 시간을 안내해 드립니다</p>
        </div>
      </div>

      <div className="container py-14 max-w-4xl">
        <div className="space-y-10">
          {WORSHIP_SCHEDULE.map((group) => (
            <section key={group.category}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-brand-sage rounded-full" />
                <h2 className="font-serif text-xl font-bold text-brand-brown">{group.category}</h2>
              </div>
              <div className="rounded-2xl overflow-hidden border border-brand-gold/20 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-brand-cream/60">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-brand-brown/80">예배명</th>
                      <th className="text-left px-4 py-3 font-semibold text-brand-brown/80">시간</th>
                      <th className="text-left px-4 py-3 font-semibold text-brand-brown/80">장소</th>
                      <th className="text-left px-4 py-3 font-semibold text-brand-brown/50">비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-gold/10">
                    {group.rows.map((row) => (
                      <tr key={row.name} className="hover:bg-brand-cream/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-brand-brown">{row.name}</td>
                        <td className="px-4 py-3 text-brand-brown/65">{row.time}</td>
                        <td className="px-4 py-3 text-brand-brown/65">{row.location}</td>
                        <td className="px-4 py-3 text-brand-brown/45 text-xs">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 p-5 bg-brand-cream/50 border border-brand-gold/30 rounded-2xl">
          <p className="text-sm text-brand-brown/60">
            📍 예배 시간 및 장소는 교회 사정에 따라 변경될 수 있습니다. 최신 정보는 공지사항을 확인하세요.
          </p>
        </div>
      </div>
    </PublicPageLayout>
  );
}
