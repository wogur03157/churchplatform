import type { AboutContent } from "./types";

export const aboutContent: AboutContent = {
  hero: {
    image: "/images/tree.png",
    imageAlt: "tree",
    eyebrow: "ABOUT OUR CHURCH",
    title: "영신교회 소개",
    titleDesktop: "영신교회",
    description: "하나님의 말씀을 중심으로 예배하고 양육하며 지역과 세대를 함께 세우는 은혜의 공동체입니다.",
  },
  greeting: {
    photo: { src: "/images/0.jpg", alt: "영신교회 담임목사 김상호", objectPosition: "0 -22px" },
    name: "김상호 담임목사",
    role: "영신교회 담임목사",
    quoteLines: ["\"하나님의 평화와 축복이 여러분의 삶과 가정에 ", "늘 가득하시기를 소망합니다.\""],
    body: "영신교회는 믿음의 길을 걸어가는 교회입니다. 같은 말, 같은 마음, 같은 뜻으로 기성세대들이 걸어가는 믿음의 길을 따라 가는 다음세대들에게 예수님만이 진리이며 결론임을 증명하려 힘쓰는 교회입니다. 우리의 행동지침은“복음”을 쉬지 않고 전하는 교회,“성장”을 멈추지 않는 교회,“가치”를 알고, 행동하는 교회가 되는 것입니다. 사람을 행복하게 함으로 하나님을 기쁘시게 하는 것이 우리들의 사명이요. 꿈입니다. 이것이 영신교회의 존재 이유입니다. 예수님을 알아감으로 예수님을 닮아감으로 하나님을 사랑하고, 사람을 사랑하여 하나님을 감동시켜 드리는 것. 즉, 사람을 행복하게 함으로 하나님을 사랑하는 것입니다. 이를 위해, 지역을 섬기고, 가정과 다음 세대를 세우는 일에 최우선으로 할 것입니다.",
    signature: { prefix: "영신교회 담임목사", name: "김상호", suffix: "드림" },
  },
  staff: [
    { name: "조은찬 목사", role: "부목사", dept: "행정/1,3교구", img: "/images/1.jpg", link: "/community/small-church" },
    { name: "김호준 목사", role: "부목사", dept: "초등부/행복한대학/2,4교구", img: "/images/2.jpg", link: "/community/departments#elementary" },
    { name: "김성호 목사", role: "협동목사", dept: "교육총괄/뮤직아카데미", img: "/images/0-0.jpg", link: "/ministry/neighbor-love#music-academy" },
    { name: "손창성 전도사", role: "교육전도사", dept: "중고등부/미디어", img: "/images/3.jpg", link: "/community/departments#youth" },
    { name: "김진영 전도사", role: "교육전도사", dept: "유치부/사랑나눔", img: "/images/4.jpg", link: "/community/departments#kindergarten" },
    { name: "허승욱 전도사", role: "교육전도사", dept: "새가족/중보기도", img: "/images/5.jpg", link: "/community/new-member" },
    { name: "김혜민 전도사", role: "찬양전도사", dept: "예배부", img: "/images/6.jpg" },
    { name: "차민경 디렉터", role: "디렉터", dept: "카페쉼/디자인", img: "/images/8.jpeg" },
    { name: "박혜연 디렉터", role: "디렉터", dept: "유아부/미디어", img: "/images/7.jpg", link: "/community/departments#toddler" },
  ],
  vision: {
    title: "교회 비전 및 철학",
    items: [
      { title: "복음으로 사는 교회", body: "영신교회는 “복음”을 쉬지 않고 전하는 교회, “성장”을 멈추지 않는 교회, “가치”를 발견하고, “행동”하는 교회, “소통”하는 교회가 되어, 하나님께 영광 돌려드리는 것입니다. 이 일을 위해 예배, 양육, 전파, 교제에 대한 사역을 통해 “하나님”을 사랑하고, 하나님이 가장 사랑한 “사람”을 사랑하는 것이 영신교회의 비전입니다. 이를 위해 지역을 섬기고, 건강하고 행복한 가정, 다음 세대를 세우는 일에 힘을 쏟는 교회입니다." },
      { title: "다음 세대를 세우는 교회", body: "우리는 복음으로 인해 바른 믿음을 세워감으로써 하나님의 사람이라는 정체성과 옳은 것에 대한 분별력을 갖고, 하나님 나라의 비전을 품을 수 있도록 돕겠습니다.하나님의 마음으로 양육하고 돌보겠습니다. [골1:28-29]”우리가 그를 전파하여 각 사람을 권하고 모든 지혜로 각 사람을 가르침은 각 사람을 그리스도 안에서 완전한 자로 세우려 함이니, 이를 위하여 나도 내 속에서 능력으로 역사하시는 이의 역사를 따라 힘을 다하여 수고하노라”" },
      { title: "건강한 가정을 세우는 교회", body: "우리는 가정이 하나님이 주신 가장 귀한 선물임을 확신합니다. 건강한 가정을 위해서는 소통의 마음과 배움의 애씀이 있어야 합니다. 복음 안에서 나와 너를 이해할 때, 건강한 가정을 이룰 수 있습니다. 하나님이 함께 하시는 건강한 가정이 세워지기를 소망합니다." },
    ],
  },
};
