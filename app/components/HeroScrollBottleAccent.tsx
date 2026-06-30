'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

const BOTTLE_BG = "url('/images/hero-bottle-scroll.png')";

type Props = {
  children: ReactNode;
};

function easeOutPow(t: number, p = 2.35) {
  return 1 - (1 - t) ** p;
}

export function HeroScrollBottleAccent({ children }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion() === true;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const x = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 0;
    const t = Math.min(1, Math.max(0, p / 0.8));
    const eased = easeOutPow(t);
    return -200 * (1 - eased);
  });

  const y = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 0;
    const t = Math.min(1, Math.max(0, p / 0.8));
    const eased = easeOutPow(t);
    return 36 * (1 - eased);
  });

  const opacity = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 1;
    const t = Math.min(1, Math.max(0, p / 0.38));
    return easeOutPow(t);
  });

  return (
    <section
      ref={ref}
      className="relative isolate overflow-x-clip bg-gradient-to-br from-gray-50 to-white"
    >
      {/* Desktop (lg+): hidden off the left, eases into bottom-left while scrolling the hero */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute z-0 bottom-0 left-0 hidden h-[min(80vh,640px)] w-[min(54vw,520px)] xl:h-[min(82vh,680px)] xl:w-[min(56vw,560px)] lg:block"
        style={{ x, y, opacity }}
      >
        <div
          className="h-full w-full opacity-[0.48] xl:opacity-[0.55]"
          style={{
            backgroundImage: BOTTLE_BG,
            backgroundSize: 'contain',
            backgroundPosition: 'left bottom',
            backgroundRepeat: 'no-repeat',
            WebkitMaskImage:
              'radial-gradient(ellipse 96% 92% at 12% 88%, #000 0%, transparent 58%)',
            maskImage:
              'radial-gradient(ellipse 96% 92% at 12% 88%, #000 0%, transparent 58%)',
          }}
        />
      </motion.div>

      <div className="relative z-10">{children}</div>
    </section>
  );
}
