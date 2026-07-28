import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, X } from 'lucide-react';
import { Layout } from '../components/Layout.jsx';
import { useProducts } from '../hooks.js';

/* ── Collection (Browse by type) ─────────────────────────────── */
const COLLECTIONS = [
  'All',
  'Floral',
  'Bouquets',
  'Gift Boxes',
  'Glass Candles',
  'Cocktail Candles',
  'Festive',
  'Wedding Collection',
];

const COLLECTION_MAP = {
  All: null,
  Floral: ['Floral candle bouquets', 'Handcrafted flower baskets'],
  Bouquets: ['Candle bouquets & sticks', 'Floral candle bouquets'],
  'Gift Boxes': ['Gift box sets'],
  'Glass Candles': ['Daisy & glass candles'],
  'Cocktail Candles': ['Cocktail candle collection'],
  Festive: ['Festive sweet collection'],
  'Wedding Collection': ['Return gift candles', 'Gift favour candles'],
};

const COLLECTION_TAGLINES = {
  All: 'Explore our complete library of hand-poured candle designs.',
  Floral: 'Natural botanical aromas crafted to bloom in your living spaces.',
  Bouquets: 'Artistic sculptural candles shaped to replicate nature\'s floral beauty.',
  'Gift Boxes': 'Curated luxury sets hand-packed for warm celebrations.',
  'Glass Candles': 'Elegant hand-poured pieces crafted for timeless interiors.',
  'Cocktail Candles': 'Whimsical cocktail glass creations for playful decor.',
  Festive: 'Warm aromatic blends poured to celebrate sweet festive seasons.',
  'Wedding Collection': 'Bespoke return favours handcrafted to remember your special dates.',
};

/* ── Occasions (Browse by purpose) ───────────────────────────── */
const OCCASIONS = [
  { id: 'birthday',      label: 'Birthday',       emoji: '🎂' },
  { id: 'wedding',       label: 'Wedding',         emoji: '💍' },
  { id: 'anniversary',   label: 'Anniversary',     emoji: '🌹' },
  { id: 'return-gifts',  label: 'Return Gifts',    emoji: '🎁' },
  { id: 'festivals',     label: 'Festivals',       emoji: '✨' },
  { id: 'corporate',     label: 'Corporate Gifts', emoji: '💼' },
  { id: 'baby-shower',   label: 'Baby Shower',     emoji: '🍼' },
  { id: 'housewarming',  label: 'Housewarming',    emoji: '🏡' },
  { id: 'romantic',      label: 'Romantic',        emoji: '🕯️' },
  { id: 'just-because',  label: 'Just Because',    emoji: '💛' },
];

// Map each occasion to the backend category strings it covers
const OCCASION_MAP = {
  'birthday':     ['Floral candle bouquets', 'Handcrafted flower baskets', 'Gift box sets', 'Bobble candles', 'Heart collection'],
  'wedding':      ['Return gift candles', 'Gift favour candles', 'Floral candle bouquets'],
  'anniversary':  ['Daisy & glass candles', 'Floral candle bouquets', 'Heart collection', 'Gift box sets'],
  'return-gifts': ['Return gift candles', 'Gift favour candles', 'Gift box sets'],
  'festivals':    ['Festive sweet collection', 'Gift box sets', 'Candle bouquets & sticks'],
  'corporate':    ['Gift box sets', 'Gift favour candles', 'Return gift candles'],
  'baby-shower':  ['Bobble candles', 'Heart collection', 'Gift box sets', 'Floral candle bouquets'],
  'housewarming': ['Daisy & glass candles', 'Cocktail candle collection', 'Candle bouquets & sticks', 'Gift box sets'],
  'romantic':     ['Heart collection', 'Daisy & glass candles', 'Floral candle bouquets', 'Cocktail candle collection'],
  'just-because': null, // null = all categories
};

