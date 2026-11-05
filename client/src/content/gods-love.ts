import type { ProgramDetail } from "./types";

export const godsLoveHero = {
  eyebrow: "MINISTRY & DISCIPLESHIP",
  image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=2574&auto=format&fit=crop",
  imageAlt: "성경책과 일기장이 있는 깊은 묵상을 위한 평화롭고 정돈된 신앙 공동체 예배당의 책상",
  fallbackTitle: "하나님사랑",
  infoTitle: "모임 및 등록 안내",
  featureTitle: "사역 핵심 목표 및 특징",
  breadcrumb: "사역과양육 > 하나님사랑 >",
};

export const godsLovePrograms: ProgramDetail[] = [
  {
    slug: "disciple-training",
    name: "제자반/사역반",
    headingTitle: "제자반 / 사역반",
    icon: "users",
    tagline: "말씀으로 세워지는 제자, 사역으로 성장하는 일꾼",
    heroDescription: "말씀으로 세워지는 제자, 사역으로 성장하는 일꾼. 제자반과 사역반을 통해 말씀과 삶이 하나 되는 신앙을 함께 배워갑니다.",
    intro: "제자반은 신앙의 기초를 다지고 그리스도의 제자로 세워지는 훈련 과정입니다. 사역반은 제자반 수료 후 교회 사역자로 실제 사역에 참여하며 성장하는 과정입니다. 두 과정을 통해 말씀과 삶이 하나 되는 성도를 세워갑니다.",
    info: [
      { label: "모임 방식", value: "교회 내 소그룹 편성 후 기수제 운영", border: "10" },
      { label: "수강 신청", value: "수강 신청 및 일정 문의는 교회 사무실로 연락해 주세요.", border: "10" },
    ],
    infoPadding: "p-5",
    features: [
      { title: "체계적인 제자 훈련", body: "우리의 중심 가치인 기독교 세계관과 제자도를 바로 배워 교회의 거둥목이 됩니다." },
      { title: "삶과 사역의 균형", body: "배움에 머물지 않고 능동적으로 서로 교제하고 직접 소그룹의 교사가 되는 실천을 지향합니다." },
    ],
  },
  {
    slug: "bible-college",
    name: "성경대학",
    headingTitle: "성경대학",
    icon: "book",
    tagline: "말씀을 깊이 배우고 삶에 적용하는 시간",
    heroDescription: "말씀을 깊이 배우고 삶에 적용하는 시간. 성경을 체계적으로 읽고 배우며 하나님을 알아가는 기쁨과 신앙의 깊이를 더해갑니다.",
    intro: "성경공부는 하나님의 말씀을 체계적으로 배우고 삶에 적용하는 모임입니다. 교역자의 인도 아래 함께 성경을 읽고 나누며 신앙의 깊이를 더해갑니다.",
    info: [
      { label: "시간", value: "화요일 오전 10:00", border: "10" },
      { label: "장소", value: "교육관", border: "10" },
      { label: "비고", value: "사전 등록 후 참여", wide: true, border: "10" },
    ],
    infoPadding: "p-4",
    features: [
      { title: "말씀 탐구와 학업", body: "쉽고 정갈한 커리큘럼을 통해 하나님의 말씀을 체계적으로 연구하고 마음판에 세웁니다." },
      { title: "영성과 지성의 조화", body: "지식 축적이 아닌 신령과 진정의 예배자들을 만드는 전인격적 성경 아카데미입니다." },
    ],
  },
  {
    slug: "online-reading",
    name: "온라인 독서모임",
    headingTitle: "온라인 독서모임",
    icon: "sparkles",
    tagline: "함께 읽고 나누는 신앙 독서 공동체",
    heroDescription: "함께 읽고 나누는 신앙 독서 공동체. 신앙 서적과 기독교 고전을 온라인으로 함께 읽으며 일상 속 믿음의 성장을 이어갑니다.",
    intro: "온라인 독서모임은 신앙 서적과 기독교 고전을 함께 읽고 온라인으로 나누는 모임입니다. 장소에 구애받지 않고 참여할 수 있어 바쁜 일상 속에서도 말씀과 신앙 훈련을 이어갈 수 있습니다.",
    info: [
      { label: "방식/매체", value: "Zoom 온라인 소모임 지원", border: "10" },
      { label: "참여 안내", value: "참여 신청 및 교재 안내는 교회 사무실 또는 담당 사역자에게 문의해 주세요.", border: "15" },
    ],
    infoPadding: "p-5",
    features: [
      { title: "시공간을 초월한 나눔", body: "바쁜 일정과 일상 속에서도 거리에 구애받지 않고 유기적으로 신앙 교제를 넓힙니다." },
      { title: "다채로운 영적 도서 선정", body: "기독교 고전들을 함께 풍성하게 해석하며 삶을 봅니다." },
    ],
  },
  {
    slug: "mothers-fathers-wise",
    name: "마더와이즈/파더와이즈",
    headingTitle: "마더와이즈 / 파더와이즈",
    headingTitleMobile: "마더/파더 와이즈",
    icon: "heart",
    tagline: "지혜로운 어머니와 아버지를 세우는 성경적 양육 프로그램",
    heroDescription: "지혜로운 어머니와 아버지를 세우는 성경적 양육 프로그램. 말씀 안에서 부모의 정체성을 발견하고 가정과 자녀를 사랑으로 세워갑니다.",
    intro: "마더와이즈와 파더와이즈는 성경적인 원리를 바탕으로 여성과 남성의 정체성을 바로 세우고, 가정과 자녀를 지혜롭게 양육하도록 돕는 소그룹 양육 프로그램입니다.",
    info: [
      { label: "운영 주기", value: "학기별 기수제 운영 (주중 8주~10주 과정)", border: "10" },
      { label: "신청 및 개강", value: "개강 및 모집 일정은 매 학기별 교회 광고를 참조해 주세요.", border: "10" },
    ],
    infoPadding: "p-5",
    features: [
      { title: "성경적 가족 가치 정립", body: "한 사람의 신앙적 정체성을 세워, 가문과 부모의 거룩한 도리를 바로 세웁니다." },
      { title: "마음의 교감 소그룹", body: "따뜻한 치유와 중보의 기도를 나누며 어머니와 아버지가 은혜로 단단해지는 보금자리입니다." },
    ],
  },
];
