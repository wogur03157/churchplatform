import { useLayoutEffect, useRef } from "react";
import { ArrowUp, Cross, UserPlus, MessageSquare } from "lucide-react";
import { useLocation } from "wouter";

export default function FloatingHelp({
  onPrayerRequest,
  faithJourneySectionId = "faith-journey-section",
}: {
  onPrayerRequest: () => void;
  faithJourneySectionId?: string;
}) {
  const floatingHelpRef = useRef<HTMLElement>(null);
  const [, navigate] = useLocation();

  useLayoutEffect(() => {
    const labels =
      floatingHelpRef.current?.querySelectorAll<HTMLElement>(
        ".floating-help-button span"
      );
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        (entry.target.parentElement as HTMLElement)?.style.setProperty(
          "--expanded-width",
          `${Math.ceil(entry.contentRect.width) + 32}px`
        );
      }
    });
    labels?.forEach((label) => observer.observe(label));
    return () => observer.disconnect();
  }, []);

  const scrollToFaithJourney = () => {
    const el = document.getElementById(faithJourneySectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      ref={floatingHelpRef}
      className="floating-help"
      aria-label="신앙과 새가족 빠른 안내"
    >
      <button
        type="button"
        className="floating-help-button floating-help-jesus"
        aria-label="예수님은 누구시죠?"
        onClick={scrollToFaithJourney}
      >
        <Cross size={22} aria-hidden="true" />
        <span>예수님은 누구시죠?</span>
      </button>
      <button
        type="button"
        className="floating-help-button floating-help-welcome"
        aria-label="새로 오셨다면?"
        onClick={() => navigate("/community/new-member")}
      >
        <UserPlus size={22} aria-hidden="true" />
        <span>새로 오셨다면?</span>
      </button>
      <button
        type="button"
        className="floating-help-button floating-help-prayer"
        aria-label="고민이 있나요?"
        onClick={onPrayerRequest}
      >
        <MessageSquare size={22} aria-hidden="true" />
        <span>고민이 있나요?</span>
      </button>
      <button
        type="button"
        className="floating-help-button floating-help-top"
        aria-label="맨 위로 올라가기"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          })
        }
      >
        <ArrowUp size={22} aria-hidden="true" />
        <span>맨 위로 올라가기</span>
      </button>
    </nav>
  );
}
