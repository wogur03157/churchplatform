import type { SmallChurchContent } from "./types";

export const smallChurchContent: SmallChurchContent = {
  hero: {
    image: "/images/edit_04.png",
    imageAlt: "가정같이 따뜻하고 다정하게 이야기를 나누는 소그룹 작은교회 공동체 모임",
    eyebrow: "COMMUNITY",
    title: "작은교회(교구)",
    titleDesktop: "작은교회",
    description: "소그룹의 따뜻한 모임 속에서 역사하시는 예수 그리스도의 생명을 함께 나눕니다",
  },
  intro: "각 교구내에 소그룹(작은교회)으로 운영되고 있습니다. 함께 모여 말씀을 나누며, 서로의 삶을 돌보는 진정한 교제와 영적성장을 이루어나갑니다.",
  districts: [
    { label: "1교구", target: "65세 이상" },
    { label: "2교구", target: "50대" },
    { label: "3교구", target: "40대" },
    { label: "4교구", target: "40대이하 젊은 부부" },
  ],
  activities: [
    { icon: "book", text: "말씀 나눔 : 주일 설교 말씀을 함께 묵상하고 나눕니다." },
    { icon: "heart", text: "기도 모임 : 서로를 위해 함께 기도하며 중보합니다." },
    { icon: "leaf", text: "삶의 나눔 : 일상의 기쁨과 어려움을 함께 나눕니다." },
  ],
  participation: [
    { mark: "A", title: "지역별 편성", body: "작은교회는 지역별로 편성되어 있습니다." },
    { mark: "B", title: "모임 시간", body: "주중 저녁 또는 주말에 모입니다." },
    { mark: "C", title: "문의처", body: "참여를 원하시면 교회 사무실 또는 담당 목사님께 문의해 주세요." },
    { mark: "D", title: "새가족 배정", body: "새가족은 새가족반 수료 후 배정됩니다." },
  ],
};
