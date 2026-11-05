import { motion } from 'framer-motion';
import type React from 'react';
import { Clock,MonitorPlay } from 'lucide-react';
export type SermonItem = {
  title: string;
  sermonTitle: string;
  type: string;
  date: string;
  passage: string;
  embedUrl: string;
  imageUrl: string;
};

export default function SermonCard({ sermon,index,goldAccent,onPlay }: {
  sermon: SermonItem;
  index: number;
  goldAccent: boolean;
  onPlay: (video: { title: string; embedUrl: string }) => void;
}&React.Attributes) {
  return (<motion.div

    initial={{ opacity: 0,y: 15 }}
    animate={{ opacity: 1,y: 0 }}
    transition={{ delay: Math.min(0.05+(index%6)*0.05,0.4) }}
    className="group cursor-pointer text-left bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-md transition-shadow"
    onClick={() => onPlay({
      title: sermon.title,
      embedUrl: sermon.embedUrl
    })}
  >
    <div className="relative aspect-video rounded-[1.5rem] overflow-hidden mb-2 md:mb-4">
      <img
        src={sermon.imageUrl}
        alt={sermon.sermonTitle}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors flex items-center justify-center">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-500">
          <div className={`w-11 h-11 ${goldAccent? 'bg-brand-gold':'bg-brand-sage'} rounded-full flex items-center justify-center shadow-md`}>
            <MonitorPlay className="w-5 h-5 fill-current" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 px-3 py-1 bg-brand-brown/85 backdrop-blur-sm text-brand-cream text-[0.5625rem] uppercase tracking-wider rounded-full font-medium">
        {sermon.type}
      </div>
    </div>
    <div className="px-1">
      <h3 className="sermon-card-title font-serif text-brand-brown font-bold mb-1 md:mb-2 group-hover:text-brand-sage transition-colors leading-snug line-clamp-1">
        {sermon.sermonTitle}
      </h3>
      <div className="flex items-center gap-3 text-brand-brown/65 text-xs">
        <span className="flex items-center gap-1 font-medium"><Clock className="w-3.5 h-3.5" /> {sermon.date}</span>
        <span className="w-px h-2.5 bg-brand-gold/40"></span>
        <span className="font-semibold text-brand-sage">{sermon.passage}</span>
      </div>
    </div>
  </motion.div>);
}
