import React from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  /** Invert colors for dark backgrounds */
  inverted?: boolean;
}

export default function SectionHeader({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  align = "left",
  className = "",
  inverted = false,
}: SectionHeaderProps) {
  const textAlign = align === "center" ? "text-center" : "text-left";
  const itemsAlign = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={`${textAlign} ${className}`}>
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 text-[var(--color-brand-sage)] font-medium mb-4 ${itemsAlign}`}
        >
          {eyebrowIcon && <span className="shrink-0">{eyebrowIcon}</span>}
          <span className="text-sm">{eyebrow}</span>
        </div>
      )}
      <h2
        className={`text-3xl md:text-4xl lg:text-5xl font-serif leading-tight tracking-tight mb-3 ${
          inverted
            ? "text-[var(--color-brand-cream)]"
            : "text-[var(--color-brand-brown)]"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-sm md:text-base leading-relaxed ${
            inverted
              ? "text-[var(--color-brand-gold)]/80"
              : "text-[var(--color-brand-brown)]/60"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
