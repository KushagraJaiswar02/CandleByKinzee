'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function MobileCollections({ collections }) {
  return (
    <section className="mobile-collections-section mobile-full-bleed">
      <div className="mobile-section-heading">
        <p className="eyebrow">Shop by Collection</p>
        <h2>Explore Our Collections</h2>
      </div>

      <div className="mobile-collections-track" aria-label="Candle collections">
        {collections.map((collection) => (
          <Link 
            href={collection.link} 
            key={collection.name}
            className="mobile-collection-panel"
          >
            <img src={collection.image} alt={collection.name} loading="lazy" />
            <div className="mobile-collection-panel-overlay">
              <div className="mobile-collection-panel-content">
                <h3>{collection.name}</h3>
                <span className="mobile-collection-panel-arrow" aria-hidden="true">
                  <ChevronRight size={18} strokeWidth={2} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
