import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from './components/Layout.jsx';
import { Hero } from './components/Hero.jsx';
import { LoadingScreen } from './components/LoadingScreen.jsx';
import { useIsMobile } from './hooks.js';
import { MobileHero } from './components/MobileHero.jsx';
import { MobileCollections } from './components/MobileCollections.jsx';
import { MobileBestSellers } from './components/MobileBestSellers.jsx';
import { MobileOccasions } from './components/MobileOccasions.jsx';

const COLLECTIONS = [
  {
    name: 'Floral Candles',
    image: 'https://images.unsplash.com/photo-1612180030229-3d6e1cc71854?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Floral candle bouquets'
  },
  {
    name: 'Glass Candles',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Daisy & glass candles'
  },
  {
    name: 'Candle Bouquets',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Candle bouquets & sticks'
  },
  {
    name: 'Gift Boxes',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Gift box sets'
  },
  {
    name: 'Festive Collection',
    image: 'https://images.unsplash.com/photo-1609137144813-2dbe4889b785?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Festive sweet collection'
  },
  {
    name: 'Wedding & Return Favours',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Return gift candles'
  }
];

const BEST_SELLERS = [
  {
    name: 'Daisy Glass Candles',
    description: 'Delightful daisy-topped wax in clear glass cups.',
    price: 'Rs. 140 each',
    image: 'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Daisy & glass candles'
  },
  {
    name: 'Floral Glass Candles',
    description: 'Embedded lavender and botanicals for premium scent diffusion.',
    price: 'Rs. 140 each',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Daisy & glass candles'
  },
  {
    name: 'Bubble Candles',
    description: 'Iconic, multi-colored bobble cube accent piece.',
    price: 'Rs. 80 each',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Bobble candles'
  },
  {
    name: 'Heart Candles',
    description: 'Textured hearts in pastel shades, perfect for special dates.',
    price: 'Rs. 80 each',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Heart collection'
  },
  {
    name: 'Floral Designer Candles',
    description: 'Wax bowl art with real pearl finishes and red rose petals.',
    price: 'Rs. 200 each',
    image: 'https://images.unsplash.com/photo-1572726729207-a78d6eab18aa?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Floral candle bouquets'
  }
];

const OCCASIONS = [
  {
    name: 'Weddings',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Return gift candles'
  },
  {
    name: 'Birthdays',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Gift box sets'
  },
  {
    name: 'Baby Showers',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Gift favour candles'
  },
  {
    name: 'Anniversaries',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Heart collection'
  },
  {
    name: 'Festivals',
    image: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Festive sweet collection'
  },
  {
    name: 'Corporate Gifting',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    link: '/collections/Gift box sets'
  }
];

const GIFT_BOXES = [
  {
    name: 'Birthday Bliss Set',
    description: 'Custom birthday peony and number candles, with wax warmer and heart melts.',
    price: 'Rs. 450 set',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Gift box sets',
    gridClass: 'giftbox-item--large'
  },
  {
    name: 'Heartful Hearth Set',
    description: 'Textured hearts, ridged pillars, and premium aromatic oil diffuser blends.',
    price: 'Rs. 450 set',
    image: 'https://images.unsplash.com/photo-1608798934528-8396f7c8f95c?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Gift box sets',
    gridClass: 'giftbox-item--medium'
  },
  {
    name: 'Seas & Skies Spa Set',
    description: 'Ocean jar candles and terracotta accents for a tranquil relaxation retreat.',
    price: 'Rs. 450 set',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Gift box sets',
    gridClass: 'giftbox-item--small-left'
  },
  {
    name: 'Heart Melt Set',
    description: 'Includes a loving heart tin, elegant wax warmer, and clean burning tealights.',
    price: 'Rs. 450 set',
    image: 'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=800&q=80',
    link: '/collections/Gift box sets',
    gridClass: 'giftbox-item--small-right'
  }
];

