'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from './CartContext.jsx';

export function PersistentCartBar() {
  const pathname = usePathname();
  const { cart, cartCount, cartTotal } = useCart();

  // Hide bar on bag page, checkout page, or admin pages
  if (pathname === '/bag' || pathname === '/checkout' || pathname?.startsWith('/admin')) {
    return null;
  }

  if (!cart || cart.length === 0 || cartCount === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 998,
          width: 'calc(100% - 32px)',
          maxWidth: '460px',
        }}
      >
        <Link
          href="/bag"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '100px',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.35), 0 0 0 1.5px rgba(181, 138, 60, 0.4)',
            textDecoration: 'none',
            backdropFilter: 'blur(10px)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(181, 138, 60, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b58a3c',
              }}
            >
              <ShoppingBag size={18} />
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#b58a3c',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartCount}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                {cartCount} {cartCount === 1 ? 'Candle' : 'Candles'} in your Bag
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Subtotal: <strong style={{ color: '#b58a3c' }}>₹{cartTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #b58a3c, #8a6423)',
              color: '#ffffff',
              padding: '8px 16px',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.3px',
              boxShadow: '0 2px 8px rgba(181, 138, 60, 0.3)',
            }}
          >
            <span>View Bag</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
