'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCircle, Search, ShoppingBag, Instagram, Phone, Mail, MapPin, Menu, X, ChevronDown, User } from 'lucide-react';
import { categories } from '@/lib/data.js';
import { useIsMobile } from '@/hooks.js';
import { MobileFooter } from './MobileFooter.jsx';
import { CustomerAuthSheet } from './CustomerAuthSheet.jsx';
import { PersistentCartBar } from './PersistentCartBar.jsx';
import { useCart } from './CartContext.jsx';

export function Layout({ children }) {
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleOpen = () => setAuthSheetOpen(true);
    window.addEventListener('open-customer-auth', handleOpen);
    return () => window.removeEventListener('open-customer-auth', handleOpen);
  }, []);

  const closeMobileNav = () => {
    setMobileNavOpen(false);
    setCollectionsExpanded(false);
  };

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917000701579';

  return (
    <div className="site-shell">
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <Link className="wordmark" href="/" onClick={closeMobileNav}>
          <motion.span
            className="wordmark-icon"
            animate={reduceMotion ? undefined : { scale: scrolled ? 0.92 : 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src="/logo.png" alt="Candle by Kinzee Logo" className="wordmark-logo" />
          </motion.span>
          <motion.span
            className="wordmark-text"
            animate={reduceMotion ? undefined : { scale: scrolled ? 0.96 : 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            Candle by Kinzee
          </motion.span>
        </Link>

        {!isMobile && (
          <nav>
            <Link href="/shop">Shop</Link>
            <Link href="/custom-order">Custom Order</Link>
          </nav>
        )}

        <div className="header-actions">
          {!isMobile && (
            <>
              <Link aria-label="Track order" href="/track" onClick={closeMobileNav}><Search size={18} /></Link>
              <button
                type="button"
                aria-label="My Account"
                onClick={() => setAuthSheetOpen(true)}
                className="header-action-profile-btn"
              >
                <User size={18} />
              </button>
              <a
                aria-label="Instagram"
                href="https://www.instagram.com/candle_by_kinzee/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={18} />
              </a>
              <a
                aria-label="WhatsApp"
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello!')}`}
              >
                <MessageCircle size={18} />
              </a>
            </>
          )}

          <Link aria-label="Your Bag" href="/bag" onClick={closeMobileNav} className="header-bag-link">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="bag-count-badge">{cartCount}</span>}
          </Link>

          {isMobile && (
            <button
              type="button"
              className="mobile-nav-toggle-btn"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-expanded={mobileNavOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isMobile && mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mobile-nav-drawer"
          >
            <div className="mobile-nav-drawer-inner">
              <div className="mobile-nav-links">
                <Link href="/shop" className="mobile-nav-link" onClick={closeMobileNav}>
                  Shop Candles
                </Link>
                <Link href="/custom-order" className="mobile-nav-link mobile-nav-link--highlight" onClick={closeMobileNav}>
                  Request Custom Order
                </Link>
                <Link href="/track" className="mobile-nav-link" onClick={closeMobileNav}>
                  Track Order
                </Link>
                <button
                  type="button"
                  className="mobile-nav-link mobile-nav-link-btn"
                  onClick={() => {
                    closeMobileNav();
                    setAuthSheetOpen(true);
                  }}
                >
                  My Account
                </button>
              </div>

              <div className="mobile-nav-drawer-socials">
                <a
                  href="https://www.instagram.com/candle_by_kinzee/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mobile-social-row-link"
                >
                  <Instagram size={18} />
                  <span>Follow @candle_by_kinzee</span>
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello!')}`}
                  className="mobile-social-row-link"
                >
                  <MessageCircle size={18} />
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>{children}</main>

      {isMobile ? (
        <MobileFooter />
      ) : (
        <footer className="site-footer">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo-wrapper">
                <img src="/logo.png" alt="Candle by Kinzee" className="footer-logo" />
                <h3>Candle by Kinzee</h3>
              </div>
              <p className="footer-brand-text">
                Each of our candles is hand-poured in small batches, crafted with natural soy wax and organic cotton wicks. 
                We believe that candles are not just light—they are the aroma, the atmosphere, and the memories of your real occasions.
              </p>
              <div className="footer-socials">
                <a href="https://www.instagram.com/candle_by_kinzee/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
                <a href="mailto:orders@candlewithkinzee.co" aria-label="Email"><Mail size={18} /></a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Collections</h4>
              <ul>
                <li><Link href="/collections/Floral candle bouquets">Floral Candles</Link></li>
                <li><Link href="/collections/Daisy & glass candles">Glass Candles</Link></li>
                <li><Link href="/collections/Candle bouquets & sticks">Candle Bouquets</Link></li>
                <li><Link href="/collections/Gift box sets">Gift Box Sets</Link></li>
                <li><Link href="/collections/Festive sweet collection">Festive Collection</Link></li>
                <li><Link href="/collections/Cocktail candle collection">Cocktail Glasses</Link></li>
              </ul>
            </div>

            <div className="footer-links footer-contact">
              <h4>The Studio</h4>
              <ul>
                <li><Link href="/story">Our Story</Link></li>
                <li><Link href="/track">Track Order</Link></li>
                <li><Link href="/custom-order">Bulk & Custom Orders</Link></li>
              </ul>
              <div className="contact-details">
                <div className="contact-item">
                  <Phone size={14} />
                  <span>+91 7000701579</span>
                </div>
                <div className="contact-item">
                  <Mail size={14} />
                  <span>orders@candlewithkinzee.co</span>
                </div>
                <div className="contact-item">
                  <MapPin size={14} />
                  <span>Indore, Madhya Pradesh, India</span>
                </div>
              </div>
            </div>

            <div className="footer-insta">
              <h4>Studio Journal</h4>
              <div className="insta-grid">
                {[
                  'https://images.unsplash.com/photo-1612180030229-3d6e1cc71854?auto=format&fit=crop&w=150&h=150&q=80',
                  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&h=150&q=80',
                  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&h=150&q=80',
                  'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=150&h=150&q=80',
                  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=150&h=150&q=80',
                  'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=150&h=150&q=80',
                ].map((src, i) => (
                  <a key={i} href="https://www.instagram.com/candle_by_kinzee/" target="_blank" rel="noopener noreferrer" className="insta-item">
                    <img src={src} alt="Studio candles photo" loading="lazy" />
                    <span className="insta-overlay"><Instagram size={14} /></span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">
            <div className="footer-handmade">
              <span className="gold-text">Handmade in India</span>
              <span className="bullet">•</span>
              <span>Made after every order</span>
            </div>
            <p className="copyright">
              &copy; {new Date().getFullYear()} Candle by Kinzee. All rights reserved.
            </p>
          </div>
        </footer>
      )}
      <PersistentCartBar />
      <CustomerAuthSheet isOpen={authSheetOpen} onClose={() => setAuthSheetOpen(false)} />
    </div>
  );
}
