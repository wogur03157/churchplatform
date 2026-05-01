export const DEFAULT_PAGE_CONTENTS: Record<string, { title: string; content: string }> = {
  "church/about": {
    title: "영신교회 소개",
    content: `
      <p class="text-lg text-muted-foreground">하나님의 사랑으로 세워진 공동체</p>
      <section class="mt-10">
        <h2>교회 소개</h2>
        <p>영신교회는 서울 양천구 목동에 위치한 교회로, 하나님의 말씀을 중심으로 성장하는 공동체입니다. 우리 교회는 예배, 교육, 봉사, 교제를 통해 하나님의 나라를 이 땅에 세워가고 있습니다.</p>
      </section>
      <section class="mt-10">
        <h2>교회 비전</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border bg-muted/30 p-6">
            <h3 class="mt-0">하나님 사랑</h3>
            <p class="mb-0">진정한 예배와 말씀 묵상을 통해 하나님과 깊은 관계를 맺는 공동체</p>
          </div>
          <div class="rounded-xl border bg-muted/30 p-6">
            <h3 class="mt-0">이웃 사랑</h3>
            <p class="mb-0">지역사회와 세상을 향해 그리스도의 사랑을 실천하는 공동체</p>
          </div>
          <div class="rounded-xl border bg-muted/30 p-6">
            <h3 class="mt-0">함께 성장</h3>
            <p class="mb-0">신앙의 여정을 함께 걸어가며 서로를 세워가는 공동체</p>
          </div>
        </div>
      </section>
      <section class="mt-10">
        <h2>교회 역사</h2>
        <div class="space-y-3 border-l-2 border-primary/30 pl-6">
          <div><strong>1990</strong> 영신교회 창립</div>
          <div><strong>2000</strong> 성전 건축 및 이전</div>
          <div><strong>2010</strong> 선교 비전 선포</div>
          <div><strong>2020</strong> 온라인 사역 확장</div>
          <div><strong>2026</strong> 지역사회 섬김 강화</div>
        </div>
      </section>
      <section class="mt-10">
        <h2>담임목사</h2>
        <div class="flex items-start gap-6 rounded-xl border p-6">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">목</div>
          <div>
            <h3 class="mt-0">담임목사</h3>
            <p class="mb-0">영신교회를 이끌며 하나님의 말씀을 선포하고 성도들을 섬기고 있습니다.</p>
          </div>
        </div>
      </section>
    `,
  },
  "church/worship": {
    title: "예배 안내",
    content: `
      <p class="text-lg text-muted-foreground">영신교회의 예배 시간을 안내해 드립니다</p>
      <section class="mt-10">
        <h2>주일예배</h2>
        <div class="overflow-hidden rounded-xl border">
          <table class="w-full text-sm">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-4 py-3 text-left">예배명</th>
                <th class="px-4 py-3 text-left">시간</th>
                <th class="px-4 py-3 text-left">장소</th>
                <th class="px-4 py-3 text-left">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="px-4 py-3">1부 예배</td><td class="px-4 py-3">오전 09:00</td><td class="px-4 py-3">본당</td><td class="px-4 py-3">전 연령</td></tr>
              <tr><td class="px-4 py-3">2부 예배</td><td class="px-4 py-3">오전 11:00</td><td class="px-4 py-3">본당</td><td class="px-4 py-3">전 연령</td></tr>
              <tr><td class="px-4 py-3">유·아동부</td><td class="px-4 py-3">오전 11:00</td><td class="px-4 py-3">교육관 1층</td><td class="px-4 py-3">0세~초등</td></tr>
              <tr><td class="px-4 py-3">청소년부</td><td class="px-4 py-3">오전 11:00</td><td class="px-4 py-3">교육관 2층</td><td class="px-4 py-3">중·고등학생</td></tr>
              <tr><td class="px-4 py-3">청년부</td><td class="px-4 py-3">오후 02:00</td><td class="px-4 py-3">본당</td><td class="px-4 py-3">20~30대</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="mt-10">
        <h2>주중예배</h2>
        <div class="overflow-hidden rounded-xl border">
          <table class="w-full text-sm">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-4 py-3 text-left">예배명</th>
                <th class="px-4 py-3 text-left">시간</th>
                <th class="px-4 py-3 text-left">장소</th>
                <th class="px-4 py-3 text-left">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="px-4 py-3">새벽기도회</td><td class="px-4 py-3">매일 05:30</td><td class="px-4 py-3">본당</td><td class="px-4 py-3"></td></tr>
              <tr><td class="px-4 py-3">수요예배</td><td class="px-4 py-3">수요일 19:30</td><td class="px-4 py-3">본당</td><td class="px-4 py-3"></td></tr>
              <tr><td class="px-4 py-3">금요기도회</td><td class="px-4 py-3">금요일 19:30</td><td class="px-4 py-3">본당</td><td class="px-4 py-3"></td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="mt-10">
        <h2>소그룹</h2>
        <div class="overflow-hidden rounded-xl border">
          <table class="w-full text-sm">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-4 py-3 text-left">모임명</th>
                <th class="px-4 py-3 text-left">시간</th>
                <th class="px-4 py-3 text-left">장소</th>
                <th class="px-4 py-3 text-left">비고</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="px-4 py-3">구역예배</td><td class="px-4 py-3">주중 (구역별)</td><td class="px-4 py-3">각 구역</td><td class="px-4 py-3">목자에게 문의</td></tr>
              <tr><td class="px-4 py-3">성경공부</td><td class="px-4 py-3">화요일 10:00</td><td class="px-4 py-3">교육관</td><td class="px-4 py-3">사전 등록</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <div class="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-6 text-sm text-muted-foreground">
        예배 시간 및 장소는 교회 사정에 따라 변경될 수 있습니다. 최신 정보는 공지사항을 확인하세요.
      </div>
    `,
  },
  "church/directions": {
    title: "오시는 길",
    content: `
      <p class="text-lg text-muted-foreground">영신교회 위치를 안내해 드립니다</p>
      <section class="mt-10 rounded-xl border bg-muted/30 p-5">
        <h2 class="mt-0">교회 위치</h2>
        <p class="mb-2">서울특별시 양천구 목동로 19길 28</p>
        <p class="mb-0 text-sm text-muted-foreground">대중교통과 자가용으로 모두 접근하실 수 있습니다.</p>
      </section>
      <section class="mt-10">
        <h2>교통편</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <div class="rounded-xl border p-5">
            <h3 class="mt-0">지하철</h3>
            <ul>
              <li>5호선 목동역 2번 출구 도보 10분</li>
              <li>2호선 합정역 환승 후 5호선 이용</li>
            </ul>
          </div>
          <div class="rounded-xl border p-5">
            <h3 class="mt-0">버스</h3>
            <ul>
              <li>목동로 정류장 하차</li>
              <li>6614, 6630, 양천01 이용</li>
            </ul>
          </div>
        </div>
      </section>
      <div class="mt-10 rounded-xl border bg-muted p-8 text-center text-muted-foreground">
        지도 임베드 URL은 사이트 설정의 지도 값과 함께 사용할 수 있습니다.
      </div>
    `,
  },
  "community/small-church": {
    title: "작은교회",
    content: `
      <p class="text-lg text-muted-foreground">가정 같은 따뜻한 공동체</p>
      <section class="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-8">
        <h2 class="mt-0">작은교회란?</h2>
        <p class="mb-0">작은교회는 5~12명이 모여 함께 예배하고, 말씀을 나누며, 서로의 삶을 돌보는 소그룹 공동체입니다. 큰 교회 안의 작은 교회로서 진정한 교제와 영적 성장을 이루어 나갑니다.</p>
      </section>
      <section class="mt-10">
        <h2>작은교회 활동</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-xl border p-5 text-center"><h3 class="mt-0">말씀 나눔</h3><p class="mb-0">주일 설교 말씀을 함께 묵상하고 나눕니다.</p></div>
          <div class="rounded-xl border p-5 text-center"><h3 class="mt-0">기도 모임</h3><p class="mb-0">서로를 위해 함께 기도하며 중보합니다.</p></div>
          <div class="rounded-xl border p-5 text-center"><h3 class="mt-0">삶의 나눔</h3><p class="mb-0">일상의 기쁨과 어려움을 함께 나눕니다.</p></div>
        </div>
      </section>
      <section class="mt-10">
        <h2>참여 안내</h2>
        <ul>
          <li>작은교회는 지역별로 편성되어 있습니다.</li>
          <li>주중 저녁 또는 주말에 모입니다.</li>
          <li>참여를 원하시면 교회 사무실 또는 담당 목사님께 문의해 주세요.</li>
          <li>새가족은 새가족반 수료 후 배정됩니다.</li>
        </ul>
      </section>
    `,
  },
  "community/new-member": {
    title: "새가족 안내",
    content: `
      <p class="text-lg text-muted-foreground">영신교회에 오신 것을 환영합니다</p>
      <section class="mt-10">
        <h2>새가족 프로그램</h2>
        <div class="space-y-3">
          <div class="rounded-lg border p-4"><strong>01 새가족 환영</strong><p class="mb-0">주일 예배 후 담당 사역자와 개별 상담</p></div>
          <div class="rounded-lg border p-4"><strong>02 새가족반 수강</strong><p class="mb-0">4주 과정으로 교회와 신앙을 배웁니다</p></div>
          <div class="rounded-lg border p-4"><strong>03 작은교회 배정</strong><p class="mb-0">지역과 상황에 맞는 소그룹에 합류합니다</p></div>
          <div class="rounded-lg border p-4"><strong>04 세례/입교</strong><p class="mb-0">세례 및 입교 교육 후 정식 교인 등록</p></div>
        </div>
      </section>
      <section class="mt-10">
        <h2>신청 안내</h2>
        <p>새가족 신청 폼은 관리자에서 설정한 항목을 기준으로 아래에서 입력할 수 있습니다.</p>
      </section>
    `,
  },
  "community/departments": {
    title: "부서 소개",
    content: `
      <p class="text-lg text-muted-foreground">영신교회 각 부서를 소개합니다</p>
      <section class="mt-10">
        <h2>부서 안내</h2>
        <p>영신교회는 영아부부터 청년부까지 모든 세대가 함께 신앙 안에서 성장할 수 있도록 각 연령에 맞는 부서를 운영하고 있습니다. 위의 탭에서 원하는 부서를 선택하여 자세한 안내를 확인하세요.</p>
      </section>
    `,
  },
  "community/departments/infant": {
    title: "영아부",
    content: `
      <p class="text-lg text-muted-foreground">0 ~ 12개월 영아를 위한 부서입니다</p>
      <section class="mt-10">
        <h2>영아부 소개</h2>
        <p>영아부는 태어난 지 얼마 되지 않은 소중한 생명들을 하나님의 사랑으로 돌보는 부서입니다. 부모님과 함께 교회 공동체 안에서 첫 신앙의 씨앗을 심는 시간을 가집니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <ul>
          <li>대상: 0 ~ 12개월 영아</li>
          <li>시간: 주일 2부 예배 시간 (오전 11:00)</li>
          <li>장소: 교육관 영아부실</li>
        </ul>
      </section>
    `,
  },
  "community/departments/toddler": {
    title: "유아부",
    content: `
      <p class="text-lg text-muted-foreground">1세 ~ 4세 유아를 위한 부서입니다</p>
      <section class="mt-10">
        <h2>유아부 소개</h2>
        <p>유아부는 걸음마를 시작하는 아이들이 하나님을 처음 배우는 곳입니다. 찬양과 말씀, 놀이를 통해 하나님의 사랑을 자연스럽게 느낄 수 있도록 돕습니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <ul>
          <li>대상: 1세 ~ 4세 유아</li>
          <li>시간: 주일 2부 예배 시간 (오전 11:00)</li>
          <li>장소: 교육관 유아부실</li>
        </ul>
      </section>
    `,
  },
  "community/departments/kindergarten": {
    title: "유치부",
    content: `
      <p class="text-lg text-muted-foreground">5세 ~ 7세 미취학 아동을 위한 부서입니다</p>
      <section class="mt-10">
        <h2>유치부 소개</h2>
        <p>유치부는 취학 전 아이들이 성경 말씀과 찬양을 통해 하나님을 알아가는 부서입니다. 다양한 활동과 공과를 통해 신앙의 기초를 다집니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <ul>
          <li>대상: 5세 ~ 7세 (미취학 아동)</li>
          <li>시간: 주일 2부 예배 시간 (오전 11:00)</li>
          <li>장소: 교육관 유치부실</li>
        </ul>
      </section>
    `,
  },
  "community/departments/elementary": {
    title: "초등부",
    content: `
      <p class="text-lg text-muted-foreground">초등학생을 위한 부서입니다</p>
      <section class="mt-10">
        <h2>초등부 소개</h2>
        <p>초등부는 초등학교에 다니는 어린이들이 말씀과 기도로 신앙을 키워가는 부서입니다. 예배와 공과, 다양한 활동을 통해 하나님과의 관계를 깊어가도록 돕습니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <ul>
          <li>대상: 초등학교 1학년 ~ 6학년</li>
          <li>시간: 주일 2부 예배 시간 (오전 11:00)</li>
          <li>장소: 교육관 초등부실</li>
        </ul>
      </section>
    `,
  },
  "community/departments/youth": {
    title: "청소년부",
    content: `
      <p class="text-lg text-muted-foreground">중고등학생을 위한 부서입니다</p>
      <section class="mt-10">
        <h2>청소년부 소개</h2>
        <p>청소년부는 중학교·고등학교에 다니는 청소년들이 하나님의 말씀 안에서 정체성을 확립하고 성장하는 부서입니다. 예배와 소그룹, 수련회 등 다양한 활동을 통해 믿음의 공동체를 이루어 갑니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <ul>
          <li>대상: 중학교 1학년 ~ 고등학교 3학년</li>
          <li>시간: 주일 2부 예배 시간 (오전 11:00)</li>
          <li>장소: 교육관 2층 청소년부실</li>
        </ul>
      </section>
    `,
  },
  "community/departments/young-adult": {
    title: "청년부",
    content: `
      <p class="text-lg text-muted-foreground">청년들이 함께 모이는 부서입니다</p>
      <section class="mt-10">
        <h2>청년부 소개</h2>
        <p>청년부는 20~30대 청년들이 함께 예배하고 교제하며 하나님의 뜻을 찾아가는 공동체입니다. 매주 청년 예배와 소그룹 모임을 통해 삶 속에서 신앙을 실천합니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <ul>
          <li>대상: 20 ~ 30대 청년</li>
          <li>시간: 주일 오후 2:00</li>
          <li>장소: 본당</li>
        </ul>
      </section>
    `,
  },
  "ministry/god-love": {
    title: "하나님사랑",
    content: `
      <p class="text-lg text-muted-foreground">하나님을 사랑하는 신앙의 훈련</p>
      <section class="mt-10">
        <h2>하나님사랑 사역</h2>
        <p>영신교회는 하나님을 깊이 사랑하는 성도를 세우기 위해 다양한 신앙 훈련 프로그램을 운영합니다. 제자반, 성경대학, 온라인 독서모임을 통해 말씀과 기도로 하나님과 더 가까워지는 삶을 추구합니다.</p>
      </section>
    `,
  },
  "ministry/god-love/training": {
    title: "제자반 / 사역반",
    content: `
      <p class="text-lg text-muted-foreground">말씀으로 세워지는 제자, 사역으로 성장하는 일꾼</p>
      <section class="mt-10">
        <h2>제자반 / 사역반 소개</h2>
        <p>제자반은 신앙의 기초를 다지고 그리스도의 제자로 세워지는 훈련 과정입니다. 사역반은 제자반 수료 후 교회 사역자로 실제 사역에 참여하며 성장하는 과정입니다. 두 과정을 통해 말씀과 삶이 하나 되는 성도를 세워갑니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <p>수강 신청 및 일정 문의는 교회 사무실로 연락해 주세요.</p>
      </section>
    `,
  },
  "ministry/god-love/bible-study": {
    title: "성경대학",
    content: `
      <p class="text-lg text-muted-foreground">성경 전체를 체계적으로 배우는 말씀 훈련</p>
      <section class="mt-10">
        <h2>성경대학 소개</h2>
        <p>성경대학은 구약부터 신약까지 성경 전체를 체계적으로 배우는 심화 말씀 과정입니다. 교역자와 전문 강사의 인도 아래 성경의 흐름을 이해하고 하나님의 뜻을 깊이 묵상합니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <p>학기별 등록 일정은 공지사항을 통해 안내됩니다. 자세한 내용은 교회 사무실로 문의해 주세요.</p>
      </section>
    `,
  },
  "ministry/god-love/online-book": {
    title: "온라인 독서모임",
    content: `
      <p class="text-lg text-muted-foreground">함께 읽고 나누는 신앙 독서 공동체</p>
      <section class="mt-10">
        <h2>온라인 독서모임 소개</h2>
        <p>온라인 독서모임은 신앙 서적과 기독교 고전을 함께 읽고 온라인으로 나누는 모임입니다. 장소에 구애받지 않고 참여할 수 있어 바쁜 일상 속에서도 말씀과 신앙 훈련을 이어갈 수 있습니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <p>참여 신청 및 교재 안내는 교회 사무실 또는 담당 사역자에게 문의해 주세요.</p>
      </section>
    `,
  },
  "ministry/neighbor-love": {
    title: "이웃사랑",
    content: `
      <p class="text-lg text-muted-foreground">이웃을 섬기는 그리스도의 사랑</p>
      <section class="mt-10">
        <h2>이웃사랑 사역</h2>
        <p>영신교회는 교회 울타리를 넘어 지역사회와 이웃을 섬기는 사역을 실천합니다. 사랑나눔박스, 뮤직아카데미, 행복한대학 등을 통해 그리스도의 사랑을 나눕니다.</p>
      </section>
    `,
  },
  "ministry/neighbor-love/love-box": {
    title: "사랑나눔박스",
    content: `
      <p class="text-lg text-muted-foreground">나눔으로 전하는 그리스도의 사랑</p>
      <section class="mt-10">
        <h2>사랑나눔박스 소개</h2>
        <p>사랑나눔박스는 도움이 필요한 이웃에게 생필품과 식품을 박스로 구성하여 전달하는 사역입니다. 성도들의 작은 나눔이 모여 지역사회에 따뜻한 손길을 전합니다.</p>
      </section>
      <section class="mt-10">
        <h2>참여 안내</h2>
        <p>물품 후원 및 봉사 참여를 원하시면 교회 사무실로 문의해 주세요.</p>
      </section>
    `,
  },
  "ministry/neighbor-love/music-academy": {
    title: "뮤직아카데미",
    content: `
      <p class="text-lg text-muted-foreground">음악으로 지역사회를 섬깁니다</p>
      <section class="mt-10">
        <h2>뮤직아카데미 소개</h2>
        <p>뮤직아카데미는 지역 어린이와 청소년에게 음악 교육의 기회를 제공하는 사역입니다. 피아노, 기타, 보컬 등 다양한 악기를 통해 재능을 키우고 음악으로 하나님을 찬양하도록 돕습니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <p>수강 신청 및 일정 문의는 교회 사무실로 연락해 주세요.</p>
      </section>
    `,
  },
  "ministry/neighbor-love/happy-univ": {
    title: "행복한대학",
    content: `
      <p class="text-lg text-muted-foreground">배움의 기쁨을 나누는 평생교육 사역</p>
      <section class="mt-10">
        <h2>행복한대학 소개</h2>
        <p>행복한대학은 지역 어르신과 성도들을 위한 평생교육 프로그램입니다. 스마트폰 활용, 건강 강좌, 취미 교실 등 다양한 과목을 통해 배움의 즐거움을 나눕니다.</p>
      </section>
      <section class="mt-10">
        <h2>모임 안내</h2>
        <p>학기별 수강 신청은 공지사항을 통해 안내됩니다. 자세한 내용은 교회 사무실로 문의해 주세요.</p>
      </section>
    `,
  },
};
