'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';

export function FlameButton({ children, ...props }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      className="primary-btn"
      whileHover={reduceMotion ? undefined : 'hover'}
      whileTap={reduceMotion ? undefined : 'press'}
      initial="rest"
      {...props}
    >
      <motion.span
        variants={{
          rest: { scale: 1, rotate: 0, y: 0 },
          hover: {
            scale: 1.15,
            rotate: [0, -8, 8, -5, 5, 0],
            transition: { duration: 0.65, ease: 'easeInOut' }
          },
          press: { scale: 0.9, rotate: 0 }
        }}
      >
        <Flame size={18} fill="currentColor" />
      </motion.span>
      {children}
    </motion.button>
  );
}
