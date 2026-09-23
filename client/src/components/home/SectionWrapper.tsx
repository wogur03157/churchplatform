import React from "react";

interface SectionWrapperProps {
  id?: string;
  bgVariant?: "white" | "cream" | "primary";
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function SectionWrapper({
  id,
  bgVariant = "white",
  children,
  className = "",
  noPadding = false,
}: SectionWrapperProps) {
  const bgClass =
    bgVariant === "cream"
      ? "bg-[var(--color-brand-cream)]"
      : bgVariant === "primary"
        ? "bg-[var(--color-brand-brown)] text-[var(--color-brand-cream)]"
        : "bg-white";

  return (
    <section
      id={id}
      className={`${bgClass} overflow-hidden ${noPadding ? "" : "py-16 md:py-24"} ${className}`}
    >
      {children}
    </section>
  );
}
