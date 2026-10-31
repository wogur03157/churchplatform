import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpRight, Play, X } from "lucide-react";
import { faithQuestions } from "./faithQuestions";
import "./faith-journey.css";

const videos = [
  { id: "btWZh_moadk", title: "하나님은 어떤 분일까요?", name: "하나님 God" },
  {
    id: "6KRWLAH3Yo8",
    title: "예수님이 전하신 좋은 소식",
    name: "하나님 나라의 복음",
  },
  {
    id: "_y4X0Y1nu5E",
    title: "예수님을 더 깊이 알아가는 시간",
    name: "히브리서 개요",
  },
];

function QuestionScene({
  question,
  answer,
  index,
  progress,
  active,
}: {
  question: string;
  answer: string;
  index: number;
  progress: MotionValue<number>;
  active: boolean;
}) {
  const start = index / faithQuestions.length;
  const span = 1 / faithQuestions.length;
  const opacity = useTransform(
    progress,
    [start, start + span * 0.15, start + span * 0.85, start + span],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    [start, start + span * 0.15, start + span * 0.85, start + span],
    [36, 0, 0, -24]
  );
  const answerOpacity = useTransform(
    progress,
    [start + span * 0.38, start + span * 0.55],
    [0, 1]
  );
  const answerY = useTransform(
    progress,
    [start + span * 0.38, start + span * 0.55],
    [30, 0]
  );
  return (
    <motion.article
      className="faith-scene"
      style={{ opacity, y }}
      aria-hidden={!active}
    >
      <span className="faith-chapter">
        QUESTION {String(index + 1).padStart(2, "0")}
      </span>
      <h3>{question}</h3>
      <motion.p style={{ opacity: answerOpacity, y: answerY }}>{answer}</motion.p>
    </motion.article>
  );
}

function VideoPopup({
  video,
  onClose,
}: {
  video: (typeof videos)[number];
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="faith-video-popup"
      aria-labelledby="faith-video-popup-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          onClose();
      }}
    >
      <div className="faith-video-popup-header">
        <h2 id="faith-video-popup-title">{video.name}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="영상 팝업 닫기"
          autoFocus
        >
          <X size={24} aria-hidden="true" />
        </button>
      </div>
      <div className="faith-video-popup-player">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </dialog>
  );
}

function StoryVideo({
  video,
  index,
}: {
  video: (typeof videos)[number];
  index: number;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <article className="faith-video-card">
      <div className="faith-video-media">
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${video.name} 팝업으로 재생`}
          aria-haspopup="dialog"
        >
          <img
            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
          />
          <span className="faith-play">
            <Play size={24} fill="currentColor" aria-hidden="true" />
          </span>
        </button>
      </div>
      <span className="faith-video-number">
        STORY {String(index + 1).padStart(2, "0")}
      </span>
      <h3>{video.title}</h3>
      <button
        className="faith-video-title-button"
        type="button"
        onClick={() => setPlaying(true)}
        aria-haspopup="dialog"
      >
        {video.name} <Play size={15} aria-hidden="true" />
      </button>
      <p>바이블프로젝트 · 한국어</p>
      {playing && (
        <VideoPopup video={video} onClose={() => setPlaying(false)} />
      )}
    </article>
  );
}

export default function FaithJourney() {
  const ref = useRef<HTMLElement>(null);
  const storiesRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActive(
      Math.min(faithQuestions.length - 1, Math.floor(value * faithQuestions.length))
    );
  });
  const sunset = useTransform(
    scrollYProgress,
    [0, 0.15, 0.45, 0.65, 0.9],
    [0, 0, 0.85, 0.9, 0.2]
  );
  const night = useTransform(
    scrollYProgress,
    [0, 0.48, 0.78, 1],
    [0, 0, 0.65, 0.97]
  );
  const stars = useTransform(scrollYProgress, [0.65, 0.95], [0, 0.7]);
  const shade = useTransform(scrollYProgress, [0, 0.4, 1], [0.12, 0.2, 0.45]);

  return (
    <>
      <section
        ref={ref}
        id="faith-journey-section"
        className={`faith-journey${reducedMotion ? " faith-journey-reduced" : ""}`}
        aria-labelledby="jesus-faq-title"
      >
        <div className="faith-stage">
          <div className="faith-landscape" aria-hidden="true" />
          <motion.div
            className="faith-sunset"
            style={{ opacity: sunset }}
            aria-hidden="true"
          />
          <motion.div
            className="faith-night"
            style={{ opacity: night }}
            aria-hidden="true"
          />
          <motion.div
            className="faith-stars"
            style={{ opacity: stars }}
            aria-hidden="true"
          />
          <motion.div
            className="faith-shade"
            style={{ opacity: shade }}
            aria-hidden="true"
          />
          <div className="faith-vignette" aria-hidden="true" />
          <header className="faith-heading">
            <span>QUESTIONS &amp; FAITH</span>
            <h2 id="jesus-faq-title">자주 하는 질문</h2>
          </header>
          <button
            className="faith-section-button faith-previous"
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
            }}
          >
            <ArrowUp size={18} aria-hidden="true" /> 이전 섹션으로 넘어가기
          </button>
          <button
            className="faith-section-button faith-skip"
            type="button"
            onClick={() => {
              storiesRef.current?.focus({ preventScroll: true });
              storiesRef.current?.scrollIntoView({
                behavior: reducedMotion ? "instant" : "smooth",
                block: "start",
              });
            }}
          >
            다음 섹션으로 넘어가기 <ArrowDown size={14} aria-hidden="true" />
          </button>
          {reducedMotion ? (
            <div className="faith-static-questions">
              {faithQuestions.map(([question, answer], index) => (
                <article key={question}>
                  <span>QUESTION {index + 1}</span>
                  <h3>{question}</h3>
                  <p>{answer}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="faith-scenes">
              {faithQuestions.map(([question, answer], index) => (
                <QuestionScene
                  key={question}
                  question={question}
                  answer={answer}
                  index={index}
                  progress={scrollYProgress}
                  active={active === index}
                />
              ))}
            </div>
          )}
          <div className="faith-footer" aria-hidden="true">
            <span>SCROLL TO DISCOVER</span>
            <div className="faith-progress">
              <motion.div style={{ scaleX: scrollYProgress }} />
            </div>
            <span>
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(faithQuestions.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </section>
      <section
        ref={storiesRef}
        id="faith-stories"
        className="faith-stories"
        aria-labelledby="faith-stories-title"
        tabIndex={-1}
      >
        <div className="faith-stories-inner">
          <header>
            <span className="faith-eyebrow">STORIES OF FAITH</span>
            <h2 id="faith-stories-title">질문을 담은 이야기</h2>
            <p>마음에 남은 질문을, 이야기 속에서 조금 더 깊이 만나보세요.</p>
          </header>
          <div className="faith-video-grid">
            {videos.map((video, index) => (
              <StoryVideo key={video.id} video={video} index={index} />
            ))}
          </div>
          <a className="faith-welcome" href="/community/new-member">
            함께 알아가고 싶다면 <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
      </section>
    </>
  );
}
