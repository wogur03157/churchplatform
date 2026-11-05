import type { WorshipContent } from "./types";

export const worshipContent: WorshipContent = {
  hero: {
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2640&auto=format&fit=crop",
    imageAlt: "예배당 내부와 촛불 조명, 성스럽고 차분한 분위기",
    eyebrow: "WORSHIP GUIDE",
    title: "예배 안내",
    titleDesktop: "예배안내",
    description: "영신교회는 언제나 열려있습니다. 기쁨과 은총이 넘치는 주님의 성전으로 여러분을 초대합니다.",
  },
  sunday: {
    title: "주일 예배",
    icon: "calendar",
    location: "교회2층 본당",
    rows: [
      { badge: "1부 예배", badgeTone: "sage", title: "주일 오전 예배", timeShort: "오전 09:30", timeLong: "오전 09:30" },
      { badge: "2부 예배", badgeTone: "gold", title: "주일 오전 예배", timeShort: "오전 11:30", timeLong: "오전 11:30" },
      { badge: "청년부", badgeTone: "sage", title: "주일 오후 모임", timeShort: "오후 02:00", timeLong: "오후 02:00" },
    ],
  },
  weekday: {
    title: "주중 예배",
    icon: "clock",
    location: "교회2층 본당",
    rows: [
      { badge: "새벽기도회", title: "매일 새벽 문을 여는 기도", timeShort: "매일 오전 05:30", timeLong: "매일 오전 05:30" },
      { badge: "수요예배", title: "성경 말씀 강해", timeShort: "수 오후 07:30", timeLong: "수요일 오후 07:30" },
      { badge: "금요기도회", title: "찬양이 넘치는 은혜의 밤", timeShort: "금 오후 08:30", timeLong: "금요일 오후 08:30" },
    ],
  },
};
