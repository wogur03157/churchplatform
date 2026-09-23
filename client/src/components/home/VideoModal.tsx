import { X } from "lucide-react";
import React, { useEffect } from "react";

interface VideoModalProps {
  title: string;
  embedUrl: string;
  onClose: () => void;
}

export default function VideoModal({ title, embedUrl, onClose }: VideoModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-4xl bg-black rounded-[2rem] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--color-brand-brown)] text-white">
          <h3 className="font-serif text-base md:text-lg font-semibold line-clamp-1">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Video */}
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            title={title}
            allow="autoplay; encrypted-media"
          />
        </div>
      </div>
    </div>
  );
}
