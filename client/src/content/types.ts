/**
 * 공개 페이지 텍스트·데이터의 형식.
 * 지금은 코드 파일(content/*.ts)에 두고, 나중에는 DB(JSON)에서 같은 형식으로 읽어옵니다.
 */

/** 페이지 상단 히어로 */
export type HeroContent = {
  image: string;
  imageAlt: string;
  eyebrow: string;
  /** 모바일 제목 */
  title: string;
  /** 데스크탑 제목 (띄어쓰기가 다를 수 있음) */
  titleDesktop: string;
  description: string;
};

/** 예배 한 줄 (주일 예배 등) */
export type WorshipServiceRow = {
  badge: string;
  badgeTone: "sage" | "gold";
  title: string;
  /** 모바일에서 보이는 시간 */
  timeShort: string;
  /** 데스크탑에서 보이는 시간 */
  timeLong: string;
};

/** 주중 예배 한 줄 (요일 표기가 모바일은 짧게, 데스크탑은 길게) */
export type WeekdayWorshipRow = {
  badge: string;
  title: string;
  timeShort: string;
  timeLong: string;
};

export type WorshipGroup<R> = {
  title: string;
  icon: "calendar" | "clock";
  location: string;
  rows: R[];
};

export type WorshipContent = {
  hero: HeroContent;
  sunday: WorshipGroup<WorshipServiceRow>;
  weekday: WorshipGroup<WeekdayWorshipRow>;
};

/** 교회 소개 */
export type StaffMember = {
  name: string;
  role: string;
  dept: string;
  img: string;
  /** 담당 사역으로 이동하는 주소 (없으면 이동 버튼 없음) */
  link?: string;
};

export type AboutContent = {
  hero: HeroContent;
  greeting: {
    photo: { src: string; alt: string; objectPosition: string };
    name: string;
    role: string;
    /** 인용문 두 줄 (사이에 줄바꿈) */
    quoteLines: [string, string];
    body: string;
    signature: { prefix: string; name: string; suffix: string };
  };
  staff: StaffMember[];
  vision: {
    title: string;
    items: { title: string; body: string }[];
  };
};

/** 작은교회 */
export type SmallChurchContent = {
  hero: HeroContent;
  /** 소개 문단 */
  intro: string;
  /** 교구별 대상 (데스크탑은 한 줄, 모바일은 목록으로 보임) */
  districts: { label: string; target: string }[];
  /** 하는 일 (아이콘과 문장) */
  activities: { icon: "book" | "heart" | "leaf"; text: string }[];
  /** 참여 안내 */
  participation: { mark: string; title: string; body: string }[];
};

/** 오시는 길 */
export type DirectionsContent = {
  hero: HeroContent;
  address: string;
  /** 지도 검색용 주소 (구글 지도 임베드) */
  mapQuery: string;
  contact: { title: string; phone: string; body: string };
  transit: { title: string; items: { icon: "train" | "bus"; title: string; body: string }[]; tip: string };
  mapTitle: string;
};

/** 하나님 사랑 하위 프로그램 한 개 */
export type ProgramInfoItem = { label: string; value: string; wide?: boolean; border: "10" | "15" };
export type ProgramFeature = { title: string; body: string };
export type ProgramDetail = {
  slug: string;
  /** 탭·브레드크럼에 쓰는 이름 */
  name: string;
  /** 데스크탑 제목 (기본은 name과 같음) */
  headingTitle: string;
  /** 모바일 제목 (줄바꿈 등으로 다를 때) */
  headingTitleMobile?: string;
  icon: "users" | "book" | "sparkles" | "heart";
  tagline: string;
  heroDescription: string;
  intro: string;
  info: ProgramInfoItem[];
  infoPadding: "p-4" | "p-5";
  features: ProgramFeature[];
};

/** 이웃 사랑 하위 프로그램 */
export type NeighborLoveItem = {
  title: string;
  sub: string;
  target: string;
  time: string;
  location: string;
  motto: string;
  desc: string;
  details: string[];
  image: string;
  alt: string;
};

/** 다음세대 부서 */
export type DepartmentItem = { month: string; title: string; desc: string };
export type Department = {
  slug: string;
  /** 탭 이름 */
  name: string;
  /** 히어로 위 작은 라벨 */
  badge: string;
  /** 히어로 제목 (모바일) */
  heroTitleMobile: string;
  /** 히어로 제목 (데스크탑) */
  heroTitle: string;
  heroDescription: string;
  heroImage: string;
  heroAlt: string;
  target: string;
  time: string;
  location: string;
  motto: string;
  staff: string;
  staffPhoto: string;
  /** 교육 담당 사진 높이 변형 */
  photoTall: boolean;
  /** 사역소개 문단 (없으면 카드 본문 없음) */
  intro: string;
  /** 사역소개 카드 본문이 인용문일 때 */
  introIsQuote?: boolean;
  calendar: DepartmentItem[];
  /** 처음 방문 안내 카드 표시 여부 */
  showWelcome: boolean;
};

/** 새가족 안내 — 단계 카드 */
export type NewMemberStep = {
  title: string;
  body: string;
  meta: string;
  image?: string;
};

/** 새가족 안내 — 추천 도서 */
export type RecommendedBook = {
  title: string;
  author: string;
  category: string;
  description: string;
  cover: string;
  image: string;
  accent: string;
};

export type NewMemberSection = {
  eyebrow: string;
  title: string;
  /** 줄바꿈이 있으면 한 줄씩 */
  description: string[];
};

/** 새가족 안내 페이지 문구. 등록 폼 항목은 DB(form-fields)에서 따로 옵니다. */
export type NewMemberContent = {
  hero: {
    image: string;
    imageAlt: string;
    eyebrow: string;
    titleMobile: string;
    titleDesktop: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  firstVisit: NewMemberSection & { steps: NewMemberStep[] };
  registration: NewMemberSection & { steps: NewMemberStep[] };
  books: NewMemberSection & { items: RecommendedBook[] };
  form: {
    eyebrow: string;
    title: string;
    description: string;
    submitLabel: string;
    pendingLabel: string;
    successTitle: string;
    successBody: string;
    successNote: string;
  };
};
