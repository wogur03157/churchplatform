import React from "react";

interface HomeCardProps {
  imageUrl?: string | null;
  title: string;
  description?: string | null;
  badge?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function HomeCard({
  imageUrl,
  title,
  description,
  badge,
  href,
  onClick,
  className = "",
}: HomeCardProps) {
  const inner = (
    <div
      className={`group bg-white rounded-[2rem] border border-[var(--color-brand-gold)]/15 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${className}`}
      onClick={onClick}
    >
      {imageUrl && (
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {badge && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-[var(--color-brand-brown)]/80 backdrop-blur-sm text-[var(--color-brand-cream)] text-[10px] uppercase tracking-widest rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="p-5 md:p-6">
        <h3 className="font-serif text-lg text-[var(--color-brand-brown)] mb-2 group-hover:text-[var(--color-brand-sage)] transition-colors leading-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--color-brand-brown)]/60 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return <a href={href}>{inner}</a>;
  }
  return inner;
}
