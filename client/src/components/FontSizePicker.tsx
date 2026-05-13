import { useFontSize, type FontSizeLevel } from "@/hooks/useFontSize";

const LEVELS: { value: FontSizeLevel; label: string; size: string }[] = [
  { value: "small",  label: "가", size: "text-xs" },
  { value: "medium", label: "가", size: "text-sm" },
  { value: "large",  label: "가", size: "text-base" },
];

export default function FontSizePicker({ dark = false }: { dark?: boolean }) {
  const { level, change } = useFontSize();

  const baseText = dark ? "text-primary-foreground/60" : "text-muted-foreground";
  const activeText = dark ? "text-primary-foreground font-bold" : "text-foreground font-bold";
  const activeBg = dark ? "bg-primary-foreground/20" : "bg-muted";

  return (
    <div className="flex items-center gap-1">
      <span className={`text-xs mr-1 ${baseText}`}>글자 크기</span>
      {LEVELS.map((l) => (
        <button
          key={l.value}
          onClick={() => change(l.value)}
          className={`px-2 py-1 rounded transition-colors ${l.size} ${
            level === l.value
              ? `${activeText} ${activeBg}`
              : `${baseText} hover:${activeText}`
          }`}
          aria-label={`글자 크기 ${l.label}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
