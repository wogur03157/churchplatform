import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowRight, CheckCircle, ChevronLeft, ChevronRight,
  MapPin, UserPlus, Church, MessageSquare, BookOpen,
} from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";

// ─── 정적 데이터 ──────────────────────────────────────────────────────────────

const FIRST_VISIT_STEPS = [
  { icon: MapPin,       title: "교회 도착",   desc: "주일 예배 15분 전, 1층 안내 데스크로 오세요.",           meta: "서울 양천구 목동로19길 28" },
  { icon: UserPlus,     title: "환영 안내",   desc: "새가족 도우미가 예배실과 필요한 공간을 안내합니다.",     meta: "부담 없는 간단한 안내" },
  { icon: Church,       title: "함께 예배",   desc: "원하는 자리에 편하게 앉아 예배에 참여하시면 됩니다.",   meta: "1부 09:00 · 2부 11:00" },
  { icon: MessageSquare,title: "차 한잔 교제","desc": "예배 후 새가족실에서 교회를 소개하고 이야기를 나눕니다.", meta: "등록은 천천히 결정하세요" },
];

const REGISTRATION_STEPS = [
  { image: "https://picsum.photos/seed/reg-step1/800/600", title: "등록을 결심하셨다면",   desc: "담당 교역자의 심방을 받게 됩니다.",             meta: "STEP 1 · 등록 상담" },
  { image: "https://picsum.photos/seed/reg-step2/800/600", title: "새가족 소그룹(6-7주)", desc: "소그룹을 거쳐 공동체에 배정됩니다.",              meta: "STEP 2 · 소그룹 배정" },
  { image: "https://picsum.photos/seed/reg-step3/800/600", title: "정식 등록교인이 되기까지", desc: "담임목사와의 만남과 새가족교육(7주) 프로그램을 수료하면 정식으로 등록교인이 됩니다.", meta: "STEP 3 · 공동체에 정착" },
];

// DB화 예정 — 현재 정적 목업
// 실제 서비스 시 /recommended-books API 또는 site-config JSON으로 관리
const RECOMMENDED_BOOKS = [
  { title: "순전한 기독교",   author: "C. S. 루이스",     category: "기독교 입문", desc: "기독교 신앙의 핵심을 논리적이고 따뜻한 언어로 만나는 고전입니다.", cover: "#69725A", accent: "#E7D2A5" },
  { title: "탕부 하나님",     author: "팀 켈러",          category: "복음",       desc: "탕자의 비유를 통해 조건 없이 맞아 주시는 하나님의 사랑을 발견합니다.", cover: "#7C5E4E", accent: "#F0DDB8" },
  { title: "목적이 이끄는 삶", author: "릭 워렌",          category: "신앙생활",   desc: "하나님 안에서 삶의 목적을 찾고 매일의 믿음을 세우도록 돕는 안내서입니다.", cover: "#526B70", accent: "#D6C59A" },
  { title: "내가 만든 신",     author: "팀 켈러",          category: "영적 성장",  desc: "우리 마음이 붙드는 우상을 돌아보고 복음 안의 참된 자유로 나아가게 합니다.", cover: "#6D6275", accent: "#E6D4B2" },
  { title: "그리스도를 본받아", author: "토마스 아 켐피스",  category: "영성 고전",  desc: "예수님의 겸손과 사랑을 일상의 태도로 살아내도록 초대하는 묵상 고전입니다.", cover: "#8A6B51", accent: "#F1DEB6" },
];

const fadeInUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function NewMember() {
  const [bookIndex, setBookIndex]       = useState(0);
  const [fieldValues, setFieldValues]   = useState<Record<string, string>>({});
  const [submitted, setSubmitted]       = useState(false);
  const formRef = useRef<HTMLElement>(null);

  // DB: 신청 폼 필드
  const { data: fields } = useQuery({
    queryKey: ["form-fields", "new-member"],
    queryFn: () => api.get<any[]>("/form-fields?activeOnly=true&formType=new-member"),
  });

  const submitMutation = useMutation({
    mutationFn: (fieldData: Record<string, string>) =>
      api.post("/form-submissions", { formType: "new-member", fieldData }),
    onSuccess: () => setSubmitted(true),
    onError: () => toast.error("제출 중 오류가 발생했습니다. 다시 시도해 주세요."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields ?? []) {
      if (f.required && !fieldValues[f.label]?.trim()) {
        toast.error(`${f.label}을(를) 입력해주세요`);
        return;
      }
    }
    submitMutation.mutate(fieldValues);
  };

  const setValue = (label: string, value: string) =>
    setFieldValues((prev) => ({ ...prev, [label]: value }));

  const maxBookIndex = Math.max(0, RECOMMENDED_BOOKS.length - 3);

  if (submitted) {
    return (
      <PublicPageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-brand-sage/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-brand-sage" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-brand-brown mb-3">신청이 완료되었습니다!</h2>
            <p className="text-brand-brown/60 text-lg">담당 사역자가 곧 연락드리겠습니다.</p>
            <p className="text-brand-brown/50 mt-1">영신교회에 오신 것을 진심으로 환영합니다.</p>
          </div>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <header className="relative h-[55vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#352f29] via-[#4c443b] to-[#675D50]" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-brown/80 to-transparent" />
        <div className="relative h-full max-w-5xl mx-auto px-6 flex items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl text-left text-white">
            <span className="inline-flex items-center gap-2 text-brand-gold text-xs font-semibold tracking-[0.22em] mb-5">
              <span className="w-8 h-px bg-brand-gold" />
              WELCOME HOME
            </span>
            <h1 className="font-serif text-4xl md:text-6xl font-light leading-[1.15] mb-5">새가족 안내</h1>
            <p className="text-base md:text-xl text-white/80 font-light leading-relaxed max-w-xl">
              예수님을 알아가는 첫걸음부터 교회에 방문하는 순간까지,<br className="hidden md:block" /> 영신교회가 따뜻하게 동행하겠습니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                type="button"
                onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex items-center gap-2 bg-brand-gold text-brand-brown px-5 py-3 rounded-full text-sm font-semibold hover:bg-white transition-colors"
              >
                등록 신청하기 <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("first-visit-guide")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className="inline-flex items-center gap-2 border border-white/35 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
              >
                첫 방문 준비하기
              </button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── 01 첫방문 가이드 ──────────────────────────────────────────────── */}
      <section id="first-visit-guide" className="py-20 md:py-28 px-6 bg-brand-cream/60 scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-brand-sage text-sm font-bold tracking-[0.18em]">01 · FIRST VISIT</span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-brand-brown mt-4 mb-5">첫방문 가이드</h2>
            <p className="text-brand-brown/65 leading-relaxed">
              낯설지 않도록, 도착부터 예배 후 교제까지<br />차근차근 안내해 드립니다.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FIRST_VISIT_STEPS.map(({ icon: Icon, title, desc, meta }, i) => (
              <motion.article
                key={title}
                {...fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-[2rem] p-5 md:p-6 border border-brand-gold/15 shadow-sm text-left"
              >
                <div className="w-10 h-10 rounded-full bg-brand-sage/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-sage" />
                </div>
                <span className="text-xs font-bold text-brand-sage tracking-[0.15em]">STEP {i + 1}</span>
                <h3 className="font-serif text-xl font-bold text-brand-brown mt-1 mb-2">{title}</h3>
                <p className="text-sm text-brand-brown/65 leading-relaxed min-h-[4rem]">{desc}</p>
                <p className="mt-4 pt-3 text-xs font-medium text-brand-brown/50 border-t border-brand-gold/15">{meta}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 섹션 구분 버튼 */}
      <div className="relative z-10 flex justify-center h-0">
        <button
          type="button"
          onClick={() => document.getElementById("registration-guide")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="w-14 h-14 -translate-y-1/2 rounded-full bg-white border border-brand-gold/30 text-brand-sage shadow-sm flex items-center justify-center hover:bg-brand-sage hover:text-white transition-colors"
          aria-label="등록과 정착 안내로 이동"
        >
          <ArrowRight className="w-6 h-6 rotate-90" />
        </button>
      </div>

      {/* ── 02 등록과 정착 안내 ──────────────────────────────────────────── */}
      <section id="registration-guide" className="py-20 md:py-28 px-6 bg-brand-cream scroll-mt-16">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeInUp} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-brand-sage text-sm font-bold tracking-[0.18em]">02 · REGISTRATION</span>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-brand-brown mt-4 mb-5">등록과 정착 안내</h2>
            <p className="text-brand-brown/65 leading-relaxed">등록을 결심하셨다면, 영신교회의 가족으로 함께하는 과정을 안내해 드립니다.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REGISTRATION_STEPS.map((step, i) => (
              <motion.article key={step.title} {...fadeInUp} transition={{ delay: i * 0.1 }} className="flex flex-col gap-4">
                <div className="w-full aspect-[4/3] overflow-hidden rounded-[2rem] bg-brand-cream">
                  <img src={step.image} alt={step.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div>
                  <span className="text-xs font-bold text-brand-sage tracking-[0.15em]">{step.meta}</span>
                  <h3 className="font-serif text-xl font-bold text-brand-brown mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-brand-brown/65 leading-relaxed">{step.desc}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 추천도서 ──────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 px-6 bg-brand-brown/90 text-brand-cream overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div {...fadeInUp}>
              <span className="text-brand-gold text-sm font-bold tracking-[0.18em]">03 · RECOMMENDED BOOKS</span>
              <h2 className="font-serif text-3xl md:text-5xl font-normal mt-4 mb-4">처음 믿음을 위한 추천도서</h2>
              <p className="text-brand-cream/65 leading-relaxed">신앙의 질문을 천천히 풀어가며 예수님을 더 깊이 알아가도록 돕는 책들입니다.</p>
            </motion.div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setBookIndex((p) => Math.max(0, p - 1))}
                disabled={bookIndex === 0}
                aria-label="이전"
                className="w-12 h-12 rounded-full border border-brand-cream/25 flex items-center justify-center hover:bg-brand-cream hover:text-brand-brown disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setBookIndex((p) => Math.min(maxBookIndex, p + 1))}
                disabled={bookIndex === maxBookIndex}
                aria-label="다음"
                className="w-12 h-12 rounded-full border border-brand-cream/25 flex items-center justify-center hover:bg-brand-cream hover:text-brand-brown disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem]">
            <motion.div
              className="flex"
              animate={{ x: `-${bookIndex * (100 / 3)}%` }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
            >
              {RECOMMENDED_BOOKS.map((book, i) => (
                <article key={book.title} className="shrink-0 px-3" style={{ width: "33.333%" }}>
                  <div className="h-full bg-white/[0.07] border border-white/10 rounded-[2rem] p-6 flex gap-5 items-center hover:bg-white/10 transition-colors">
                    {/* 책 표지 */}
                    <div
                      className="relative w-24 aspect-[2/3] rounded-r-md rounded-l-sm shrink-0 shadow-xl overflow-hidden"
                      style={{ backgroundColor: book.cover, color: book.accent }}
                    >
                      <div className="absolute inset-y-0 left-0 w-2.5 bg-black/15 border-r border-white/10" />
                      <div className="h-full pl-5 pr-3 py-4 flex flex-col">
                        <BookOpen className="w-4 h-4 mt-4 opacity-70" />
                        <strong className="font-serif text-sm leading-snug mt-2 break-keep">{book.title}</strong>
                        <span className="mt-auto text-[10px] opacity-70">{book.author}</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold tracking-wider text-brand-gold mb-2 block">{book.category}</span>
                      <h3 className="font-serif text-lg font-bold text-white leading-snug mb-1 break-keep">{book.title}</h3>
                      <p className="text-xs text-brand-cream/45 mb-3">{book.author}</p>
                      <p className="text-sm text-brand-cream/60 leading-relaxed hidden sm:block">{book.desc}</p>
                      <span className="block mt-4 text-xs text-brand-gold/60">0{i + 1} / 0{RECOMMENDED_BOOKS.length}</span>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </div>

          {/* 페이지 인디케이터 */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxBookIndex + 1 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBookIndex(i)}
                aria-label={`${i + 1}번째 보기`}
                className={`h-1.5 rounded-full transition-all ${bookIndex === i ? "w-8 bg-brand-gold" : "w-1.5 bg-brand-cream/25 hover:bg-brand-cream/50"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 등록 신청 폼 (DB) ────────────────────────────────────────────── */}
      <section ref={formRef} id="registration-form" className="py-20 md:py-28 px-6 bg-white scroll-mt-16">
        <div className="max-w-xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <span className="text-brand-sage text-sm font-bold tracking-[0.18em]">REGISTRATION</span>
            <h2 className="font-serif text-3xl font-normal text-brand-brown mt-3 mb-3">등록 신청</h2>
            <p className="text-brand-brown/55 text-sm leading-relaxed">아래 내용을 작성해 주시면 담당 사역자가 연락드립니다.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5 p-8 rounded-[2rem] bg-brand-cream/40 border border-brand-gold/20">
            {(fields ?? []).map((field: any) => (
              <div key={field.id}>
                <Label htmlFor={`field-${field.id}`} className="text-brand-brown/80 font-medium text-sm">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </Label>
                {field.fieldType === "text" && (
                  <Input id={`field-${field.id}`} placeholder={field.placeholder} value={fieldValues[field.label] ?? ""} onChange={(e) => setValue(field.label, e.target.value)} className="mt-1.5" />
                )}
                {field.fieldType === "number" && (
                  <Input id={`field-${field.id}`} type="tel" placeholder={field.placeholder} value={fieldValues[field.label] ?? ""} onChange={(e) => setValue(field.label, e.target.value)} className="mt-1.5" />
                )}
                {field.fieldType === "dropdown" && (
                  <Select value={fieldValues[field.label] ?? ""} onValueChange={(v) => setValue(field.label, v)}>
                    <SelectTrigger id={`field-${field.id}`} className="mt-1.5">
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {(field.options ?? []).map((opt: string) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {field.fieldType === "textarea" && (
                  <Textarea id={`field-${field.id}`} placeholder={field.placeholder} value={fieldValues[field.label] ?? ""} onChange={(e) => setValue(field.label, e.target.value)} className="mt-1.5" rows={3} />
                )}
              </div>
            ))}
            <Button type="submit" className="w-full mt-2 bg-brand-brown hover:bg-brand-sage text-brand-cream rounded-full py-3 text-base font-semibold transition-colors" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "제출 중..." : "신청하기"}
            </Button>
          </form>
        </div>
      </section>
    </PublicPageLayout>
  );
}
