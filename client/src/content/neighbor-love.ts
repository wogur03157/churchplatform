import type { NeighborLoveItem } from "./types";

/* 이웃 사랑 하위 프로그램 (사랑나눔박스, 뮤직아카데미, 행복한대학, 결혼예비학교). 순서가 곧 탭 순서입니다. */
export const neighborLoveItems: NeighborLoveItem[] = [
  {
    title: "사랑나눔박스",
    sub: "하나님 사랑을 성도와 이웃에게 전합니다.",
    target: "지역 사회 내 소외된 이웃 및 독거어르신 가정",
    time: "매주 목요일 오전 10:00",
    location: "교회 본당 로비 사역팀 미팅룸",
    motto: "하나님 사랑을 성도와 이웃에게 전합니다. 영신교회가 동행하는 사랑나눔은 한 사람을 찾아갑니다.",
    desc: "하나님 사랑을 성도와 이웃에게 전합니다. 영신교회가 동행하는 사랑나눔은 한 사람을 찾아갑니다.",
    details: [
      "독거 어르신과 1인 청년세대 섬김: 신정4동 주민센터와 연계하여 연 2회 사랑나눔박스를 만들어 독거 어르신과 1인 청년세대를 섬깁니다.(이웃사랑)",
      "교회내 성도 섬김: 교회내 성도의 어려움을 찾고 도우며 섬깁니다.(성도사랑)",
      "구제사역: 매월 2째주 사랑 나눔 헌금을 통해 구제사역을 멈추지 않고 예수님의 몸된 교회를 사랑합니다.(교회사랑)"
    ],
    image: "/images/mission_01.png",
    alt: "Volunteering donation box and sharing with the local community"
  },
  {
    title: "뮤직아카데미",
    sub: "Music Academy",
    target: "다양한 아카데미를 희망하는 전 연령대 성도 및 주민",
    time: "매주 토요일 오후 01:00 ~ 04:00",
    location: "본당 및 기쁨홀",
    motto: "새 노래로 그를 노래하며 즐거운 소리로 아름답게 연주할지어다 (시편 33:3)",
    desc: "영신교회는 지역 주민과 성도를 위해 다양한 아카데미와 클래스를 열어 교회와 지역사회의 연결을 지향합니다.",
    details: [
      "뮤직 아카데미: - (실용)드럼, 어쿠스틱기타, 베이스기타, 일렉기타\n- (클래식)바이올린, 플룻, 클라리넷",
      "평생교육 아카데미: - 발성 및 스피치\n- 영어회화\n- 중국어회화(예정)\n- 쿠키클래스\n- 원데이 클래스(꽃다발, 친환경 생활용품 등)"
    ],
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2680&auto=format&fit=crop",
    alt: "Violin, instruments and sheets of music representing the academy"
  },
  {
    title: "행복한대학",
    sub: "Happy College for Seniors",
    target: "65세 이상 누구나",
    time: "목요일 오전 10시 30분 (학기제 운영)",
    location: "지하 1층 기쁨홀",
    motto: "늙어도 여전히 결실하며 진액이 풍족하고 빛이 청청하니 (시편 92:14)",
    desc: "65세 이상의 어르신들을 위한 행복한 여정을 위한 교육",
    details: [
      "다채로운 아카데미 학과: 스마트폰 및 키오스크 주문 정복, 한글 서예, 생활 미술/도예, 관절 타이치 체조, 아시안 가곡 및 시 낭송 반.",
      "무상 건강 스크리닝 및 맛있는 점심 식사: 성가 임상 간호 사역자들과 협력하여 혈압/체성분 검사 등 주간 건강 체크 후 정성이 듬뿍 담긴 제철 영양 점심 뷔페 대접.",
      "힐링 소풍 및 기념 촬영: 봄과 가을에는 꽃빛 고운 수목원이나 교외 숲길로 수학여행 같은 소풍을 다녀오며, 매 종강 시 독사진 영정 및 액자 촬영 선물 제공."
    ],
    image: "/images/mission_03.png",
    alt: "Happy senior Asian community laughing and holding tea mugs under warm light"
  },
  {
    title: "결혼예비학교",
    sub: "Marriage Preparation School",
    target: "결혼을 앞둔 예비 신혼부부 및 미혼 청년 커플",
    time: "매학기 (상반기 4-5월, 하반기 10-11월) 토요일 오후 05:00",
    location: "교육관 3층 세미나홀",
    motto: "하나님이 짝지어 주신 것을 사람이 나누지 못할지니라 (마태복음 19:6)",
    desc: "하나님 뜻 안에 있는 행복한 결혼과 가정을 위한 성경적 기반을 토대로 한 교육",
    details: [
      "가정사역 권위자 주관 세미나: MBTI 성격 유형 분석을 바탕으로 남녀의 성향과 심리적 차이를 통찰하고, 대화의 기술 및 건강한 다툼 해결 원칙 습득.",
      "크리스천 가정 재량 재정 관리 특강: 세속적인 지출 가치를 극복하고 십일조와 이웃 구제, 저축과 지극히 상식적인 예산 집행을 설계하는 주님의 재정 청지기 훈련.",
      "커플 전야 서약 세리머니: 서로를 위해 정성껏 써 내려간 고백 편지를 낭독하고 기쁨으로 무릎 꿇으며 프로포즈 반지를 정식 교환하는 감동과 눈물의 패밀리 축제."
    ],
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2670&auto=format&fit=crop",
    alt: "Table setup with warm candlelight in building trust and warmth in relationships"
  }
];

/** 페이지 안내 문구. {title}은 프로그램 이름으로 바뀝니다. */
export const neighborLoveLabels = {
  back: "뒤로 가기",
  home: "메인 화면으로 돌아가기",
  breadcrumb: "사역과양육 > 이웃사랑 >",
  overview: "사역소개",
  schedule: "모임 안내",
  activities: "주요 활동 및 프로그램 안내",
  academyApply: "아카데미 참여 신청",
  supportApply: "참여 및 후원 신청",
  applyIntroAcademy: "{title}에 참가(등록)하여 수강생으로 함께 배우실 분은 아래 정보를 남겨주시면 담당 파트에서 정성을 다해 연락을 드리겠습니다.",
  applyIntroDefault: "{title}에 참가(등록)하시거나 봉사 및 물품 후원으로 뜻깊게 동참하고 싶으신 분은 아래 정보를 남겨주시면 담당 파트에서 정성을 다해 연락을 드리겠습니다.",
  openLink: "신청 링크 열기",
};
