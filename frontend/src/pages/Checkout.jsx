import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { FlameButton } from '../components/FlameButton.jsx';
import { api } from '../api/client.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../components/CartContext.jsx';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MessageCircle,
  Package,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Phone,
  ShoppingBag,
} from 'lucide-react';

const STEPS = ['contact', 'delivery', 'review'];
const STEP_LABELS = ['Contact', 'Delivery', 'Review & Pay'];

const WA_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '917000701579';

export function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0=contact, 1=delivery, 2=review
  const [summaryOpen, setSummaryOpen] = useState(false); // mobile accordion
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [delivery, setDelivery] = useState({ address: '', pincode: '', city: '', method: 'post' });

  const isEmpty = cart.length === 0;

  // ─── Step navigation ────────────────────────────────────────────────
  function goNext() { setStep((s) => Math.min(s + 1, 2)); }
  function goBack() { setStep((s) => Math.max(s - 1, 0)); }

  // ─── Submission ──────────────────────────────────────────────────────
  async function placeOrder() {
    setSubmitting(true);
    setError('');
    try {
      const items = cart.map((c) => ({
        productId: c.productId,
        name: c.name,
        qty: c.qty,
        selectedOptions: c.selectedOptions,
      }));
      const customer = {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        address: `${delivery.address}, ${delivery.city} - ${delivery.pincode}`,
        pincode: delivery.pincode,
      };
      const response = await api.post('/orders', { items, customer, deliveryMethod: delivery.method });
      setResult({ ...response.data, customer });
      clearCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again or contact us on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Confirmation screen ─────────────────────────────────────────────
  if (result) {
    return (
      <Layout>
        <ConfirmationPanel result={result} />
      </Layout>
    );
  }

  // ─── Empty bag guard ─────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <Layout>
        <div className="checkout-empty-guard">
          <ShoppingBag size={44} className="checkout-empty-icon" />
          <h2>Your bag is empty</h2>
          <p>Add some candles before checking out.</p>
          <div className="checkout-empty-actions">
            <FlameButton type="button" onClick={() => navigate('/shop')}>
              Explore Collections
            </FlameButton>
            <button type="button" onClick={() => navigate('/bag')} className="checkout-back-bag-btn">
              Go to Bag
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="checkout-shell">

        {/* Left — Steps */}
        <div className="checkout-steps-column">

          {/* Eyebrow */}
          <div className="checkout-top-meta">
            <button type="button" onClick={() => navigate('/bag')} className="checkout-back-link">
              <ArrowLeft size={14} />
              <span>Back to Bag</span>
            </button>
          </div>

          {/* Step indicator */}
          <div className="checkout-step-indicator">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`checkout-step-node ${i <= step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}>
                  <div className="checkout-step-circle">
                    {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
                  </div>
                  <span className="checkout-step-label">{STEP_LABELS[i]}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`checkout-step-connector ${i < step ? 'is-done' : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile summary accordion */}
          <div className="checkout-mobile-summary-toggle">
            <button
              type="button"
              onClick={() => setSummaryOpen(!summaryOpen)}
              className="checkout-mobile-summary-btn"
            >
              <ShoppingBag size={15} />
              <span>Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
              <span className="checkout-mobile-summary-total">₹{cartTotal.toLocaleString('en-IN')}</span>
              {summaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {summaryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="checkout-mobile-summary-content"
                >
                  <OrderSummaryContent cart={cart} cartTotal={cartTotal} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step panels */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepPanel key="contact">
                <ContactStep
                  contact={contact}
                  setContact={setContact}
                  onNext={goNext}
                />
              </StepPanel>
            )}
            {step === 1 && (
              <StepPanel key="delivery">
                <DeliveryStep
                  delivery={delivery}
                  setDelivery={setDelivery}
                  onNext={goNext}
                  onBack={goBack}
                />
              </StepPanel>
            )}
            {step === 2 && (
              <StepPanel key="review">
                <ReviewStep
                  contact={contact}
                  delivery={delivery}
                  cart={cart}
                  cartTotal={cartTotal}
                  onBack={goBack}
                  onPlace={placeOrder}
                  submitting={submitting}
                  error={error}
                  goToStep={setStep}
                />
              </StepPanel>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Sticky sidebar */}
        <aside className="checkout-sidebar">
          <div className="checkout-sidebar-card">
            <h3 className="checkout-sidebar-heading">Order Summary</h3>
            <OrderSummaryContent cart={cart} cartTotal={cartTotal} />
          </div>
        </aside>

      </div>
    </Layout>
  );
}

// ─── Step wrapper animation ────────────────────────────────────────────────
function StepPanel({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -18 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="checkout-step-panel"
    >
      {children}
    </motion.div>
  );
}

// ─── Step 1: Contact ──────────────────────────────────────────────────────
function ContactStep({ contact, setContact, onNext }) {
  function handleSubmit(e) {
    e.preventDefault();
    onNext();
  }

  return (
    <form className="checkout-form-block" onSubmit={handleSubmit}>
      <div className="checkout-step-heading-group">
        <p className="eyebrow">Step 1 of 3</p>
        <h2 className="checkout-step-heading">Who's this for?</h2>
        <p className="checkout-step-subtext">
          No account needed. We'll send order updates over WhatsApp.
        </p>
      </div>

      <div className="checkout-reassurance-chip">
        <MessageCircle size={13} />
        <span>Guest checkout — no account required</span>
      </div>

      <div className="checkout-fields-grid">
        <label className="checkout-field-label">
          <span>
            <User size={13} />
            Full Name
          </span>
          <input
            type="text"
            required
            placeholder="Your full name"
            value={contact.name}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
          />
        </label>

        <label className="checkout-field-label">
          <span>
            <Phone size={13} />
            WhatsApp Number
          </span>
          <input
            type="tel"
            required
            placeholder="e.g. 98765 43210"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
          />
          <small>We'll send your order confirmation here</small>
        </label>

        <label className="checkout-field-label">
          <span>Email Address <span className="checkout-optional-tag">(Optional)</span></span>
          <input
            type="email"
            placeholder="Your email address"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
          />
        </label>
      </div>

      <div className="checkout-step-actions">
        <FlameButton type="submit">
          Continue to Delivery
          <ArrowRight size={15} style={{ marginLeft: 6 }} />
        </FlameButton>
      </div>
    </form>
  );
}

// ─── Step 2: Delivery ─────────────────────────────────────────────────────
function DeliveryStep({ delivery, setDelivery, onNext, onBack }) {
  function handleSubmit(e) {
    e.preventDefault();
    onNext();
  }

  return (
    <form className="checkout-form-block" onSubmit={handleSubmit}>
      <div className="checkout-step-heading-group">
        <p className="eyebrow">Step 2 of 3</p>
        <h2 className="checkout-step-heading">Where should we send it?</h2>
        <p className="checkout-step-subtext">
          Your handcrafted candles will be carefully packaged and dispatched from our Indore studio.
        </p>
      </div>

      <div className="checkout-fields-grid">
        <label className="checkout-field-label checkout-field-full">
          <span>
            <MapPin size={13} />
            Delivery Address
          </span>
          <textarea
            required
            rows={3}
            placeholder="House / flat number, street name, area, landmark..."
            value={delivery.address}
            onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
            className="checkout-textarea"
          />
        </label>

        <label className="checkout-field-label">
          <span>City</span>
          <input
            type="text"
            required
            placeholder="City"
            value={delivery.city}
            onChange={(e) => setDelivery({ ...delivery, city: e.target.value })}
          />
        </label>

        <label className="checkout-field-label">
          <span>Pincode</span>
          <input
            type="text"
            required
            maxLength={6}
            placeholder="6-digit pincode"
            value={delivery.pincode}
            onChange={(e) => setDelivery({ ...delivery, pincode: e.target.value })}
          />
        </label>
      </div>

      {/* Delivery method */}
      <div className="checkout-delivery-method-group">
        <p className="checkout-delivery-method-label">Delivery Method</p>
        <div className="checkout-method-cards">
          <button
            type="button"
            onClick={() => setDelivery({ ...delivery, method: 'post' })}
            className={`checkout-method-card ${delivery.method === 'post' ? 'is-selected' : ''}`}
          >
            <Package size={18} />
            <div>
              <strong>India Post</strong>
              <span>Standard tracked delivery across India</span>
            </div>
            <div className="checkout-method-radio">
              {delivery.method === 'post' && <Check size={12} />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDelivery({ ...delivery, method: 'personal' })}
            className={`checkout-method-card ${delivery.method === 'personal' ? 'is-selected' : ''}`}
          >
            <MapPin size={18} />
            <div>
              <strong>Personal Pickup</strong>
              <span>Collect from our Indore studio by appointment</span>
            </div>
            <div className="checkout-method-radio">
              {delivery.method === 'personal' && <Check size={12} />}
            </div>
          </button>
        </div>
      </div>

      <div className="checkout-step-actions">
        <button type="button" onClick={onBack} className="checkout-back-step-btn">
          <ArrowLeft size={14} />
          Back
        </button>
        <FlameButton type="submit">
          Review Order
          <ArrowRight size={15} style={{ marginLeft: 6 }} />
        </FlameButton>
      </div>
    </form>
  );
}

// ─── Step 3: Review & Pay ─────────────────────────────────────────────────
function ReviewStep({ contact, delivery, cart, cartTotal, onBack, onPlace, submitting, error, goToStep }) {
  const advance = Math.ceil(cartTotal * 0.5);

  return (
    <div className="checkout-form-block">
      <div className="checkout-step-heading-group">
        <p className="eyebrow">Step 3 of 3</p>
        <h2 className="checkout-step-heading">Review & Place Order</h2>
        <p className="checkout-step-subtext">
          Confirm your details before we begin crafting your order.
        </p>
      </div>

      {/* Contact review */}
      <div className="checkout-review-section">
        <div className="checkout-review-section-header">
          <span>Contact</span>
          <button type="button" onClick={() => goToStep(0)} className="checkout-edit-link">Edit</button>
        </div>
        <div className="checkout-review-details">
          <p>{contact.name}</p>
          <p>{contact.phone}</p>
          {contact.email && <p>{contact.email}</p>}
        </div>
      </div>

      {/* Delivery review */}
      <div className="checkout-review-section">
        <div className="checkout-review-section-header">
          <span>Delivery</span>
          <button type="button" onClick={() => goToStep(1)} className="checkout-edit-link">Edit</button>
        </div>
        <div className="checkout-review-details">
          <p>{delivery.address}</p>
          <p>{delivery.city} — {delivery.pincode}</p>
          <p className="checkout-review-method">
            {delivery.method === 'post' ? '📦 India Post' : '🏠 Personal Pickup'}
          </p>
        </div>
      </div>

      {/* Items review */}
      <div className="checkout-review-section">
        <div className="checkout-review-section-header">
          <span>Items</span>
        </div>
        <div className="checkout-review-items">
          {cart.map((item) => (
            <div key={item._lineId} className="checkout-review-item-row">
              <img src={item.image || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=60&q=70'} alt={item.name} />
              <div className="checkout-review-item-meta">
                <span>{item.name}</span>
                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                  <span className="checkout-review-options">
                    {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </span>
                )}
              </div>
              <span className="checkout-review-item-qty">×{item.qty}</span>
              <span className="checkout-review-item-total">₹{(item.basePrice * item.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment info */}
      <div className="checkout-advance-info-card">
        <div className="checkout-advance-icon">🕯️</div>
        <div>
          <strong>50% advance to begin crafting</strong>
          <p>
            An advance of <strong>₹{advance.toLocaleString('en-IN')}</strong> is required to begin crafting your order.
            The remaining balance will be collected when your candles are ready.
          </p>
        </div>
      </div>

      {error && <div className="checkout-error-msg">{error}</div>}

      <div className="checkout-step-actions">
        <button type="button" onClick={onBack} className="checkout-back-step-btn">
          <ArrowLeft size={14} />
          Back
        </button>
        <FlameButton type="button" onClick={onPlace} disabled={submitting}>
          {submitting ? 'Placing Order…' : 'Place Your Order'}
          {!submitting && <ArrowRight size={15} style={{ marginLeft: 6 }} />}
        </FlameButton>
      </div>
    </div>
  );
}

// ─── Shared: Order Summary content ───────────────────────────────────────
function OrderSummaryContent({ cart, cartTotal }) {
  const advance = Math.ceil(cartTotal * 0.5);

  return (
    <div className="order-summary-content">
      {cart.map((item) => (
        <div key={item._lineId} className="order-summary-item-row">
          <div className="order-summary-item-img-wrap">
            <img
              src={item.image || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=60&q=70'}
              alt={item.name}
            />
            {item.qty > 1 && <span className="order-summary-qty-badge">{item.qty}</span>}
          </div>
          <div className="order-summary-item-details">
            <span className="order-summary-item-name">{item.name}</span>
            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
              <span className="order-summary-item-opts">
                {Object.entries(item.selectedOptions).map(([k, v]) => `${v}`).join(' · ')}
              </span>
            )}
          </div>
          <span className="order-summary-item-price">₹{(item.basePrice * item.qty).toLocaleString('en-IN')}</span>
        </div>
      ))}

      <div className="order-summary-divider" />

      <div className="order-summary-totals">
        <div className="order-summary-total-row">
          <span>Subtotal</span>
          <span>₹{cartTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="order-summary-total-row order-summary-total-row--muted">
          <span>Shipping</span>
          <span>At checkout</span>
        </div>
        <div className="order-summary-divider" />
        <div className="order-summary-total-row order-summary-total-row--advance">
          <span>Advance due now (50%)</span>
          <span>₹{advance.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="order-summary-crafted-note">
        <Sparkles size={12} />
        <span>Handcrafted after your order — made especially for you.</span>
      </div>
    </div>
  );
}

// ─── Confirmation Panel ───────────────────────────────────────────────────
function ConfirmationPanel({ result }) {
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hello!')}`;
  const orderNumber = result.order?.orderNumber || result.orderNumber || 'KIN-XXXX';
  const customerName = result.customer?.name || 'Friend';
  const advance = result.amountDueNow;

  const nextSteps = [
    {
      icon: '🕯️',
      heading: 'We begin hand-crafting',
      detail: 'Your candles enter our Indore studio the next working day.',
    },
    {
      icon: '💬',
      heading: 'Kinzee reaches out on WhatsApp',
      detail: 'We\'ll confirm your order details and advance payment.',
    },
    {
      icon: '📦',
      heading: 'Your package is dispatched',
      detail: 'Carefully packed and shipped within 7–10 working days.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="checkout-confirmation-shell"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="confirm-check-badge"
      >
        <Check size={28} />
      </motion.div>

      <p className="eyebrow" style={{ textAlign: 'center' }}>Order Confirmed</p>
      <h1 className="confirm-heading">Thank you, {customerName}.</h1>
      <p className="confirm-order-num">Order #{orderNumber}</p>

      {advance && (
        <div className="confirm-advance-card">
          <strong>Advance payment pending: ₹{Number(advance).toLocaleString('en-IN')}</strong>
          <p>Kinzee will reach out on WhatsApp with payment details shortly.</p>
        </div>
      )}

      {/* What happens next */}
      <div className="confirm-next-steps">
        <h3 className="confirm-next-heading">What happens next</h3>
        <div className="confirm-steps-list">
          {nextSteps.map((ns, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
              className="confirm-step-row"
            >
              <div className="confirm-step-icon">{ns.icon}</div>
              <div className="confirm-step-content">
                <strong>{ns.heading}</strong>
                <span>{ns.detail}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action row */}
      <div className="confirm-action-row">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="confirm-btn confirm-btn--wa"
        >
          <MessageCircle size={16} />
          <span>Continue on WhatsApp</span>
        </a>

        <Link to="/shop" className="confirm-btn confirm-btn--shop">
          <span>Continue Shopping</span>
          <ArrowRight size={15} />
        </Link>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-customer-auth'))}
          className="confirm-btn confirm-btn--account"
        >
          <Sparkles size={14} />
          <span>My Kinzee <span className="confirm-optional-tag">(Optional)</span></span>
        </button>
      </div>

      <p className="confirm-footer-note">
        A Kinzee account lets you track your order status, view past orders, and manage custom requests — completely optional, forever free.
      </p>
    </motion.div>
  );
}
