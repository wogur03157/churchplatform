/**
 * 하위 페이지 항목의 고정 키(slug).
 * 메뉴 링크(#slug)와 화면이 이 키로 맞춰지므로, 배열 순서가 바뀌어도 링크가 깨지지 않습니다.
 */

/** 부서 소개 (/community/departments#slug) */
export const DEPARTMENT_SLUGS = ["toddler", "kindergarten", "elementary", "youth", "young-adult"] as const;

/** 하나님 사랑 (/ministry/god-love#slug) */
export const GOD_LOVE_SLUGS = ["disciple-training", "bible-college", "online-reading", "mothers-fathers-wise"] as const;

/** 이웃 사랑 (/ministry/neighbor-love#slug) */
export const NEIGHBOR_LOVE_SLUGS = ["sarang-nanum-box", "music-academy", "happy-university", "wedding-school"] as const;
