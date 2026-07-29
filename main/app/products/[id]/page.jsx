'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Heart, Share2, Award, Clock, Sparkles, ChevronDown, MessageCircle, ArrowRight, ShoppingBag, Zap } from 'lucide-react';
import { Layout } from '@/components/Layout.jsx';
import { FlameButton } from '@/components/FlameButton.jsx';
import { useProducts, useIsMobile } from '@/hooks.js';
import { StudioContactCard } from '@/components/StudioContactCard.jsx';
import { useCart } from '@/components/CartContext.jsx';

export default function ProductDetail() {
  const params = useParams();
  const id = params?.id || '';
  const products = useProducts();
  const isMobile = useIsMobile();
  const router = useRouter();

  const product = useMemo(() => {
    const raw = products.find((item) => item._id === id);
    if (!raw) return null;

    return {
      ...raw,
      longDescription: raw.longDescription || 'Every candle is custom designed and individually hand-poured in our studio. We combine natural, sustainable soy wax with organic cotton wicks and premium aromatic oils to deliver a clean burn and a beautiful, lingering scent throw.',
      burnTime: raw.burnTime || '35 - 40 Hours',
      materials: raw.materials || '100% Natural Soy Wax, Organic Cotton Wicks, Lead-free Glass Vessels, Fine Aromatic Essential Oils',
      careInstructions: raw.careInstructions || 'Trim the wick to 1/4 inch before each lighting. For the first burn, allow the wax to melt edge-to-edge (approx. 2 hours) to prevent tunneling. Place on heat-resistant surfaces only.',
      fragranceNotes: raw.fragranceNotes || {
        top: 'Fresh Peony, Dewy Rose',
        heart: 'Amber Melts, Warm Vanilla Orchid',
        base: 'Sandalwood, Soft Cedar'
      },
      handmadeProcess: raw.handmadeProcess || 'Our candles are slowly hand-poured in small batches in India. We meticulously blend organic soy wax and pure cotton wicks to deliver high-fidelity fragrance diffusion built after you order.',
      gallery: raw.images?.length > 1 ? raw.images : [
        raw.images?.[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=900&q=80'
      ],
      customOptions: raw.customOptions || [
        { label: 'Color', choices: ['Classic Ivory', 'Blush Rose', 'Sage Green'] },
        { label: 'Scent', choices: ['Warm Peony', 'Vanilla Sugar', 'Wild Lavender'] }
      ]
    };
  }, [id, products]);

  const [qty, setQty] = useState(1);
  const [options, setOptions] = useState({});
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState('love');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [bagToast, setBagToast] = useState(false);

  const { addToCart } = useCart();
  const selectedSurcharge = Object.entries(options).reduce((total, [label, choice]) => {
    const option = product.customOptions?.find((item) => item.label === label);
    return total + Number(option?.surcharges?.[choice] || 0);
  }, 0);
  const unitPrice = product.basePrice + selectedSurcharge;

  useEffect(() => {
    if (product && product.customOptions) {
      const initial = {};
      product.customOptions.forEach((opt) => {
        if (opt.choices && opt.choices.length > 0) {
          initial[opt.label] = opt.choices[0];
        }
      });
      setOptions(initial);
    }
  }, [product]);

  useEffect(() => {
    if (!isMobile) return;
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  if (!product) {
    return (
      <Layout>
        <section className="bag-empty-state">
          <div className="bag-empty-copy">
            <p className="eyebrow">Catalogue</p>
            <h1 className="bag-empty-heading">This candle is no longer available.</h1>
            <p className="bag-empty-subtext">Explore the current collection to find a piece made for your occasion.</p>
          </div>
          <Link href="/shop"><FlameButton>Explore the collection</FlameButton></Link>
        </section>
      </Layout>
    );
  }

  function addToBag() {
    addToCart({
      productId: product._id,
      name: product.name,
      basePrice: product.basePrice,
      unitPrice,
      image: product.gallery[0],
      qty,
      selectedOptions: options,
    });
    setBagToast(true);
    setTimeout(() => setBagToast(false), 2800);
  }

  function buyNow() {
    addToCart({
      productId: product._id,
      name: product.name,
      basePrice: product.basePrice,
      unitPrice,
      image: product.gallery[0],
      qty,
      selectedOptions: options,
    });
    router.push('/checkout');
  }

  function toggleAccordion(id) {
    setActiveAccordion(activeAccordion === id ? null : id);
  }

  function handleShare() {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(window.location.href);
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2000);
      }
    }
  }

  return (
    <Layout>
      <section className="product-detail-container">
        
        {/* Gallery Section */}
        <div className="product-detail-gallery-column">
          {isMobile ? (
            <div className="product-mobile-gallery-wrapper">
              <div className="product-mobile-gallery-track">
                {product.gallery.map((img, i) => (
                  <div key={i} className="product-mobile-gallery-slide">
                    <img src={img} alt={`${product.name} view ${i + 1}`} />
                  </div>
                ))}
              </div>
              <div className="product-mobile-gallery-dots">
                {product.gallery.map((_, i) => (
                  <span 
                    key={i} 
                    className={`product-gallery-dot ${activeImageIndex === i ? 'is-active' : ''}`}
                    onClick={() => {
                      const track = document.querySelector('.product-mobile-gallery-track');
                      if (track) {
                        track.scrollTo({ left: i * window.innerWidth, behavior: 'smooth' });
                        setActiveImageIndex(i);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="product-desktop-gallery-wrapper">
              <div className="product-desktop-thumbnails-rail">
                {product.gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`product-desktop-thumbnail ${activeImageIndex === i ? 'is-active' : ''}`}
                  >
                    <img src={img} alt="Thumbnail view" />
                  </button>
                ))}
              </div>
              <div className="product-desktop-featured-frame">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={product.gallery[activeImageIndex]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="product-desktop-featured-img"
                  />
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Product Information Column */}
        <div className="product-detail-info-column">
          <p className="eyebrow">{product.category}</p>
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-pricing-row">
            <span className="product-price-value">₹{product.basePrice}</span>
            <span className="product-tax-tag">Incl. of all taxes</span>
          </div>

          <p className="product-editorial-description">
            {product.longDescription}
          </p>

          <div className="product-handcrafted-story-badge">
            <span className="badge-text">Every Kinzee candle is poured by hand after you choose it.</span>
            <Link href="/story" className="badge-learn-more-link">
              <span>Learn more</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="product-variant-selectors">
            {product.customOptions?.map((option) => (
              <div className="product-variant-group" key={option.label}>
                <span className="product-variant-label">{option.label}</span>
                <div className="product-variant-pills">
                  {option.choices.map((choice) => {
                    const isSelected = options[option.label] === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setOptions({ ...options, [option.label]: choice })}
                        className={`product-variant-pill ${isSelected ? 'is-active' : ''}`}
                      >
                        {choice}
                        {isSelected && (
                          <motion.span 
                            layoutId={`active_pill_${option.label}`}
                            className="product-variant-pill-glow" 
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="product-quantity-group">
            <span className="product-variant-label">Quantity</span>
            <div className="product-qty-stepper">
              <button 
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="product-qty-value">{qty}</span>
              <button 
                type="button"
                onClick={() => setQty(qty + 1)}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="product-checkout-actions">
            <div className="product-primary-action-wrap">
              <FlameButton type="button" onClick={addToBag}>
                <ShoppingBag size={15} style={{ marginRight: 6 }} />
                Add to Bag
              </FlameButton>
            </div>

            <div className="product-secondary-actions-row">
              <button
                type="button"
                onClick={buyNow}
                className="product-action-link-btn"
              >
                <Zap size={14} />
                <span>Buy Now</span>
              </button>
              <Link href="/custom-order" className="product-action-link-btn">
                <Sparkles size={14} />
                <span>Customize this product</span>
              </Link>
              <button 
                type="button" 
                onClick={() => setIsSaved(!isSaved)}
                className={`product-action-btn ${isSaved ? 'is-saved' : ''}`}
                aria-label="Save for later"
              >
                <Heart size={16} fill={isSaved ? "var(--rose)" : "none"} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button 
                type="button" 
                onClick={handleShare}
                className="product-action-btn"
                aria-label="Share product"
              >
                <Share2 size={16} />
                <span>{shareFeedback ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {bagToast && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="product-bag-toast"
              >
                <ShoppingBag size={14} />
                <span>Added to your bag</span>
                <Link href="/bag" className="product-bag-toast-link">View Bag →</Link>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="product-luxury-accordions">
            <div className="product-accordion-block">
              <button 
                type="button" 
                onClick={() => toggleAccordion('love')}
                className="product-accordion-header"
                aria-expanded={activeAccordion === 'love'}
              >
                <span>Why You'll Love It</span>
                <ChevronDown size={16} className={`accordion-chevron ${activeAccordion === 'love' ? 'is-open' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 'love' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="product-accordion-content"
                  >
                    <div className="product-accordion-content-inner">
                      <div className="product-perk-item">
                        <Award size={15} />
                        <span>100% natural, eco-friendly soy wax burns clean with minimal soot.</span>
                      </div>
                      <div className="product-perk-item">
                        <Clock size={15} />
                        <span>Slow, premium burn time lasting up to {product.burnTime}.</span>
                      </div>
                      <div className="product-perk-item">
                        <Sparkles size={15} />
                        <span>Individually hand-poured inside our boutique studio after your order.</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {product.fragranceNotes && (
              <div className="product-accordion-block">
                <button 
                  type="button" 
                  onClick={() => toggleAccordion('fragrance')}
                  className="product-accordion-header"
                  aria-expanded={activeAccordion === 'fragrance'}
                >
                  <span>Fragrance Profile</span>
                  <ChevronDown size={16} className={`accordion-chevron ${activeAccordion === 'fragrance' ? 'is-open' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {activeAccordion === 'fragrance' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="product-accordion-content"
                    >
                      <div className="product-accordion-content-inner">
                        <div className="fragrance-notes-list">
                          <div className="fragrance-note-tier">
                            <strong>Top Notes</strong>
                            <p>{product.fragranceNotes.top}</p>
                          </div>
                          <div className="fragrance-note-tier">
                            <strong>Heart Notes</strong>
                            <p>{product.fragranceNotes.heart}</p>
                          </div>
                          <div className="fragrance-note-tier">
                            <strong>Base Notes</strong>
                            <p>{product.fragranceNotes.base}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="product-accordion-block">
              <button 
                type="button" 
                onClick={() => toggleAccordion('care')}
                className="product-accordion-header"
                aria-expanded={activeAccordion === 'care'}
              >
                <span>Details & Care Guide</span>
                <ChevronDown size={16} className={`accordion-chevron ${activeAccordion === 'care' ? 'is-open' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 'care' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="product-accordion-content"
                  >
                    <div className="product-accordion-content-inner">
                      <div className="product-care-list">
                        <p><strong>Burn Time:</strong> {product.burnTime}</p>
                        <p><strong>Materials:</strong> {product.materials}</p>
                        <p><strong>Instructions:</strong> {product.careInstructions}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="product-accordion-block">
              <button 
                type="button" 
                onClick={() => toggleAccordion('story')}
                className="product-accordion-header"
                aria-expanded={activeAccordion === 'story'}
              >
                <span>Our Studio Process</span>
                <ChevronDown size={16} className={`accordion-chevron ${activeAccordion === 'story' ? 'is-open' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {activeAccordion === 'story' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="product-accordion-content"
                  >
                    <div className="product-accordion-content-inner">
                      <p className="product-care-text">{product.handmadeProcess}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <StudioContactCard type="product" data={product} />

          </div>
        </div>

      </section>

      <AnimatePresence>
        {isMobile && showStickyBar && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mobile-sticky-checkout-bar"
          >
            <div className="sticky-checkout-product-details">
              <img src={product.gallery[0]} alt="" />
              <div className="sticky-checkout-product-meta">
                <h4>{product.name}</h4>
                <span>₹{unitPrice * qty}</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={buyNow}
              className="sticky-checkout-buy-btn"
            >
              Buy Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
