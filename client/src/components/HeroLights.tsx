import { useReducedMotion } from "framer-motion";
import { useState } from "react";

export default function HeroLights() {
  const reducedMotion = useReducedMotion();
  const createLight = (id: number, cycle = 0) => ({
    id,
    cycle,
    left: 10 + (id % 2) * 48 + Math.random() * 22,
    top: 5 + Math.floor((id % 7) / 2) * 24 + Math.random() * 10,
    size: 1.5 + Math.random() * 1.5,
    duration: 2.5 + Math.random() * 2.5,
    delay: 1 + Math.random() * 4,
  });
  const [lights, setLights] = useState(() =>
    Array.from({ length: 14 }, (_, id) => createLight(id))
  );

  if (reducedMotion) return null;

  return (
    <div className="hero-lights" aria-hidden="true">
      {(["left", "right"] as const).map((side, sideIndex) => (
        <div key={side} className={`hero-lights-side hero-lights-${side}`}>
          {lights.slice(sideIndex * 7, sideIndex * 7 + 7).map((light) => (
            <span
              key={`${light.id}-${light.cycle}`}
              className="hero-light"
              style={{
                left: `${light.left}%`,
                top: `${light.top}%`,
                width: light.size,
                height: light.size,
                animationDuration: `${light.duration}s`,
                animationDelay: `${light.delay}s`,
              }}
              onAnimationEnd={() =>
                setLights((current) =>
                  current.map((item) =>
                    item.id === light.id
                      ? createLight(item.id, item.cycle + 1)
                      : item
                  )
                )
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
