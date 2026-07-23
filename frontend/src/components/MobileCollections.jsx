import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { animate } from 'framer-motion';

export function MobileCollections({ collections }) {
  const trackRef = useRef(null);
  const animRef = useRef(null);

  // Duplicate collections to allow seamless looping
  const doubledCollections = [...collections, ...collections];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let intervalId;
    let timeoutId;

    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        const firstCard = track.firstElementChild;
        if (!firstCard) return;
        const itemWidth = firstCard.getBoundingClientRect().width + 16; // width + gap
        const currentScroll = track.scrollLeft;
        
        const originalLength = collections.length;
        const maxScroll = originalLength * itemWidth;

        let startScroll = currentScroll;
        // If we are at the end of the loop, silently snap back instantly
        if (currentScroll >= maxScroll - 10) {
          startScroll = currentScroll - maxScroll;
          track.scrollLeft = startScroll;
        }

        const targetScroll = startScroll + itemWidth;

        // Temporarily disable scroll snap to prevent browser snap physics from overriding the animation frames
        track.style.scrollSnapType = 'none';

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

    // Pause auto scroll on manual touch
    const handleTouch = () => {
      if (animRef.current) {
        animRef.current.stop();
      }
      track.style.scrollSnapType = 'x mandatory';
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      // Resume after 8 seconds of inactivity
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
  }, [collections]);

  return (
    <section className="mobile-collections-section mobile-full-bleed">
      <div className="mobile-section-heading">
        <p className="eyebrow">Shop by Collection</p>
        <h2>Explore Our Collections</h2>
      </div>

      <div ref={trackRef} className="mobile-collections-track">
        {doubledCollections.map((collection, index) => (
          <Link 
            to={collection.link} 
            key={`${collection.name}-${index}`} 
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
