'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { FlameButton } from './FlameButton.jsx';

const HERO_IMAGES = {
  largeLeft: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=82',
  mediumRight: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=600&q=80',
  giftBox: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
  candle: 'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=600&q=80',
  smallTop: 'https://images.unsplash.com/photo-1572726729207-a78d6eab18aa?auto=format&fit=crop&w=600&q=80',
  decorBottom: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
};

const headlineLines = ['Candle by', 'Kinzee'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

function BokehLights({ reduceMotion }) {
  const lights = [
    { top: '10%', left: '5%', size: 450, delay: 0 },
    { top: '55%', left: '70%', size: 380, delay: 2 },
    { top: '25%', left: '45%', size: 300, delay: 4 },
    { top: '70%', left: '15%', size: 400, delay: 1 },
  ];

  return (
    <div className="hero-bokeh" aria-hidden="true">
      {lights.map((light, i) => (
        <motion.span
          key={i}
          className="hero-bokeh-light"
          style={{ top: light.top, left: light.left, width: light.size, height: light.size }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 8, -6, 0],
                  y: [0, -6, 4, 0],
                  opacity: [0.12, 0.22, 0.12, 0.12],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 16 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: light.delay }
          }
        />
      ))}
    </div>
  );
}

function LightParticles({ reduceMotion }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reduceMotion || !mounted) return null;

  const particles = Array.from({ length: 10 });
  return (
    <div className="hero-particles" aria-hidden="true">
      {particles.map((_, i) => {
        const size = Math.random() * 1.4 + 0.8;
        const left = `${Math.random() * 100}%`;
        const duration = Math.random() * 30 + 30;
        const delay = Math.random() * -30;
        return (
          <motion.span
            key={i}
            className="hero-particle"
            style={{
              left,
              width: size,
              height: size,
              bottom: '-20px',
            }}
            animate={{
              y: ['0vh', '-105vh'],
              x: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
              opacity: [0, 0.08, 0.18, 0.08, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: 'linear',
              delay,
            }}
          />
        );
      })}
    </div>
  );
}

function ParallaxCard({
  className,
  src,
  alt,
  depth,
  parallaxX,
  parallaxY,
  revealDelay,
  float,
  reduceMotion,
  rotate = 0,
  children,
}) {
  const x = useTransform(parallaxX, (v) => v * depth);
  const y = useTransform(parallaxY, (v) => v * depth);

  const floatDuration = 5 + depth * 3.5;
  const floatDelay = revealDelay * 1.5;

  return (
    <motion.div className={className} style={{ x, y, rotate }}>
      <div className="hero-product-glow" aria-hidden="true" />
      <motion.div
        className="hero-visual-card-inner"
        initial={{ opacity: 0, clipPath: 'inset(100% 0 0 0)' }}
        animate={
          float && !reduceMotion
            ? { opacity: 1, clipPath: 'inset(0% 0 0 0)', y: [0, -6, 0] }
            : { opacity: 1, clipPath: 'inset(0% 0 0 0)' }
        }
        transition={
          reduceMotion
            ? { duration: 1, delay: revealDelay, ease: [0.22, 1, 0.36, 1] }
            : float
              ? {
                  clipPath: { duration: 1, delay: revealDelay, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 1, delay: revealDelay },
                  y: { duration: floatDuration, repeat: Infinity, ease: 'easeInOut', delay: floatDelay },
                }
              : { duration: 1, delay: revealDelay, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <img src={src} alt={alt} loading="eager" />
        {children}
      </motion.div>
    </motion.div>
  );
}

function HeroVisual({ reduceMotion, parallaxX, parallaxY, imageScale }) {
  const depth = reduceMotion ? 0 : 1;

  return (
    <motion.div
      className="hero-visual"
      style={{ scale: imageScale }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <ParallaxCard
        className="hero-visual-card hero-visual-card--small-top"
        src={HERO_IMAGES.smallTop}
        alt=""
        depth={0.3 * depth}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        revealDelay={0.35}
        rotate={4}
        float
        reduceMotion={reduceMotion}
      />
      <ParallaxCard
        className="hero-visual-card hero-visual-card--back"
        src={HERO_IMAGES.mediumRight}
        alt=""
        depth={0.4 * depth}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        revealDelay={0.3}
        rotate={3}
        float
        reduceMotion={reduceMotion}
      />
      <ParallaxCard
        className="hero-visual-card hero-visual-card--gift"
        src={HERO_IMAGES.giftBox}
        alt=""
        depth={0.5 * depth}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        revealDelay={0.45}
        rotate={-3.5}
        float
        reduceMotion={reduceMotion}
      />
      <ParallaxCard
        className="hero-visual-card hero-visual-card--close"
        src={HERO_IMAGES.candle}
        alt=""
        depth={0.6 * depth}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        revealDelay={0.55}
        rotate={2.5}
        float
        reduceMotion={reduceMotion}
      />
      <ParallaxCard
        className="hero-visual-card hero-visual-card--decor-bottom"
        src={HERO_IMAGES.decorBottom}
        alt=""
        depth={0.2 * depth}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        revealDelay={0.6}
        rotate={-1.5}
        float
        reduceMotion={reduceMotion}
      />
      <ParallaxCard
        className="hero-visual-card hero-visual-card--main"
        src={HERO_IMAGES.largeLeft}
        alt="Hand-poured candle by Kinzee"
        depth={0.8 * depth}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        revealDelay={0.2}
        rotate={-2.5}
        float
        reduceMotion={reduceMotion}
      >
        {!reduceMotion && (
          <motion.span
            className="hero-flame-glow"
            aria-hidden="true"
            animate={{ opacity: [0.35, 0.55, 0.4, 0.5, 0.35], scale: [1, 1.05, 0.98, 1.03, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </ParallaxCard>
    </motion.div>
  );
}

export function Hero({ ready = true }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const parallaxY = useSpring(mouseY, { stiffness: 120, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1, 1.07]);
  const copyY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 40]);

  const handleMouseMove = useCallback(
    (event) => {
      if (reduceMotion || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x * 16);
      mouseY.set(y * 12);
    },
    [mouseX, mouseY, reduceMotion],
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  return (
    <motion.section
      ref={sectionRef}
      className="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hero-bg-interior" aria-hidden="true" />
      <div className="hero-bg-overlay" aria-hidden="true" />

      <BokehLights reduceMotion={reduceMotion} />
      <LightParticles reduceMotion={reduceMotion} />

      <motion.div className="hero-inner" style={{ y: copyY }}>
        <div className="hero-copy">
          {ready && (
            <>
              <motion.p className="eyebrow" {...fadeUp(0.15)}>
                Handmade in India, made after you order
              </motion.p>

              <h1>
                {headlineLines.map((line, i) => (
                  <motion.span
                    key={line}
                    className="hero-headline-line"
                    {...fadeUp(0.3 + i * 0.12)}
                  >
                    {line}
                  </motion.span>
                ))}
              </h1>

              <motion.p {...fadeUp(0.55)}>
                Soft floral candles, gift favours, bouquets, and custom pieces poured for real occasions.
              </motion.p>

              <motion.div className="actions" {...fadeUp(0.72)}>
                <Link href="/shop">
                  <FlameButton type="button">Shop candles</FlameButton>
                </Link>
                <Link className="secondary-link" href="/custom-order">
                  Request custom or bulk order
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {ready && (
          <HeroVisual
            reduceMotion={reduceMotion}
            parallaxX={parallaxX}
            parallaxY={parallaxY}
            imageScale={imageScale}
          />
        )}
      </motion.div>
    </motion.section>
  );
}
