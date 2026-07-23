import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { Layout } from '../components/Layout.jsx';
import { useProducts } from '../hooks.js';

const CATEGORIES = [
  'All',
  'Floral',
  'Glass',
  'Bouquets',
  'Gift Boxes',
  'Wedding',
  'Festive',
  'Cocktail'
];

const CATEGORY_MAP = {
  All: null,
  Floral: ['Floral candle bouquets', 'Handcrafted flower baskets'],
  Glass: ['Daisy & glass candles'],
  Bouquets: ['Candle bouquets & sticks', 'Floral candle bouquets'],
  'Gift Boxes': ['Gift box sets'],
  Wedding: ['Return gift candles', 'Gift favour candles'],
  Festive: ['Festive sweet collection'],
  Cocktail: ['Cocktail candle collection']
};

const CATEGORY_TAGLINES = {
  All: 'Explore our complete library of hand-poured candle designs.',
  Floral: 'Natural botanical aromas crafted to bloom in your living spaces.',
  Glass: 'Elegant hand-poured pieces crafted for timeless interiors.',
  Bouquets: 'Artistic sculptural candles shaped to replicate nature\'s floral beauty.',
  'Gift Boxes': 'Curated luxury sets hand-packed for warm celebrations.',
  Wedding: 'Bespoke return favours handcrafted to remember your special dates.',
  Festive: 'Warm aromatic blends poured to celebrate sweet festive seasons.',
  Cocktail: 'Whimsical cocktail glass creations for playful decor.'
};

export function Shop() {
  const params = useParams();
  const routeCategory = params.category ? decodeURIComponent(params.category) : '';

  const getInitialCategory = (route) => {
    if (!route) return 'All';
    for (const [key, list] of Object.entries(CATEGORY_MAP)) {
      if (list && list.includes(route)) {
        return key;
      }
    }
    return 'All';
  };

  const [activeCategory, setActiveCategory] = useState(() => getInitialCategory(routeCategory));
  const [searchQuery, setSearchQuery] = useState('');
  const allProducts = useProducts();

  const filteredProducts = allProducts.filter((product) => {
    // Category match
    const mappedCats = CATEGORY_MAP[activeCategory];
    const matchesCategory = !mappedCats || mappedCats.includes(product.category);

    // Search query match
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      {/* Small Editorial Header */}
      <section className="shop-header">
        <p className="eyebrow">Kinzee Studio</p>
        <h1>The Candle Shop</h1>
      </section>

      {/* Sticky Filters & Search */}
      <div className="shop-filter-bar-sticky">
        <div className="shop-filter-bar-inner">
          {/* Category Track (Snap Scrolling) */}
          <div className="shop-categories-track-wrapper">
            <div className="shop-categories-track">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`shop-category-tab ${isActive ? 'is-active' : ''}`}
                  >
                    <span>{cat}</span>
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

          {/* Search Field */}
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
      </div>

      {/* Collection Tagline banner */}
      <div className="shop-tagline-section">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="shop-tagline-content"
          >
            <h3>{activeCategory} Candles</h3>
            <p>{CATEGORY_TAGLINES[activeCategory]}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Product List Grid */}
      <section className="shop-products-section">
        <motion.div layout className="shop-editorial-grid">
          <AnimatePresence>
            {filteredProducts.map((product, index) => {
              const isFeatured = index % 5 === 2; // Rhythmic featured styling
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
          </div>
        )}
      </section>

      {/* Editorial Custom Request Section */}
      <section className="shop-editorial-custom-section">
        <div className="shop-editorial-custom-container">
          <div className="shop-editorial-custom-grid">
            
            {/* Left Column: Premium Lifestyle Image */}
            <div className="shop-editorial-custom-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80" 
                alt="Handcrafted candle crafting in studio" 
                loading="lazy"
              />
              <div className="shop-editorial-custom-image-overlay" />
            </div>

            {/* Right Column: Copy & Call-to-action */}
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
