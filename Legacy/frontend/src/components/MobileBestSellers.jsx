import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { animate } from 'framer-motion';

export function MobileBestSellers({ items }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);

  // Duplicate items for infinite seamless loop scrolling
  const doubledItems = [...items, ...items];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let intervalId;
    let timeoutId;

    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        const firstCard = track.firstElementChild;
        if (!firstCard) return;
        const itemWidth = firstCard.getBoundingClientRect().width + 20; // card width + 20px gap
        const currentScroll = track.scrollLeft;

        const originalLength = items.length;
        const maxScroll = originalLength * itemWidth;

        let startScroll = currentScroll;
        // Seamless loop snap
        if (currentScroll >= maxScroll - 10) {
          startScroll = currentScroll - maxScroll;
          track.scrollLeft = startScroll;
        }

        const targetScroll = startScroll + itemWidth;

        // Temporarily disable scroll snap to prevent browser snap overriding the animation frames
        track.style.scrollSnapType = 'none';

        // Animate with custom cubic-bezier ease curve
        animRef.current = animate(startScroll, targetScroll, {
          duration: 1.2,
          ease: [0.25, 1, 0.4, 1], // premium easeOut
          onUpdate: (latest) => {
            track.scrollLeft = latest;
          },
          onComplete: () => {
            // Restore scroll snap when the animation completes
            track.style.scrollSnapType = 'x mandatory';
          }
        });
      }, 3500);
    };

    startAutoScroll();

    const handleTouch = () => {
      if (animRef.current) {
        animRef.current.stop();
      }
      track.style.scrollSnapType = 'x mandatory';
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(startAutoScroll, 8000);
    };

    track.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      if (animRef.current) {
        animRef.current.stop();
      }
      if (track) {
        track.style.scrollSnapType = 'x mandatory';
        track.removeEventListener('touchstart', handleTouch);
      }
    };
  }, [items]);

  return (
    <section className="mobile-bestsellers-section mobile-full-bleed">
      <div className="mobile-section-heading">
        <p className="eyebrow">Customer Favourites</p>
        <h2>Our Best Sellers</h2>
      </div>

      <div ref={trackRef} className="mobile-bestsellers-track">
        {doubledItems.map((item, index) => (
          <div key={`${item.name}-${index}`} className="mobile-editorial-product-card">
            <div className="mobile-editorial-product-img-frame">
              <img src={item.image} alt={item.name} loading="lazy" />
            </div>
            <div className="mobile-editorial-product-info">
              <div className="mobile-editorial-product-header">
                <h3>{item.name}</h3>
                <span className="mobile-editorial-product-price">{item.price}</span>
              </div>
              <Link to={item.link} className="mobile-editorial-product-link">
                <button className="mobile-editorial-product-btn" type="button">
                  Shop
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
