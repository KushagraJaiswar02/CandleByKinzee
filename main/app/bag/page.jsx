'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Plus, Minus, X, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/Layout.jsx';
import { FlameButton } from '@/components/FlameButton.jsx';
import { useCart } from '@/components/CartContext.jsx';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=200&q=80';

export default function Bag() {
  const { cart, cartCount, cartTotal, removeFromCart, updateQty } = useCart();
  const router = useRouter();
  const isEmpty = cart.length === 0;

  return (
    <Layout>
      <div className="bag-page-shell">

        <div className="bag-page-header">
          <p className="eyebrow">Your Order</p>
          <h1 className="bag-page-title">Your Bag</h1>
          {!isEmpty && (
            <p className="bag-page-count">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
          )}
        </div>

        {isEmpty ? (
          <EmptyBagState />
        ) : (
          <div className="bag-content-grid">

            <div className="bag-items-column">
              <AnimatePresence initial={false}>
                {cart.map((item) => (
                  <motion.div
                    key={item._lineId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="bag-item-card"
                  >
                    <div className="bag-item-image-wrap">
                      <img
                        src={item.image || FALLBACK_IMAGE}
                        alt={item.name}
                        className="bag-item-image"
                      />
                    </div>

                    <div className="bag-item-info">
                      <div className="bag-item-top-row">
                        <div>
                          <p className="bag-item-name">{item.name}</p>
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <p className="bag-item-options">
                              {Object.entries(item.selectedOptions)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' · ')}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._lineId)}
                          className="bag-item-remove-btn"
                          aria-label={`Remove ${item.name}`}
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="bag-item-bottom-row">
                        <div className="bag-qty-stepper">
                          <button
                            type="button"
                            onClick={() => updateQty(item._lineId, item.qty - 1)}
                            disabled={item.qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="bag-qty-value">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateQty(item._lineId, item.qty + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="bag-item-price-block">
                          {item.qty > 1 && (
                            <span className="bag-item-unit-price">₹{item.unitPrice ?? item.basePrice} each</span>
                          )}
                          <span className="bag-item-line-total">₹{((item.unitPrice ?? item.basePrice) * item.qty).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link href="/shop" className="bag-continue-shopping-link">
                <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                <span>Continue Shopping</span>
              </Link>
            </div>

            <div className="bag-summary-panel">
              <div className="bag-summary-card">
                <h3 className="bag-summary-heading">Order Summary</h3>

                <div className="bag-summary-lines">
                  {cart.map((item) => (
                    <div key={item._lineId} className="bag-summary-line">
                      <span className="bag-summary-line-name">
                        {item.name}
                        {item.qty > 1 && <span className="bag-summary-qty"> ×{item.qty}</span>}
                      </span>
                      <span className="bag-summary-line-price">₹{((item.unitPrice ?? item.basePrice) * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="bag-summary-divider" />

                <div className="bag-summary-totals">
                  <div className="bag-summary-row">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bag-summary-row bag-summary-row--muted">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="bag-summary-reassurance">
                  <MessageCircle size={13} />
                  <span>Delivery details confirmed over WhatsApp after ordering</span>
                </div>

                <div className="bag-summary-cta-wrap">
                  <FlameButton type="button" onClick={() => router.push('/checkout')}>
                    Proceed to Checkout
                    <ArrowRight size={15} style={{ marginLeft: 6 }} />
                  </FlameButton>
                </div>

                <div className="bag-summary-custom-nudge">
                  <Sparkles size={13} />
                  <span>
                    Need something personalised?{' '}
                    <Link href="/custom-order" className="bag-nudge-link">Start a custom order</Link>
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </Layout>
  );
}

function EmptyBagState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bag-empty-state"
    >
      <div className="bag-empty-visual">
        <div className="bag-empty-icon-wrap">
          <ShoppingBag size={40} />
        </div>
        <div className="bag-empty-candle-ambient" />
      </div>

      <div className="bag-empty-copy">
        <h2 className="bag-empty-heading">Your bag is empty.</h2>
        <p className="bag-empty-subtext">
          Every Kinzee candle is hand-poured after you choose it.
          <br />
          Start browsing to find yours.
        </p>
      </div>

      <div className="bag-empty-actions">
        <Link href="/shop" className="primary-btn">
          <span aria-hidden="true"><ShoppingBag size={16} /></span>
            Explore Collections
            <ArrowRight size={15} style={{ marginLeft: 8 }} />
        </Link>
        <Link href="/custom-order" className="bag-empty-custom-link">
          <Sparkles size={14} />
          <span>Or design something unique</span>
        </Link>
      </div>

      <div className="bag-empty-collections-preview">
        {[
          'https://images.unsplash.com/photo-1612180030229-3d6e1cc71854?auto=format&fit=crop&w=300&q=70',
          'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=300&q=70',
          'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=70',
        ].map((src, i) => (
          <Link href="/shop" key={i} className="bag-empty-preview-thumb">
            <img src={src} alt="Collection preview" loading="lazy" />
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
