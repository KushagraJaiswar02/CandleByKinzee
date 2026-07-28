'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Instagram, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

export function MobileFooter() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  const sections = [
    {
      id: 'collections',
      title: 'Collections',
      content: (
        <ul className="mobile-footer-links-list">
          <li><Link href="/collections/Floral candle bouquets">Floral Candles</Link></li>
          <li><Link href="/collections/Daisy & glass candles">Glass Candles</Link></li>
          <li><Link href="/collections/Candle bouquets & sticks">Candle Bouquets</Link></li>
          <li><Link href="/collections/Gift box sets">Gift Box Sets</Link></li>
          <li><Link href="/collections/Festive sweet collection">Festive Collection</Link></li>
          <li><Link href="/collections/Cocktail candle collection">Cocktail Glasses</Link></li>
        </ul>
      )
    },
    {
      id: 'company',
      title: 'The Studio',
      content: (
        <ul className="mobile-footer-links-list">
          <li><Link href="/story">Our Story</Link></li>
          <li><Link href="/track">Track Order</Link></li>
          <li><Link href="/custom-order">Bulk & Custom Orders</Link></li>
        </ul>
      )
    },
    {
      id: 'contact',
      title: 'Contact Us',
      content: (
        <div className="mobile-footer-contact-details">
          <div className="mobile-contact-item">
            <Phone size={15} />
            <span>+91 7000701579</span>
          </div>
          <div className="mobile-contact-item">
            <Mail size={15} />
            <span>orders@candlewithkinzee.co</span>
          </div>
          <div className="mobile-contact-item">
            <MapPin size={15} />
            <span>Indore, Madhya Pradesh, India</span>
          </div>
        </div>
      )
    },
    {
      id: 'socials',
      title: 'Socials',
      content: (
        <div className="mobile-footer-socials-content">
          <div className="mobile-footer-social-icons">
            <a href="https://www.instagram.com/candle_by_kinzee/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={`https://wa.me/917000701579`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
            <a href="mailto:orders@candlewithkinzee.co" aria-label="Email"><Mail size={18} /></a>
          </div>
          <div className="mobile-footer-insta-journal">
            <p className="journal-title">Studio Journal</p>
            <div className="mobile-insta-grid">
              {[
                'https://images.unsplash.com/photo-1612180030229-3d6e1cc71854?auto=format&fit=crop&w=150&h=150&q=80',
                'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&h=150&q=80',
                'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=150&h=150&q=80',
                'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=150&h=150&q=80',
                'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=150&h=150&q=80',
                'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=150&h=150&q=80',
              ].map((src, i) => (
                <a key={i} href="https://www.instagram.com/candle_by_kinzee/" target="_blank" rel="noopener noreferrer" className="mobile-insta-item">
                  <img src={src} alt="Studio candles photo" loading="lazy" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <footer className="mobile-site-footer mobile-full-bleed">
      <div className="mobile-footer-brand">
        <img src="/logo.png" alt="Candle by Kinzee" className="mobile-footer-logo" />
        <h3>Candle by Kinzee</h3>
        <p className="mobile-footer-brand-text">
          Natural soy wax and organic cotton wicks, poured by hand in small batches. 
          Crafted for the aromas that tell your story.
        </p>
      </div>

      <div className="mobile-footer-accordion">
        {sections.map((section) => {
          const isOpen = openSection === section.id;
          return (
            <div key={section.id} className="mobile-accordion-item">
              <button
                type="button"
                className="mobile-accordion-trigger"
                onClick={() => toggleSection(section.id)}
                aria-expanded={isOpen}
              >
                <span>{section.title}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="mobile-accordion-icon"
                >
                  <Plus size={16} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="mobile-accordion-content"
                  >
                    <div className="mobile-accordion-content-inner">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mobile-footer-divider" />

      <div className="mobile-footer-bottom">
        <div className="mobile-footer-handmade">
          <span className="gold-text">Handmade in India</span>
          <span className="bullet">•</span>
          <span>Made after order</span>
        </div>
        <p className="mobile-copyright">
          &copy; {new Date().getFullYear()} Candle by Kinzee.
        </p>
      </div>
    </footer>
  );
}
