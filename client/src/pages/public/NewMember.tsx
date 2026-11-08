import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import { newMemberContent } from "@/content/new-member";

const fadeIn = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: "easeOut" as const } };

const { hero, firstVisit, registration, books, form } = newMemberContent;

function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={line}>
          {index > 0 && <br />}
          {line}
        </span>
      ))}
    </>
  );
}

export default function NewMember() {
  const [bookSlideIndex, setBookSlideIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const bookVisibleCount = windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3;
  const maxBookSlideIndex = Math.max(0, books.items.length - bookVisibleCount);
  useEffect(() => {
    setBookSlideIndex((previous) => Math.min(previous, maxBookSlideIndex));
  }, [maxBookSlideIndex]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLElement>(null);

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

  if (submitted) {
    return (
      <PublicPageLayout variant="copy">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-brand-sage/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-brand-sage" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-brand-brown mb-3">{form.successTitle}</h2>
            <p className="text-brand-brown/60 text-lg">{form.successBody}</p>
            <p className="text-brand-brown/50 mt-1">{form.successNote}</p>
          </div>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout variant="copy">
      <div className="min-h-screen bg-brand-cream font-sans pb-20">
        <header className="subpage-hero relative h-[48vh] min-h-[22.5rem] md:h-[46vh] md:min-h-[26.25rem] w-full overflow-hidden">
          <img
            src={hero.image}
            alt={hero.imageAlt}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#352f29]/90 via-[#4c443b]/65 to-[#4c443b]/10" />
          <div className="welcome-hero-content relative max-w-[var(--content-max)] mx-auto h-full px-6 flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl text-left text-white"
            >
              <span className="inline-flex items-center gap-2 text-brand-gold text-xs md:text-sm font-semibold tracking-[0.22em] mb-5">
                <span className="w-8 h-px bg-brand-gold" />
                {hero.eyebrow}
              </span>
              <h1 className="text-4xl md:text-6xl font-serif font-light leading-[1.15] mb-5">
                <span className="subpage-title-mobile">{hero.titleMobile}</span>
                <span className="subpage-title-desktop">{hero.titleDesktop}</span>
              </h1>
              <p className="text-base md:text-xl text-white/85 font-light leading-relaxed max-w-xl">
                {hero.description}
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => document.getElementById("first-visit-guide")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="inline-flex items-center gap-2 bg-brand-gold text-brand-brown px-5 py-3 rounded-full text-sm font-semibold hover:bg-white transition-colors cursor-pointer"
                >
                  {hero.primaryCta} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { window.location.href = "/"; }}
                  className="inline-flex items-center gap-2 border border-white/35 text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> {hero.secondaryCta}
                </button>
              </div>
            </motion.div>
          </div>
        </header>

        <section id="first-visit-guide" className="py-20 md:py-28 px-6 bg-[#F4F0E7] scroll-mt-24" aria-labelledby="first-visit-title">
          <div className="max-w-[var(--content-max)] mx-auto">
            <motion.div {...fadeIn} className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-brand-sage text-sm font-bold tracking-[0.18em]">{firstVisit.eyebrow}</span>
              <h2 id="first-visit-title" className="font-serif text-3xl-compact md:text-5xl font-normal text-brand-brown mt-4 mb-5">{firstVisit.title}</h2>
              <p className="text-brand-brown/65 leading-relaxed">
                <Lines lines={firstVisit.description} />
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {firstVisit.steps.map((step, index) => (
                <motion.article key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-left bg-white rounded-[2rem] p-5 md:p-6 border border-brand-gold/15 shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-brand-sage tracking-[0.15em]">STEP {index + 1}</span>
                    <h3 className="first-visit-step-title font-serif text-xl font-bold text-brand-brown mt-1 mb-2 md:mt-2 md:mb-3">{step.title}</h3>
                    <p className="first-visit-step-description text-base text-brand-brown/65 leading-relaxed min-h-0 md:min-h-[4.125rem]">{step.body}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <div className="relative z-10 flex justify-center h-0">
          <button type="button" onClick={() => document.getElementById("registration-guide")?.scrollIntoView({ behavior: "smooth", block: "start" })} aria-label="등록과 정착 안내로 이동" className="w-14 h-14 -translate-y-1/2 rounded-full bg-white border border-brand-gold/30 text-brand-sage shadow-sm flex items-center justify-center hover:bg-brand-sage hover:text-white transition-colors cursor-pointer">
            <ArrowRight className="w-6 h-6 rotate-90" aria-hidden="true" />
          </button>
        </div>

        <section id="registration-guide" className="py-20 md:py-28 px-6 bg-brand-cream scroll-mt-24" aria-labelledby="registration-title">
          <div className="max-w-[var(--content-max)] mx-auto">
            <motion.div {...fadeIn} className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-brand-sage text-sm font-bold tracking-[0.18em]">{registration.eyebrow}</span>
              <h2 id="registration-title" className="font-serif text-3xl-compact md:text-5xl font-normal text-brand-brown mt-4 mb-5">{registration.title}</h2>
              <p className="text-brand-brown/65 leading-relaxed">{registration.description[0]}</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {registration.steps.map((step, index) => (
                <motion.article key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-left flex flex-col gap-4">
                  <div className="w-full aspect-[4/3] overflow-hidden rounded-[2rem]">
                    <img src={step.image} alt={`${step.title} 안내 이미지`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-sage tracking-[0.15em]">STEP {index + 1}</span>
                    <h3 className="first-visit-step-title font-serif text-xl font-bold text-brand-brown mt-1 mb-2 md:mt-2 md:mb-3">{step.title}</h3>
                    <p className="first-visit-step-description text-base text-brand-brown/65 leading-relaxed min-h-0 md:min-h-[4.125rem]">{step.body}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 px-6 bg-brand-brown/90 text-brand-cream overflow-hidden" aria-labelledby="recommended-books-title">
          <div className="max-w-[var(--content-max)] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-7 mb-12">
              <motion.div {...fadeIn} className="text-left max-w-2xl">
                <span className="text-brand-gold text-sm font-bold tracking-[0.18em]">{books.eyebrow}</span>
                <h2 id="recommended-books-title" className="font-serif text-3xl-compact md:text-5xl font-normal mt-4 mb-5">{books.title}</h2>
                <p className="text-brand-cream/65 leading-relaxed">{books.description[0]}</p>
              </motion.div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setBookSlideIndex((previous) => Math.max(0, previous - 1))}
                  disabled={bookSlideIndex === 0}
                  aria-label="이전 추천도서 보기"
                  className="w-12 h-12 rounded-full border border-brand-cream/25 flex items-center justify-center hover:bg-brand-cream hover:text-brand-brown disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors cursor-pointer disabled:cursor-default"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setBookSlideIndex((previous) => Math.min(maxBookSlideIndex, previous + 1))}
                  disabled={bookSlideIndex === maxBookSlideIndex}
                  aria-label="다음 추천도서 보기"
                  className="w-12 h-12 rounded-full border border-brand-cream/25 flex items-center justify-center hover:bg-brand-cream hover:text-brand-brown disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-colors cursor-pointer disabled:cursor-default"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              className="overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold rounded-[2rem]"
              tabIndex={0}
              role="region"
              aria-label="추천도서 슬라이드"
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") setBookSlideIndex((previous) => Math.max(0, previous - 1));
                if (event.key === "ArrowRight") setBookSlideIndex((previous) => Math.min(maxBookSlideIndex, previous + 1));
              }}
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                dragSnapToOrigin
                dragMomentum={false}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) < 40 && Math.abs(info.velocity.x) < 400) return;
                  const direction = (Math.abs(info.offset.x) >= 40 ? info.offset.x : info.velocity.x) < 0 ? 1 : -1;
                  setBookSlideIndex((previous) => Math.max(0, Math.min(maxBookSlideIndex, previous + direction)));
                }}
                className="cursor-grab active:cursor-grabbing select-none"
                style={{ touchAction: "pan-y" }}
              >
                <motion.div
                  className="flex -mx-3"
                  animate={{ x: `-${bookSlideIndex * (100 / bookVisibleCount)}%` }}
                  transition={{ type: "spring", stiffness: 240, damping: 28 }}
                >
                  {books.items.map((book, index) => (
                    <article key={book.title} className="shrink-0 px-3" style={{ width: `${100 / bookVisibleCount}%` }}>
                      <div className="recommended-book-card h-full bg-white/[0.07] border border-white/10 rounded-[2rem] p-6 md:p-7 flex gap-6 items-center hover:bg-white/10 transition-colors">
                        <div
                          className="relative w-[7.375rem] sm:w-[8.25rem] aspect-[2/3] rounded-r-md rounded-l-sm shrink-0 shadow-[12px_16px_28px_rgba(0,0,0,0.28)] overflow-hidden text-left"
                          style={{ backgroundColor: book.cover, color: book.accent }}
                        >
                          <img
                            src={book.image}
                            alt={`${book.title} 표지`}
                            draggable={false}
                            className="absolute inset-0 z-10 w-full h-full object-cover"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                          <div className="absolute inset-y-0 left-0 w-3 bg-black/15 border-r border-white/10" />
                          <div className="h-full pl-6 pr-4 py-5 flex flex-col">
                            <span className="text-3xs tracking-[0.2em] opacity-75">YOUNGSHIN SELECT</span>
                            <BookOpen className="w-5 h-5 mt-6 opacity-80" />
                            <strong className="font-serif text-base sm:text-lg leading-snug mt-3 break-keep">{book.title}</strong>
                            <span className="mt-auto text-2xs opacity-80">{book.author}</span>
                          </div>
                        </div>
                        <div className="recommended-book-copy text-left min-w-0">
                          <span className="inline-block text-xs font-bold tracking-wider text-brand-gold mb-3">{book.category}</span>
                          <h3 className="font-serif text-xl md:text-2xl font-bold text-white leading-snug mb-3 break-keep">{book.title}</h3>
                          <p className="text-xs text-brand-cream/45 mb-4">{book.author}</p>
                          <p className="hidden sm:block text-sm text-brand-cream/65 leading-relaxed">{book.description}</p>
                          <span className="block mt-5 text-xs text-brand-gold/65">0{index + 1} / 0{books.items.length}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </motion.div>
              </motion.div>
            </div>

            <div className="flex justify-center gap-2 mt-8" aria-label="추천도서 슬라이드 위치">
              {Array.from({ length: maxBookSlideIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setBookSlideIndex(index)}
                  aria-label={`${index + 1}번째 도서 묶음 보기`}
                  aria-current={bookSlideIndex === index ? "true" : undefined}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${bookSlideIndex === index ? "w-8 bg-brand-gold" : "w-1.5 bg-brand-cream/25 hover:bg-brand-cream/50"}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section ref={formRef} id="registration-form" className="py-20 md:py-28 px-6 bg-white scroll-mt-16">
          <div className="max-w-xl mx-auto">
            <motion.div {...fadeIn} className="text-center mb-10">
              <span className="text-brand-sage text-sm font-bold tracking-[0.18em]">{form.eyebrow}</span>
              <h2 className="font-serif text-3xl font-normal text-brand-brown mt-3 mb-3">{form.title}</h2>
              <p className="text-brand-brown/55 text-sm leading-relaxed">{form.description}</p>
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
                {submitMutation.isPending ? form.pendingLabel : form.submitLabel}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
}
