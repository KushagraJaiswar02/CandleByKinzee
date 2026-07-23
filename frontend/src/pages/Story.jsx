import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Instagram, Sparkles, Smile, Gift, Calendar, Heart } from 'lucide-react';
import { Layout } from '../components/Layout.jsx';

export function Story() {
  const behindScenes = [
    {
      title: 'Wax Pouring',
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&h=600&q=80',
      tag: 'Craft'
    },
    {
      title: 'Drying & Curing',
      image: 'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=600&h=600&q=80',
      tag: 'Atelier'
    },
    {
      title: 'Packing Orders',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&h=600&q=80',
      tag: 'Detail'
    },
    {
      title: 'Handmade Details',
      image: 'https://images.unsplash.com/photo-1612180030229-3d6e1cc71854?auto=format&fit=crop&w=600&h=600&q=80',
      tag: 'Finishing'
    }
  ];

  const moments = [
    {
      title: 'Weddings',
      desc: 'Bespoke custom-scented favors matching your floral theme and guest greetings.',
      icon: <Heart size={20} />
    },
    {
      title: 'Birthdays & Anniversaries',
      desc: 'Personalized gift sets crafted with custom number and peony candle arrangements.',
      icon: <Calendar size={20} />
    },
    {
      title: 'Corporate Gifting',
      desc: 'Sophisticated, custom-branded candle gift sets built to leave a lasting impression.',
      icon: <Gift size={20} />
    },
    {
      title: 'Festivals',
      desc: 'Traditional sweet-inspired collections designed to welcome light and warmth to your home.',
      icon: <Sparkles size={20} />
    },
    {
      title: 'Baby Showers',
      desc: 'Soft-hued, delicate candle designs customized with personal details.',
      icon: <Smile size={20} />
    }
  ];

  const productCatalogue = [
    {
      title: 'Flower & Bouquet Candles',
      image: 'https://images.unsplash.com/photo-1572726729207-a78d6eab18aa?auto=format&fit=crop&w=800&q=80',
      tagline: 'Delicate botanicals set in textured wax.'
    },
    {
      title: 'Cocktail & Glass Designs',
      image: 'https://images.unsplash.com/photo-1608798934528-8396f7c8f95c?auto=format&fit=crop&w=800&q=80',
      tagline: 'Clean-burning aromatherapy in premium glassware.'
    },
    {
      title: 'Bespoke Gift Boxes',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
      tagline: 'Considered assortments for warm presentation.'
    },
    {
      title: 'Seasonal Formulations',
      image: 'https://images.unsplash.com/photo-1609137144813-2dbe4889b785?auto=format&fit=crop&w=800&q=80',
      tagline: 'Festive accents celebrating sweet moments.'
    }
  ];

  const recentStudioSnaps = [
    {
      url: 'https://images.unsplash.com/photo-1612180030229-3d6e1cc71854?auto=format&fit=crop&w=400&h=400&q=80',
      alt: 'Real product details'
    },
    {
      url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&h=400&q=80',
      alt: 'Real pour in progress'
    },
    {
      url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&h=400&q=80',
      alt: 'Recent bulk order packed'
    },
    {
      url: 'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=400&h=400&q=80',
      alt: 'Atelier curing candles shelf'
    }
  ];

  return (
    <Layout>
      <div className="story-editorial-page">
        
        {/* 1. Editorial Hero */}
        <section className="story-hero-section">
          <div className="story-hero-container">
            <p className="eyebrow">Our Philosophy</p>
            <h1>Crafted by hand.<br />Made for moments worth remembering.</h1>
            <p className="story-hero-subtitle">
              We do not mass manufacture. Candle by Kinzee designs small-batch, 
              handcrafted creations made specifically to celebrate life's most meaningful moments.
            </p>
          </div>
        </section>

        {/* 2. The Studio Left-Right Section */}
        <section className="story-studio-split-section">
          <div className="story-studio-split-container">
            <div className="story-studio-split-image">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80" 
                alt="Handcrafted candle making workspace" 
                loading="lazy"
              />
            </div>
            <div className="story-studio-split-content">
              <p className="eyebrow">The Atelier</p>
              <h2>A Space of Slow Craft</h2>
              <p>
                In our Indore studio, we challenge the pace of generic commerce. 
                Every single candle is poured, trimmed, and finished by hand only after you choose it. 
                We bring care back into gifting.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Behind The Scenes Grid */}
        <section className="story-bts-section">
          <div className="story-bts-container">
            <div className="story-section-header">
              <p className="eyebrow">Behind The Scenes</p>
              <h2>The Alchemy of Handcrafting</h2>
            </div>
            
            <div className="story-bts-grid">
              {behindScenes.map((item, idx) => (
                <div key={idx} className="story-bts-card">
                  <div className="story-bts-card-img">
                    <img src={item.image} alt={item.title} loading="lazy" />
                    <span className="story-bts-tag">{item.tag}</span>
                  </div>
                  <h3>{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Small Batch Philosophy Detail */}
        <section className="story-philosophy-detail-section">
          <div className="story-philosophy-detail-container">
            <div className="story-philosophy-detail-grid">
              <div className="philosophy-col">
                <p className="eyebrow">Fresh production</p>
                <h3>Never warehoused. Always fresh.</h3>
                <p>
                  Industrial candles sit in boxes for months, causing fragrance oils to separate and dry. 
                  Because we craft on demand, you receive active, fresh scent profiles that carry peak aroma diffusion.
                </p>
              </div>

              <div className="philosophy-col">
                <p className="eyebrow">Personal care</p>
                <h3>Inspected by a single artisan.</h3>
                <p>
                  A single set of hands inspects every wick alignment, petal placement, and custom label wrap. 
                  We treat each candle as if it was going to be lit in our own home.
                </p>
              </div>

              <div className="philosophy-col">
                <p className="eyebrow">Bespoke detail</p>
                <h3>Designed to fit your space.</h3>
                <p>
                  We collaborate with you on colors, fragrances, and branding. We make sure your candles 
                  aren't just purchases—they are custom-tailored elements of your lifestyle.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Moments We Create */}
        <section className="story-moments-section">
          <div className="story-moments-container">
            <div className="story-section-header">
              <p className="eyebrow">Our Focus</p>
              <h2>Celebrating Life's Moments</h2>
              <p className="section-intro-text">We help design memory markers. We translate events into physical gifts.</p>
            </div>

            <div className="story-moments-grid">
              {moments.map((m, idx) => (
                <div key={idx} className="story-moment-card">
                  <div className="moment-icon-badge">
                    {m.icon}
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Instagram Inspired Gallery (Pinterest-like Catalog) */}
        <section className="story-pinterest-section">
          <div className="story-pinterest-container">
            <div className="story-section-header">
              <p className="eyebrow">Atelier Curation</p>
              <h2>The Luxury Catalogue</h2>
              <p className="section-intro-text">Explore our core product aesthetics—crafted to bring texture and aroma to your interiors.</p>
            </div>

            <div className="story-pinterest-grid">
              {productCatalogue.map((prod, idx) => (
                <div key={idx} className="story-pinterest-item">
                  <div className="story-pinterest-img-frame">
                    <img src={prod.image} alt={prod.title} loading="lazy" />
                  </div>
                  <div className="story-pinterest-info">
                    <h3>{prod.title}</h3>
                    <p>{prod.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. From Our Studio Feed Snaps */}
        <section className="story-feed-section mobile-full-bleed">
          <div className="story-feed-container">
            <div className="story-feed-header">
              <h3>From Our Studio</h3>
              <p>Real products • Real orders • Real craftsmanship</p>
              <a 
                href="https://www.instagram.com/candle_by_kinzee/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="story-insta-follow-link"
              >
                <span>Follow @candle_by_kinzee</span>
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="story-feed-grid">
              {recentStudioSnaps.map((snap, idx) => (
                <div key={idx} className="story-feed-card">
                  <img src={snap.url} alt={snap.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Closing Section */}
        <section className="story-closing-section">
          <div className="story-closing-container">
            <p>&ldquo;Thank you for letting our candles become part of your celebrations.&rdquo;</p>
          </div>
        </section>

      </div>
    </Layout>
  );
}
