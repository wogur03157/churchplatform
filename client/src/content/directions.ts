import type { DirectionsContent } from "./types";

export const directionsContent: DirectionsContent = {
  hero: {
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2640&auto=format&fit=crop",
    imageAlt: "지도로 표현한 듯한 따스하고 길을 찾는 아늑한 가로수길 풍경",
    eyebrow: "LOCATION & DIRECTIONS",
    title: "오시는 길",
    titleDesktop: "오시는길",
    description: "지역 주민과 성도님 누구나 편안하게 방문하실 수 있도록 자세히 안내합니다.",
  },
  address: "서울특별시 양천구 목동로 19길 28",
  mapQuery: "서울특별시 양천구 목동로 19길 28",
  contact: {
    title: "교무행정실 연락처",
    phone: "02-123-4567",
    body: "방문 및 차량 등록, 장소 대여 안내 등 상세 내용은 행정실로 연락 주시기 바랍니다.",
  },
  transit: {
    title: "대중교통 안내",
    items: [
      { icon: "train", title: "지하철", body: "인근 역 하차 후 도보 이동" },
      { icon: "bus", title: "버스", body: "목동로 주요 정류장 하차" },
    ],
    tip: "💡 상세 주소와 지도는 교회위치 지도 영역에서 확인하실 수 있습니다.",
  },
  mapTitle: "교회위치",
};
