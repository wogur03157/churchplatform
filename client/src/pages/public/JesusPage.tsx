import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ChevronLeft } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import FaithJourney from "@/components/FaithJourney";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

const TOPICS = [
  {
    title: "그분은 하나님이십니다.",
    desc: "예수님은 자신을 하나님과 하나라고 말씀하셨습니다. 세상을 만드신 하나님이 사람의 몸을 입고 우리의 삶과 고통 가운데 찾아오셨기에, 우리를 가장 깊이 아시고 위로하실 수 있는 분입니다.",
  },
  {
    title: "그분은 부활하셨습니다.",
    desc: "부활은 신화가 아닙니다. 예수님의 십자가 죽음은 역사적 사실이며, 제자들은 부활하신 예수님을 만난 뒤 목숨을 걸고 이 소식을 전했습니다. 예수님의 부활은 죽음 너머에도 삶이 있다는 소망을 보여 줍니다.",
  },
  {
    title: "그분은 유일한 길이십니다.",
    desc: "사람들은 저마다 하나님께 이르는 길이 있다고 말합니다. 그러나 기독교는 사람이 아니라, 하나님이 우리에게 내려오셨다고 말합니다. 예수님은 하나님과 우리를 이어 주시는 유일한 길이 되셨습니다.",
  },
];

export default function JesusPage() {
  return (
    <PublicPageLayout>
      {/* Hero */}
      <header className="subpage-hero relative h-[48vh] min-h-[22.5rem] md:h-[46vh] md:min-h-[26.25rem] w-full overflow-hidden">
        <img
          src="/images/cross.png"
          alt="십자가 이미지"
          className="absolute inset-0 w-full h-full object-cover object-top"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#352f29]/90 via-[#4c443b]/65 to-[#4c443b]/10" />
        <div className="relative max-w-7xl mx-auto h-full px-6 flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl text-left text-white"
          >
            <span className="inline-flex items-center gap-2 text-brand-gold text-xs md:text-sm font-semibold tracking-[0.22em] mb-5">
              <span className="w-8 h-px bg-brand-gold" />
              WHO IS JESUS
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-light leading-[1.15] mb-5">
              우리가 믿는 예수님은?
            </h1>
            <p className="text-base md:text-xl text-white/85 font-light leading-relaxed max-w-xl">
              우리를 찾아오신 사랑, 십자가와 부활의 소망. 예수님이 누구신지 함께 알아갑니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("who-is-jesus-title")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="inline-flex items-center gap-2 bg-brand-gold text-brand-brown px-5 py-3 rounded-full text-sm font-semibold hover:bg-white transition-colors cursor-pointer"
              >
                예수님 알아가기 <ArrowRight className="w-4 h-4" />
              </button>
              <Link href="/">
                <a className="inline-flex items-center gap-2 border border-white/35 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer">
                  <ChevronLeft className="w-4 h-4" /> 메인으로
                </a>
              </Link>
            </div>
          </motion.div>
        </div>
      </header>

      {/* 1. 예수님을 알아가는 것 */}
      <section
        id="jesus-introduction"
        className="relative py-20 md:py-28 px-6 overflow-hidden bg-brand-cream"
        aria-labelledby="who-is-jesus-title"
      >
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-gold/10" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div {...fadeIn} className="flex flex-col gap-12">
            <div className="text-center max-w-3xl mx-auto">
              <h2
                id="who-is-jesus-title"
                className="font-serif text-2xl md:text-4xl font-bold text-brand-brown mt-10 mb-5"
              >
                예수님을 알아가는 것
              </h2>
              <p className="text-brand-brown/70 text-base md:text-lg leading-[1.9] font-light">
                예수님은 우리를 멀리서 바라보는 분이 아니라, 사랑으로 찾아오신 하나님의 아들이십니다. 우리의 아픔과 질문을 아시고 십자가와 부활로 새로운 삶의 길을 여셨습니다.
              </p>
              <blockquote className="mt-8 pt-5 border-t border-brand-gold/60 text-brand-brown font-serif text-lg md:text-xl leading-relaxed">
                “내가 곧 길이요 진리요 생명이니”
                <cite className="block mt-2 text-sm text-brand-brown/50 not-italic font-sans">
                  요한복음 14:6
                </cite>
              </blockquote>
            </div>

            <div className="w-full grid sm:grid-cols-3 gap-6 lg:gap-8">
              {TOPICS.map((item, index) => (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="bg-white rounded-[2rem] border border-brand-gold/15 overflow-hidden min-h-[14.375rem] flex flex-col shadow-sm"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-brand-cream">
                    <img
                      src={`/images/new-family/jesus-${index + 1}.png`}
                      alt={`${item.title} 관련 이미지`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-6 px-6 pb-6 md:px-7 md:pb-7 text-left">
                    <h3 className="font-serif text-xl font-bold text-brand-brown mb-3">
                      {item.title}
                    </h3>
                    <p className="text-base text-brand-brown/65 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. 질문과 답변 · 자주 하는 질문 */}
      <FaithJourney />
    </PublicPageLayout>
  );
}
