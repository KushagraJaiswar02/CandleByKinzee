'use client';

import React from 'react';
import Link from 'next/link';
import { FlameButton } from './FlameButton.jsx';

export function MobileHero() {
  return (
    <section className="mobile-hero">
      <div className="mobile-hero-bg-glow" aria-hidden="true" />

      <div className="mobile-hero-visual-frame">
        <img 
          src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=82" 
          alt="Premium Hand-poured Glass Candle" 
          className="mobile-hero-main-img"
          loading="eager"
        />
        <div className="mobile-hero-img-gradient" aria-hidden="true" />
      </div>

      <div className="mobile-hero-content-wrap">
        <p className="eyebrow">Handmade in India</p>
        <h1 className="mobile-hero-title">
          Scented Memories,<br />
          Hand-Poured.
        </h1>
        <p className="mobile-hero-sub">
          Soft floral candles, bespoke gift boxes, and custom pieces crafted in small batches after your order.
        </p>

        <div className="mobile-hero-ctas">
          <Link href="/shop" className="mobile-hero-cta-primary">
            <FlameButton type="button">Shop candles</FlameButton>
          </Link>
          <Link href="/custom-order" className="mobile-hero-cta-secondary">
            Request custom or bulk order
          </Link>
        </div>
      </div>
    </section>
  );
}
