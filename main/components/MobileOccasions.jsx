'use client';

import React from 'react';
import Link from 'next/link';

export function MobileOccasions({ occasions }) {
  return (
    <section className="mobile-occasions-section">
      <div className="mobile-section-heading">
        <p className="eyebrow">Curated Celebrations</p>
        <h2>Crafted For Every Occasion</h2>
      </div>

      <div className="mobile-occasions-dynamic-grid">
        {occasions.map((occasion, index) => (
          <Link 
            href={occasion.link} 
            key={occasion.name} 
            className={`mobile-occasion-tile tile-${index}`}
          >
            <div className="mobile-occasion-tile-img-frame">
              <img src={occasion.image} alt={occasion.name} loading="lazy" />
              <div className="mobile-occasion-tile-overlay" aria-hidden="true" />
            </div>
            <div className="mobile-occasion-tile-content">
              <h3>{occasion.name}</h3>
              <span className="mobile-occasion-tile-link">Explore Story</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
