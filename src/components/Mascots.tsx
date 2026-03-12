"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const mascots = [
  { src: "/popcorn.png", alt: "Popcorn" },
  { src: "/donut.png", alt: "Donut" },
  { src: "/icecream.png", alt: "Ice Cream" },
];

interface MascotsProps {
  step: number;
  nomineeCount?: number;
}

export default function Mascots({ step, nomineeCount = 0 }: MascotsProps) {
  // On mobile: only show when few nominees (≤5) or on welcome/review/done screens
  const showOnMobile = nomineeCount <= 5;
  const [sequence] = useState(() => {
    const seq: number[] = [];
    let last = -1;
    for (let i = 0; i < 100; i++) {
      const available = [0, 1, 2].filter((n) => n !== last);
      const pick = available[Math.floor(Math.random() * available.length)];
      seq.push(pick);
      last = pick;
    }
    return seq;
  });
  const index = sequence[step % sequence.length];
  const isRight = step % 2 === 0;

  return (
    <div className={`fixed inset-0 z-10 pointer-events-none overflow-hidden ${showOnMobile ? "" : "hidden md:block"}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`mascot-${step}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 0.85, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-4"
          style={{ [isRight ? "right" : "left"]: 24 }}
        >
          <div className={isRight ? "-scale-x-100" : ""}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mascots[index].src}
              alt={mascots[index].alt}
              width={250}
              height={250}
              className="drop-shadow-xl w-[150px] h-[150px] md:w-[250px] md:h-[250px]"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
