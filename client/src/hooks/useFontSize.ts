import { useEffect, useState } from "react";

const STORAGE_KEY = "font-size-level";

type FontSizeLevel = "small" | "medium" | "large";

const FONT_SIZE_MAP: Record<FontSizeLevel, string> = {
  small: "100%",
  medium: "112.5%",
  large: "125%",
};

const LABELS: Record<FontSizeLevel, string> = {
  small: "가",
  medium: "가",
  large: "가",
};

function applyFontSize(level: FontSizeLevel) {
  document.documentElement.style.fontSize = FONT_SIZE_MAP[level];
}

export function useFontSize() {
  const [level, setLevel] = useState<FontSizeLevel>(() => {
    return (localStorage.getItem(STORAGE_KEY) as FontSizeLevel) ?? "medium";
  });

  useEffect(() => {
    applyFontSize(level);
  }, [level]);

  // 초기 적용
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as FontSizeLevel) ?? "medium";
    applyFontSize(saved);
  }, []);

  const change = (next: FontSizeLevel) => {
    setLevel(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return { level, change, LABELS };
}

export type { FontSizeLevel };
