/**
 * 공지사항·사역 게시판 페이지의 텍스트.
 * 목록 데이터(공지, 사역 글)는 data/siteContent.ts에 있으며, 나중에 DB 목록으로 바꿉니다.
 */
import type { HeroContent } from "./types";

export const noticesContent: { hero: HeroContent; filters: string[] } = {
  hero: {
    image: "/images/notice.png",
    imageAlt: "성경구절 기록 및 메모장",
    eyebrow: "CHURCH NEWS & BULLETIN",
    title: "공지사항 & 주보",
    titleDesktop: "공지사항",
    description: "매주 발행되는 영신교회 소식지와 성경 공부, 사역모임 포스터를 한눈에 모아보세요.",
  },
  filters: ["전체", "주보", "포스터"],
};

export const ministryContent: {
  hero: HeroContent;
  heading: string;
  intro: string;
} = {
  hero: {
    image: "/images/ministry.png",
    imageAlt: "성도들이 환하게 웃으며 함께 힘을 모으는 봉사와 찬양의 현장 소식",
    eyebrow: "MINISTRY PHOTO GALLERY",
    title: "사역 활동 게시판",
    titleDesktop: "사역게시판",
    description: "지역사회를 축복하며 아름답게 섬기는 성도들의 나눔·봉사 활동 스냅샷입니다.",
  },
  heading: "사역과 섬김의 모습을 남겨주세요.",
  intro: "영신 공동체가 뿌린 기쁨과 소망의 열매들을 함께 살펴보며 은혜를 경험하세요.",
};
