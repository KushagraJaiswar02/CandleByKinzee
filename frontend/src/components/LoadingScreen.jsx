import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const SESSION_KEY = 'kinzee-loaded';

export function LoadingScreen({ onComplete }) {
  const reduceMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(SESSION_KEY));
  const [phase, setPhase] = useState('blank');

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!visible) {
      onCompleteRef.current?.();
      return undefined;
    }

    if (reduceMotion) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setVisible(false);
      onCompleteRef.current?.();
      return undefined;
    }

    const timers = [
      setTimeout(() => setPhase('logo'), 200),
      setTimeout(() => setPhase('ignite'), 600),
      setTimeout(() => setPhase('glow'), 900),
      setTimeout(() => setPhase('exit'), 1400),
      setTimeout(() => {
        sessionStorage.setItem(SESSION_KEY, '1');
        setVisible(false);
        onCompleteRef.current?.();
      }, 1900),
    ];

    return () => timers.forEach(clearTimeout);
  }, [visible, reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="loading-logo"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={
              phase === 'blank'
                ? { opacity: 0, scale: 0.92 }
                : { opacity: 1, scale: 1 }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="loading-wordmark">Candle by Kinzee</span>
            <motion.span
              className="loading-flame"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={
                phase === 'blank' || phase === 'logo'
                  ? { opacity: 0, scale: 0.3 }
                  : phase === 'ignite'
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 1, scale: 1 }
              }
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src="/logo.png" alt="Candle by Kinzee" className="loading-logo-img" />
              {(phase === 'glow' || phase === 'exit') && (
                <motion.span
                  className="loading-glow"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 0.7, 0.45], scale: [0.6, 1.4, 1.2] }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              )}
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