/* ── Component ────────────────────────────────────────────────── */
export function Shop() {
  const params = useParams();
  const routeCategory = params.category ? decodeURIComponent(params.category) : '';

  const getInitialCollection = (route) => {
    if (!route) return 'All';
    for (const [key, list] of Object.entries(COLLECTION_MAP)) {
      if (list && list.includes(route)) return key;
    }
    return 'All';
  };

  const [activeCollection, setActiveCollection] = useState(() => getInitialCollection(routeCategory));
  const [activeOccasion, setActiveOccasion]     = useState(null);
  const [searchQuery, setSearchQuery]           = useState('');
  const allProducts = useProducts();

  /* ── Filter logic ─────────────────────────────────────────── */
  const filteredProducts = allProducts.filter((product) => {
    // 1. Collection match
    const collectionCats = COLLECTION_MAP[activeCollection];
    const matchesCollection = !collectionCats || collectionCats.includes(product.category);

    // 2. Occasion match
    const occasionCats = activeOccasion ? OCCASION_MAP[activeOccasion] : null;
    const matchesOccasion = !occasionCats || occasionCats.includes(product.category);

    // 3. Search match
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCollection && matchesOccasion && matchesSearch;
  });

  /* ── Helpers ──────────────────────────────────────────────── */
  const isFiltered   = activeCollection !== 'All' || activeOccasion !== null;
  const occasionLabel = activeOccasion
    ? OCCASIONS.find((o) => o.id === activeOccasion)?.label
    : null;

  function clearFilters() {
    setActiveCollection('All');
    setActiveOccasion(null);
    setSearchQuery('');
  }

  /* ── Tagline ──────────────────────────────────────────────── */
  const taglineKey  = `${activeCollection}-${activeOccasion}`;
  const taglineHead = activeOccasion
    ? `${occasionLabel} · ${activeCollection === 'All' ? 'All Candles' : activeCollection}`
    : `${activeCollection} Candles`;
  const taglineBody = occasionLabel
    ? `Hand-picked pieces for ${occasionLabel.toLowerCase()} — filtered within ${activeCollection === 'All' ? 'our full collection' : activeCollection}.`
    : COLLECTION_TAGLINES[activeCollection];

  return (
    <Layout>
      {/* ── Editorial Header ─────────────────────────────── */}
      <section className="shop-header">
        <p className="eyebrow">Kinzee Studio</p>
        <h1>The Candle Shop</h1>
      </section>

      {/* ── Sticky Filter Bar ────────────────────────────── */}
      <div className="shop-filter-bar-sticky">
        <div className="shop-filter-bar-inner">

          {/* Collection row */}
          <div className="shop-filter-row">
            <span className="shop-filter-label">Collection</span>
            <div className="shop-categories-track-wrapper">
              <div className="shop-categories-track">
                {COLLECTIONS.map((col) => {
                  const isActive = activeCollection === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setActiveCollection(col)}
                      className={`shop-category-tab ${isActive ? 'is-active' : ''}`}
                    >
                      <span>{col}</span>
                      {isActive && (
                        <motion.span
                          layoutId="activeCategoryUnderline"
                          className="shop-category-underline"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search — sits on the right of the collection row */}
          <div className="shop-search-box">
            <Search size={16} className="shop-search-icon" />
            <input
              type="text"
              placeholder="Search candles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="shop-search-input"
            />
          </div>
        </div>

        {/* Occasion row */}
        <div className="shop-occasion-bar">
          <span className="shop-filter-label shop-filter-label--occasion">Occasion</span>
          <div className="shop-occasion-track">
            {OCCASIONS.map((occ) => {
              const isActive = activeOccasion === occ.id;
              return (
                <button
                  key={occ.id}
                  type="button"
                  onClick={() => setActiveOccasion(isActive ? null : occ.id)}
                  className={`shop-occasion-pill ${isActive ? 'is-active' : ''}`}
                >
                  <span className="shop-occasion-pill-emoji">{occ.emoji}</span>
                  <span>{occ.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active filter summary strip */}
        <AnimatePresence>
          {isFiltered && (
            <motion.div
              className="shop-active-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <div className="shop-active-filters-inner">
                <span className="shop-active-filters-summary">
                  {activeCollection !== 'All' && (
                    <span className="shop-active-tag">{activeCollection}</span>
                  )}
                  {activeCollection !== 'All' && occasionLabel && (
                    <span className="shop-active-separator">×</span>
                  )}
                  {occasionLabel && (
                    <span className="shop-active-tag">{occasionLabel}</span>
                  )}
                  <span className="shop-active-count">— {filteredProducts.length} candle{filteredProducts.length !== 1 ? 's' : ''}</span>
                </span>
                <button type="button" className="shop-filter-clear-btn" onClick={clearFilters}>
                  <X size={12} /> Clear filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Collection Tagline banner ─────────────────────── */}
      <div className="shop-tagline-section">
        <AnimatePresence mode="wait">
          <motion.div
            key={taglineKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="shop-tagline-content"
          >
            <h3>{taglineHead}</h3>
            <p>{taglineBody}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Product Grid ─────────────────────────────────── */}
      <section className="shop-products-section">
        <motion.div layout className="shop-editorial-grid">
          <AnimatePresence>
            {filteredProducts.map((product, index) => {
              const isFeatured = index % 5 === 2;
              return (
                <motion.div
                  layout
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className={`shop-product-tile ${isFeatured ? 'shop-product-tile--featured' : ''}`}
                >
                  <Link to={`/products/${product._id}`} className="shop-product-tile-link">
                    <div className="shop-product-tile-image-wrapper">
                      <img src={product.images?.[0]} alt={product.name} loading="lazy" />
                    </div>
                    <div className="shop-product-tile-details">
                      <div className="shop-product-tile-header">
                        <h3>{product.name}</h3>
                        <span className="shop-product-tile-price">₹{product.basePrice}</span>
                      </div>
                      <div className="shop-product-tile-action">
                        <span>Explore</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
        {filteredProducts.length === 0 && (
          <div className="shop-no-results">
            <p>No candles found matching your selection.</p>
            <button type="button" className="shop-no-results-clear" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ── Editorial Custom Request Section ─────────────── */}
      <section className="shop-editorial-custom-section">
        <div className="shop-editorial-custom-container">
          <div className="shop-editorial-custom-grid">

            <div className="shop-editorial-custom-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80"
                alt="Handcrafted candle crafting in studio"
                loading="lazy"
              />
              <div className="shop-editorial-custom-image-overlay" />
            </div>

            <div className="shop-editorial-custom-content">
              <p className="shop-editorial-custom-eyebrow">The Kinzee Studio</p>
              <h2>Designed Around Your Celebration</h2>
              <p className="shop-editorial-custom-text">
                From intimate weddings and milestone birthdays to warm baby showers, seasonal festivals, and corporate gifting.
                We curate bespoke scents, custom shapes, and personalized packaging handcrafted specially for you.
              </p>

              <div className="shop-editorial-custom-action-area">
                <Link to="/custom-order" className="shop-editorial-custom-btn">
                  Begin Your Custom Creation
                </Link>
                <p className="shop-editorial-custom-trustline">
                  Wedding Favours &bull; Baby Showers &bull; Corporate Gifts &bull; Bulk Orders
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}
