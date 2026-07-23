import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, MessageCircle, Phone, Search, Lock, Package, Calendar, RefreshCw } from 'lucide-react';
import { Layout } from '../components/Layout.jsx';
import { api } from '../api/client.js';
import { StudioContactCard } from '../components/StudioContactCard.jsx';

export function Tracking() {
  const [form, setForm] = useState({ orderNumber: '', phone: '' });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Logged-in customer dashboard orders
  const [customer, setCustomer] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  async function checkLoggedInUser() {
    try {
      const meRes = await api.get('/customer-auth/me');
      if (meRes.data.customer) {
        setCustomer(meRes.data.customer);
        const dashRes = await api.get('/customer-auth/dashboard');
        const orders = dashRes.data.orders || [];
        setActiveOrders(orders);
        
        // Auto-select the first order to track immediately
        if (orders.length > 0) {
          setOrder(orders[0]);
        }
      }
    } catch (err) {
      console.error('Auth verification failed', err);
    } finally {
      setCheckingAuth(false);
    }
  }

  // Handle guest search submit
  async function handleGuestSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setOrder(null);
    try {
      const res = await api.post('/orders/track', form);
      if (res.data.order) {
        setOrder(res.data.order);
      } else {
        setError('No order found with that order number and phone combination.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'No order found matching these details.');
    } finally {
      setLoading(false);
    }
  }

  // Helper to resolve custom/catalog milestones
  function getMilestones(ord) {
    const isCustom = ord.source === 'quote';
    const status = ord.status;
    const isPaid = ord.paymentPlan?.advanceStatus === 'paid';

    if (isCustom) {
      return [
        { label: 'Request Received', check: true, current: false },
        { label: 'Design Discussion', check: true, current: false },
        { label: 'Quote Approved', check: true, current: false },
        { label: 'Production Started', check: status !== 'placed' || isPaid, current: status === 'placed' && !isPaid },
        { label: 'Handcrafting', check: ['in_progress', 'ready', 'shipped', 'out_for_delivery', 'delivered'].includes(status), current: status === 'confirmed' },
        { label: 'Quality Check', check: ['ready', 'shipped', 'out_for_delivery', 'delivered'].includes(status), current: status === 'in_progress' },
        { label: 'Packaging', check: ['shipped', 'out_for_delivery', 'delivered'].includes(status), current: status === 'ready' },
        { label: 'Ready', check: ['shipped', 'out_for_delivery', 'delivered'].includes(status), current: status === 'shipped' },
        { label: 'Delivered', check: status === 'delivered', current: status === 'out_for_delivery' }
      ];
    } else {
      return [
        { label: 'Order Received', check: true, current: false },
        { label: 'Payment Confirmed', check: status !== 'placed' || isPaid, current: status === 'placed' && !isPaid },
        { label: 'Handcrafting', check: ['in_progress', 'ready', 'shipped', 'out_for_delivery', 'delivered'].includes(status), current: status === 'confirmed' },
        { label: 'Decoration', check: ['ready', 'shipped', 'out_for_delivery', 'delivered'].includes(status), current: status === 'in_progress' },
        { label: 'Packaging', check: ['shipped', 'out_for_delivery', 'delivered'].includes(status), current: status === 'ready' },
        { label: 'Ready for Shipping', check: ['shipped', 'out_for_delivery', 'delivered'].includes(status), current: status === 'shipped' },
        { label: 'Delivered', check: status === 'delivered', current: status === 'out_for_delivery' }
      ];
    }
  }

  // Resolve current status updates and descriptions
  function getStudioUpdate(ord) {
    const status = ord.status;
    const isCustom = ord.source === 'quote';

    const updates = {
      placed: {
        text: 'Our artisans are preparing raw soy wax blocks and selecting cotton wicks for your pour.',
        next: 'Pouring schedule starts tomorrow.',
        img: null
      },
      confirmed: {
        text: 'Your order has been verified. We have allocated specialized containers and began handcrafting.',
        next: 'Fragrance curation starts tomorrow.',
        img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80'
      },
      in_progress: {
        text: isCustom 
          ? 'Artisans are currently handcrafting the bespoke molds, layering florals, and hand-pouring wax.'
          : 'Fragrance blocks are being poured in small batches. Soy waxes are curing in their glass containers.',
        next: 'Wax decoration begins tomorrow.',
        img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80'
      },
      ready: {
        text: 'Hand-pouring is complete. Your creations are drying, curing, and passing visual quality audits.',
        next: 'Packaging and wax-sealed ribbons will be wrapped next.',
        img: 'https://images.unsplash.com/photo-1508747703725-719ae25d3d4b?auto=format&fit=crop&w=900&q=80'
      },
      shipped: {
        text: 'Artisans have wrapped your candles in custom kraft boxes and secured them for courier transport.',
        next: 'Transit code confirmation details arriving soon.',
        img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80'
      },
      out_for_delivery: {
        text: 'Your package is sorted and out for doorstep delivery today.',
        next: 'Arriving this afternoon.',
        img: null
      },
      delivered: {
        text: 'Delivered! We hope our candles become part of your memorable moments.',
        next: 'Enjoy the slow craft aromas.',
        img: null
      },
      cancelled: {
        text: 'This order cancellation is confirmed.',
        next: 'Refunds or credits will update on your advance statement.',
        img: null
      }
    };

    return updates[status] || { text: 'Your order is undergoing review.', next: 'Updates shortly.', img: null };
  }

  return (
    <Layout>
      <div className="tracking-page-shell">
        
        {/* Guest Track Entry (Search Form) */}
        {!customer && !order && (
          <section className="tracking-entry-section">
            <div className="tracking-entry-container">
              <div className="tracking-entry-left">
                <p className="eyebrow">Atelier Tracker</p>
                <h1>Track Your Journey</h1>
                <p className="tracking-entry-copy">
                  Need to check an order? Enter the phone number used when placing your order together with your order number. 
                  This helps keep your order private.
                </p>
                <div className="tracking-entry-help">
                  <p>
                    Orders placed with an account are consolidated automatically inside the profile settings. 
                  </p>
                  <button 
                    type="button" 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-customer-auth'))}
                    className="track-auth-trigger"
                  >
                    Open My Kinzee Profile →
                  </button>
                </div>
              </div>

              <div className="tracking-entry-right">
                {error && <div className="auth-error-message">{error}</div>}

                <form onSubmit={handleGuestSubmit} className="tracking-search-form">
                  <label className="auth-input-label">
                    <span>Order Number</span>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. KIN-8409"
                      value={form.orderNumber}
                      onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                    />
                  </label>

                  <label className="auth-input-label">
                    <span>Phone Number</span>
                    <input 
                      type="tel" 
                      required 
                      placeholder="e.g. +91 70007 01579"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </label>

                  <button type="submit" disabled={loading} className="tracking-search-btn">
                    {loading ? 'Searching Atelier...' : 'Locate My Order'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* Logged in Active Orders Horizontal selection bar */}
        {customer && activeOrders.length > 0 && (
          <section className="tracking-active-orders-section">
            <div className="tracking-active-orders-container">
              <p className="active-orders-header-meta">Hi, {customer.name || 'Friend'} • Track Active Creations</p>
              <div className="active-orders-row">
                {activeOrders.map((ord) => (
                  <button 
                    key={ord.orderNumber}
                    type="button"
                    onClick={() => setOrder(ord)}
                    className={`active-order-choice-card ${order?.orderNumber === ord.orderNumber ? 'is-selected' : ''}`}
                  >
                    <Package size={16} className="active-order-icon" />
                    <div className="active-order-meta">
                      <span className="active-order-title">
                        {ord.items[0]?.name || 'Custom Order'}
                      </span>
                      <span className="active-order-number">#{ord.orderNumber}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Logged In but No Active Orders State */}
        {customer && activeOrders.length === 0 && !order && (
          <section className="tracking-empty-dashboard-section">
            <div className="tracking-empty-container">
              <h2>No Active Orders</h2>
              <p>
                You don't have any active orders to track. 
                Any custom orders or shop purchases you make under <strong>{customer.phone}</strong> will automatically appear here.
              </p>
              <button 
                type="button" 
                onClick={() => setCustomer(null)}
                className="guest-track-fallback-btn"
              >
                Track a Guest Order Instead
              </button>
            </div>
          </section>
        )}

        {/* Dynamic Journey Timeline & Studio Updates */}
        {order && (
          <section className="tracking-journey-section">
            <div className="tracking-journey-container">
              
              {/* Back controls for guest tracker */}
              {!customer && (
                <button 
                  type="button" 
                  onClick={() => setOrder(null)} 
                  className="tracking-back-search-btn"
                >
                  ← Track another order
                </button>
              )}

              {/* Order Meta Header Info */}
              <div className="tracking-order-meta-card">
                <div className="meta-card-main">
                  <div className="meta-card-title-block">
                    <p className="meta-eyebrow">
                      {order.source === 'quote' ? 'Bespoke Custom Creation' : 'Atelier Small Batch Order'}
                    </p>
                    <h2>{order.items[0]?.name || 'Bespoke Candle'}</h2>
                    <span className="meta-order-id">Order ID: #{order.orderNumber}</span>
                  </div>
                  <div className="meta-card-details-grid">
                    <div className="meta-detail-col">
                      <span className="meta-label">Placed On</span>
                      <span className="meta-val">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}</span>
                    </div>
                    <div className="meta-detail-col">
                      <span className="meta-label">Estimated Completion</span>
                      <span className="meta-val">
                        {new Date(new Date(order.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Split Layout: Left vertical milestones timeline, Right Studio update cards */}
              <div className="tracking-journey-split-grid">
                
                {/* Milestones Left Column */}
                <div className="tracking-milestones-column">
                  <h3 className="tracking-column-heading">Handcrafted Journey</h3>
                  <div className="tracking-vertical-timeline">
                    {getMilestones(order).map((step, idx) => (
                      <div 
                        key={idx}
                        className={`timeline-step-row ${step.check ? 'is-completed' : ''} ${step.current ? 'is-active' : ''}`}
                      >
                        <div className="timeline-node-column">
                          <div className="timeline-node-circle">
                            {step.check ? (
                              <Check size={12} className="timeline-check-icon" />
                            ) : step.current ? (
                              <span className="timeline-pulsate-dot" />
                            ) : null}
                          </div>
                          {idx < getMilestones(order).length - 1 && (
                            <div className="timeline-connector-line" />
                          )}
                        </div>
                        <div className="timeline-label-column">
                          <span className="timeline-label-text">{step.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Studio Updates Right Column */}
                <div className="tracking-updates-column">
                  <h3 className="tracking-column-heading">Current Update</h3>
                  
                  <div className="studio-update-timeline-card">
                    <div className="studio-update-header">
                      <span className="studio-badge">Atelier Progress</span>
                      <span className="studio-time-meta">Live status</span>
                    </div>
                    
                    <p className="studio-update-desc">
                      &ldquo;{getStudioUpdate(order).text}&rdquo;
                    </p>

                    {getStudioUpdate(order).img && (
                      <div className="studio-update-visual-wrapper">
                        <img 
                          src={getStudioUpdate(order).img} 
                          alt="Candle crafting in Indore studio" 
                          loading="lazy" 
                        />
                        <div className="studio-visual-overlay" />
                      </div>
                    )}

                    <div className="studio-update-expected-step">
                      <span className="expected-label">Expected Next Step:</span>
                      <p className="expected-desc">{getStudioUpdate(order).next}</p>
                    </div>
                  </div>

                  {/* Reusable Studio Contact Card */}
                  <StudioContactCard type="order" data={order} />

                </div>

              </div>

            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}