export default function App() {
  const [heroReady, setHeroReady] = useState(() => !!sessionStorage.getItem('kinzee-loaded'));
  const isMobile = useIsMobile();

  const handleLoadComplete = useCallback(() => setHeroReady(true), []);

  return (
    <>
      <LoadingScreen onComplete={handleLoadComplete} />
      <Layout>
        {isMobile ? <MobileHero /> : <Hero ready={heroReady} />}

        {/* SECTION 1 — SHOP BY COLLECTION */}
        {isMobile ? (
          <MobileCollections collections={COLLECTIONS} />
        ) : (
          <section className="section shop-by-collection">
            <div className="section-heading" style={{ margin: '0 auto 48px', textAlign: 'center', maxWidth: '640px' }}>
              <p className="eyebrow">Shop by Collection</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', margin: '12px 0 16px', color: 'var(--rose-dark)' }}>Explore Our Collections</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>Beautiful handcrafted candles curated for every occasion.</p>
            </div>
            <div className="collection-grid">
              {COLLECTIONS.map((collection) => (
                <Link to={collection.link} key={collection.name} className="collection-card">
                  <div className="collection-card-img-wrapper">
                    <img src={collection.image} alt={collection.name} loading="lazy" />
                  </div>
                  <div className="collection-card-overlay">
                    <div className="collection-card-content">
                      <h3>{collection.name}</h3>
                      <span className="collection-card-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2 — BEST SELLERS */}
        {isMobile ? (
          <MobileBestSellers items={BEST_SELLERS} />
        ) : (
          <section className="section best-sellers" style={{ background: 'var(--ivory)' }}>
            <div className="section-heading" style={{ margin: '0 auto 48px', textAlign: 'center', maxWidth: '640px' }}>
              <p className="eyebrow">Customer Favourites</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', margin: '12px 0 16px', color: 'var(--rose-dark)' }}>Our Best Sellers</h2>
            </div>
            <div className="bestsellers-grid">
              {BEST_SELLERS.map((item) => (
                <div key={item.name} className="bestseller-card">
                  <div className="bestseller-img-wrapper">
                    <img src={item.image} alt={item.name} loading="lazy" />
                  </div>
                  <div className="bestseller-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="bestseller-meta">
                      <span className="bestseller-price">{item.price}</span>
                      <Link to={item.link}>
                        <button className="bestseller-btn" type="button">Shop</button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3 — SHOP BY OCCASION */}
        {isMobile ? (
          <MobileOccasions occasions={OCCASIONS} />
        ) : (
          <section className="section shop-by-occasion">
            <div className="section-heading" style={{ margin: '0 auto 48px', textAlign: 'center', maxWidth: '640px' }}>
              <p className="eyebrow">Curated Celebrations</p>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', margin: '12px 0 16px', color: 'var(--rose-dark)' }}>Crafted For Every Occasion</h2>
            </div>
            <div className="occasions-grid">
              {OCCASIONS.map((occasion) => (
                <Link to={occasion.link} key={occasion.name} className="occasion-card">
                  <img src={occasion.image} alt={occasion.name} loading="lazy" />
                  <div className="occasion-card-overlay" />
                  <h3>{occasion.name}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* BRAND STORY EDITORIAL DISCOVER */}
        <section className="home-story-discover-section">
          <div className="home-story-discover-inner">
            <p className="home-story-discover-eyebrow">The Craft</p>
            <h2>Handcrafted in small batches.</h2>
            <Link to="/story" className="home-story-discover-link">
              <span>Read Our Story</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        </section>

        {/* SECTION 4 — GIFT BOX COLLECTION */}
        <section className="section giftbox-showcase" style={{ background: 'var(--ivory)' }}>
          <div className="section-heading" style={{ margin: '0 auto 48px', textAlign: 'center', maxWidth: '640px' }}>
            <p className="eyebrow">Elegant Presentation</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', margin: '12px 0 16px', color: 'var(--rose-dark)' }}>Gift Box Collection</h2>
          </div>
          <div className="giftbox-grid">
            {GIFT_BOXES.map((box) => (
              <div key={box.name} className={`giftbox-item ${box.gridClass}`}>
                <div className="giftbox-img-wrapper">
                  <img src={box.image} alt={box.name} loading="lazy" />
                </div>
                <div className="giftbox-info">
                  <h3>{box.name}</h3>
                  <p>{box.description}</p>
                  <div className="giftbox-meta">
                    <span className="giftbox-price">{box.price}</span>
                    <Link to={box.link}>
                      <button className="giftbox-btn" type="button">Explore Set</button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Layout>
    </>
  );
}

