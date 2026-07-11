import PublicPageLayout from "@/components/PublicPageLayout";

const WORSHIP_SCHEDULE = [
  {
    category: "주일예배",
    rows: [
      { name: "1부 예배",    time: "오전 09:00", location: "본당",     note: "전 연령" },
      { name: "2부 예배",    time: "오전 11:00", location: "본당",     note: "전 연령" },
      { name: "유·아동부",   time: "오전 11:00", location: "교육관 1층", note: "0세~초등" },
      { name: "청소년부",    time: "오전 11:00", location: "교육관 2층", note: "중·고등학생" },
      { name: "청년부",      time: "오후 02:00", location: "본당",     note: "20~30대" },
    ],
  },
  {
    category: "주중예배",
    rows: [
      { name: "새벽기도회",  time: "매일 05:30", location: "본당",   note: "" },
      { name: "수요예배",    time: "수요일 19:30", location: "본당", note: "" },
      { name: "금요기도회",  time: "금요일 19:30", location: "본당", note: "" },
    ],
  },
  {
    category: "소그룹",
    rows: [
      { name: "구역예배",  time: "주중 (구역별)", location: "각 구역",  note: "목자에게 문의" },
      { name: "성경공부",  time: "화요일 10:00",  location: "교육관",  note: "사전 등록" },
    ],
  },
];

export default function ChurchWorship() {
  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">예배 안내</h1>
        <p className="text-muted-foreground text-lg mb-12">영신교회의 예배 시간을 안내해 드립니다</p>

        <div className="space-y-10">
          {WORSHIP_SCHEDULE.map((group) => (
            <section key={group.category}>
              <h2 className="text-xl font-semibold mb-4 text-primary">{group.category}</h2>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">예배명</th>
                      <th className="text-left px-4 py-3 font-medium">시간</th>
                      <th className="text-left px-4 py-3 font-medium">장소</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">비고</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {group.rows.map((row) => (
                      <tr key={row.name} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.location}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-sm text-muted-foreground">
            📍 예배 시간 및 장소는 교회 사정에 따라 변경될 수 있습니다. 최신 정보는 공지사항을 확인하세요.
          </p>
        </div>
      </div>
    </PublicPageLayout>
  );
}
