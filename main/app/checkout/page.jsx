'use client';

import './checkout.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Phone,
  MessageCircle,
  Tag,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Layout } from '@/components/Layout.jsx';
import { FlameButton } from '@/components/FlameButton.jsx';
import { useCart } from '@/components/CartContext.jsx';
import { api } from '@/lib/api.js';

const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917000701579';

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);

  const [contact, setContact] = useState({ name: '', email: '' });
  const [delivery, setDelivery] = useState({ address: '', pincode: '', city: '', phone: '', method: 'post' });

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);

  const discountAmount = appliedPromo ? Math.floor(cartTotal * (appliedPromo.percentage / 100)) : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  async function handleApplyPromo(codeToApply) {
    const code = (codeToApply || promoCode).trim();
    if (!code) return;
    setApplyingPromo(true);
    setPromoError('');
    try {
      const res = await api.post('/promo/validate', {
        code: code.toUpperCase(),
        subtotal: cartTotal
      });
      setAppliedPromo(res.data);
      setPromoCode('');
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code');
    } finally {
      setApplyingPromo(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoError('');
  }

  useEffect(() => {
    async function checkCustomerSession() {
      try {
        const res = await api.get('/customer-auth/me');
        if (res.data.customer) {
          setCustomer(res.data.customer);
          setContact({
            name: res.data.customer.name || '',
            email: res.data.customer.email || ''
          });
          const saved = res.data.customer.savedAddresses;
          if (saved && saved.length > 0) {
            setDelivery({
              address: saved[0].street || '',
              city: saved[0].city || '',
              pincode: saved[0].zip || '',
              phone: saved[0].phone || res.data.customer.phone || '',
              method: 'post'
            });
          } else {
            setDelivery(prev => ({
              ...prev,
              phone: res.data.customer.phone || ''
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch customer session at checkout:', err);
      }
    }
    checkCustomerSession();
  }, []);

  const isEmpty = cart.length === 0;

  function goNext() { setStep((s) => Math.min(s + 1, 2)); }
  function goBack() { setStep((s) => Math.max(s - 1, 0)); }

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
      const customerInfo = {
        name: contact.name,
        email: contact.email,
        phone: delivery.phone,
        address: `${delivery.address}, ${delivery.city} - ${delivery.pincode}`,
        pincode: delivery.pincode,
      };
      
      const response = await api.post('/orders', { 
        items, 
        customer: customerInfo, 
        deliveryMethod: delivery.method,
        discountCode: appliedPromo?.code
      });
      const { orderNumber, razorpayOrder, amountDueNow } = response.data;
      
      if (razorpayOrder.id.startsWith('dev_')) {
        await api.post(`/orders/verify-advance`, {
          orderNumber,
          razorpay_order_id: razorpayOrder.id,
          razorpay_payment_id: `dev_pay_${Date.now()}`,
          razorpay_signature: 'dev_mock_sig'
        });
        setResult({ order: { orderNumber }, customer: customerInfo, amountDueNow });
        clearCart();
        return;
      }

      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        setError('Razorpay SDK failed to load. Are you offline?');
        setSubmitting(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Candle by Kinzee",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (paymentResponse) {
          try {
            await api.post(`/orders/verify-advance`, {
              orderNumber,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });
            setResult({ order: { orderNumber }, customer: customerInfo, amountDueNow });
            clearCart();
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: "#000000"
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
          }
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (paymentResponse) {
        setError(paymentResponse.error.description || 'Payment failed.');
        setSubmitting(false);
      });
      paymentObject.open();

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again or contact us on WhatsApp.');
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Layout>
        <ConfirmationPanel result={result} />
      </Layout>
    );
  }

  if (isEmpty) {
    return (
      <Layout>
        <div className="checkout-empty-state">
          <h2>Your bag is empty</h2>
          <p>Add some handcrafted candles before proceeding to checkout.</p>
          <Link href="/shop">
            <FlameButton>Explore Collection</FlameButton>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="checkout-page-shell">
        <div className="checkout-main-content">
          
          <div className="checkout-steps-indicator">
            {['Contact', 'Delivery', 'Review & Pay'].map((label, idx) => (
              <React.Fragment key={label}>
                <div
                  className={`checkout-step-tab ${
                    step === idx ? 'is-active' : step > idx ? 'is-completed' : ''
                  }`}
                  onClick={() => idx < step && setStep(idx)}
                >
                  <span className="step-num">{step > idx ? <Check size={12} /> : idx + 1}</span>
                  <span className="step-label">{label}</span>
                </div>
                {idx < 2 && <div className="checkout-step-connector" />}
              </React.Fragment>
            ))}
          </div>

          <div className="checkout-mobile-summary-toggle">
            <button
              type="button"
              className="checkout-summary-toggle-btn"
              onClick={() => setSummaryOpen(!summaryOpen)}
            >
              <div className="toggle-left">
                <ShoppingBag size={16} />
                <span>{summaryOpen ? 'Hide Order Summary' : 'Show Order Summary'}</span>
                {summaryOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
              <span className="toggle-amount">₹{finalTotal.toLocaleString('en-IN')}</span>
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
                  <OrderSummaryContent
                    cart={cart}
                    cartTotal={cartTotal}
                    appliedPromo={appliedPromo}
                    handleApplyPromo={handleApplyPromo}
                    handleRemovePromo={handleRemovePromo}
                    promoCode={promoCode}
                    setPromoCode={setPromoCode}
                    promoError={promoError}
                    applyingPromo={applyingPromo}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepPanel key="contact">
                <ContactStep
                  contact={contact}
                  setContact={setContact}
                  customer={customer}
                  onNext={goNext}
                />
              </StepPanel>
            )}
            {step === 1 && (
              <StepPanel key="delivery">
                <DeliveryStep
                  delivery={delivery}
                  setDelivery={setDelivery}
                  customer={customer}
                  onNext={goNext}
                  onBack={goBack}
                  appliedPromo={appliedPromo}
                  handleApplyPromo={handleApplyPromo}
                  handleRemovePromo={handleRemovePromo}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  promoError={promoError}
                  applyingPromo={applyingPromo}
                />
              </StepPanel>
            )}
            {step === 2 && (
              <StepPanel key="review">
                <ReviewStep
                  contact={contact}
                  delivery={delivery}
                  cart={cart}
                  cartTotal={finalTotal}
                  onBack={goBack}
                  onPlace={placeOrder}
                  submitting={submitting}
                  error={error}
                  goToStep={setStep}
                  appliedPromo={appliedPromo}
                  handleApplyPromo={handleApplyPromo}
                  handleRemovePromo={handleRemovePromo}
                  promoCode={promoCode}
                  setPromoCode={setPromoCode}
                  promoError={promoError}
                  applyingPromo={applyingPromo}
                />
              </StepPanel>
            )}
          </AnimatePresence>
        </div>

        <aside className="checkout-sidebar">
          <div className="checkout-sidebar-card">
            <h3 className="checkout-sidebar-heading">Order Summary</h3>
            <OrderSummaryContent
              cart={cart}
              cartTotal={cartTotal}
              appliedPromo={appliedPromo}
              handleApplyPromo={handleApplyPromo}
              handleRemovePromo={handleRemovePromo}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              promoError={promoError}
              applyingPromo={applyingPromo}
            />
          </div>
        </aside>

      </div>
    </Layout>
  );
}

function StepPanel({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="checkout-step-panel"
    >
      {children}
    </motion.div>
  );
}

function ContactStep({ contact, setContact, customer, onNext }) {
  function handleSubmit(e) {
    e.preventDefault();
    onNext();
  }

  return (
    <form className="checkout-form-block" onSubmit={handleSubmit}>
      <div className="checkout-step-heading-group">
        <p className="eyebrow">Step 1 of 3</p>
        <h2 className="checkout-step-heading">Contact Information</h2>
        <p className="checkout-step-subtext">
          {customer ? `Welcome back, ${customer.name || 'Friend'}!` : 'Enter your contact details so we can confirm your order updates.'}
        </p>
      </div>

      <div className="checkout-fields-grid">
        <label className="checkout-field-label checkout-field-full">
          <span>Full Name</span>
          <input
            type="text"
            required
            placeholder="e.g. Eleanor Vance"
            value={contact.name}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
          />
        </label>

        <label className="checkout-field-label checkout-field-full">
          <span>Email Address</span>
          <input
            type="email"
            required
            placeholder="e.g. customer@example.com"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value.toLowerCase() })}
          />
          <small>We&apos;ll send your order confirmation and dispatch details here</small>
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

function DeliveryStep({ 
  delivery, 
  setDelivery, 
  customer, 
  onNext, 
  onBack,
  appliedPromo,
  handleApplyPromo,
  handleRemovePromo,
  promoCode,
  setPromoCode,
  promoError,
  applyingPromo
}) {
  const hasSaved = customer && customer.savedAddresses && customer.savedAddresses.length > 0;
  const [addressMode, setAddressMode] = useState(hasSaved ? 'saved' : 'manual');
  const [deliveryError, setDeliveryError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setDeliveryError('');
    if (!delivery.address || !delivery.city || !delivery.pincode || !delivery.phone) {
      setDeliveryError('Please fill or select a valid delivery address before proceeding.');
      return;
    }
    onNext();
  }

  return (
    <form className="checkout-form-block" onSubmit={handleSubmit}>
      {deliveryError && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
          {deliveryError}
        </div>
      )}
      <div className="checkout-step-heading-group">
        <p className="eyebrow">Step 2 of 3</p>
        <h2 className="checkout-step-heading">Where should we send it?</h2>
        <p className="checkout-step-subtext">
          Your handcrafted candles will be carefully packaged and dispatched from our Indore studio.
        </p>
      </div>

      {/* ADDRESS MODE SELECTOR TOGGLE BUTTONS */}
      {hasSaved && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => {
              setAddressMode('saved');
              if (customer.savedAddresses[0]) {
                const addr = customer.savedAddresses[0];
                setDelivery({
                  ...delivery,
                  address: addr.street || '',
                  city: addr.city || '',
                  pincode: addr.zip || '',
                  phone: addr.phone || customer.phone || ''
                });
              }
            }}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '10px',
              border: addressMode === 'saved' ? '2px solid #b58a3c' : '1px solid #ddd',
              background: addressMode === 'saved' ? '#fffdfa' : '#fff',
              color: addressMode === 'saved' ? '#b58a3c' : '#555',
              fontWeight: 7,
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MapPin size={15} /> Select Saved Address ({customer.savedAddresses.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setAddressMode('manual');
              setDelivery({
                address: '',
                city: '',
                pincode: '',
                phone: customer?.phone || '',
                method: delivery.method
              });
            }}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '10px',
              border: addressMode === 'manual' ? '2px solid #b58a3c' : '1px solid #ddd',
              background: addressMode === 'manual' ? '#fffdfa' : '#fff',
              color: addressMode === 'manual' ? '#b58a3c' : '#555',
              fontWeight: 7,
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Plus size={15} /> Enter New Address
          </button>
        </div>
      )}

      {/* MODE 1: SAVED ADDRESS CARDS GRID */}
      {hasSaved && addressMode === 'saved' && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {customer.savedAddresses.map((addr, idx) => {
              const isSelected = delivery.address === (addr.street || '') && delivery.pincode === (addr.zip || '');
              return (
                <div
                  key={addr._id || idx}
                  onClick={() => {
                    setDelivery({
                      ...delivery,
                      address: addr.street || '',
                      city: addr.city || '',
                      pincode: addr.zip || '',
                      phone: addr.phone || customer.phone || ''
                    });
                  }}
                  style={{
                    border: isSelected ? '2px solid #b58a3c' : '1px solid #e5e5e5',
                    background: isSelected ? '#fffdfa' : '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: isSelected ? '0 4px 14px rgba(181,138,60,0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <strong style={{ fontSize: 11, textTransform: 'uppercase', color: '#b58a3c', letterSpacing: '0.5px' }}>
                      {addr.label || 'Saved Address'}
                    </strong>
                    {isSelected && (
                      <span style={{ fontSize: 10, background: '#2e7d32', color: '#fff', padding: '2px 8px', borderRadius: 4, fontWeight: 7, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <CheckCircle2 size={10} /> Selected
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 6, color: '#111' }}>{addr.fullName}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#555', lineHeight: 1.4 }}>
                    {addr.street}, {addr.city} ({addr.zip})
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: 11, color: '#888' }}>T: {addr.phone}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: MANUAL FORM INPUTS (Only rendered when addressMode === 'manual' or no saved addresses) */}
      {(!hasSaved || addressMode === 'manual') && (
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

          <label className="checkout-field-label checkout-field-full">
            <span>
              <Phone size={13} />
              Contact Phone Number (For Shipping Partner)
            </span>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={delivery.phone}
              onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
            />
            <small>Required by couriers to reach you during delivery</small>
          </label>
        </div>
      )}

      <div className="checkout-delivery-method-group">
        <p className="checkout-delivery-method-label">Delivery Method</p>
        <div className="checkout-method-cards">
          <button
            type="button"
            className={`checkout-method-card ${delivery.method === 'post' ? 'is-selected' : ''}`}
            onClick={() => setDelivery({ ...delivery, method: 'post' })}
          >
            <div className="method-radio">{delivery.method === 'post' && <div className="radio-inner" />}</div>
            <div className="method-details">
              <strong>Standard Courier Shipping</strong>
              <span>Dispatched within 7–10 working days</span>
            </div>
          </button>
        </div>
      </div>

      {/* PROMO CODE BOX IN STEP 2 */}
      <div style={{ background: '#fff8ef', border: '1px solid #e9dcc9', padding: '16px', borderRadius: '10px', margin: '24px 0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontFamily: 'var(--font-serif)', color: '#b58a3c', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag size={13} /> Have a Promo or Coupon Code?
        </h4>
        {appliedPromo ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5e9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
            <div>
              <span style={{ fontSize: 10, color: '#2e7d32', fontWeight: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Promo Applied ({appliedPromo.percentage}% Off)</span>
              <strong style={{ fontSize: 14, color: '#1b5e20' }}>{appliedPromo.code}</strong>
            </div>
            <button type="button" onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#c62828', fontSize: 12, cursor: 'pointer', fontWeight: 6 }}>
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter Code (e.g. ATELIER10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={applyingPromo}
                style={{ flexGrow: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', textTransform: 'uppercase' }}
              />
              <button
                type="button"
                onClick={() => handleApplyPromo()}
                disabled={applyingPromo || !promoCode.trim()}
                style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 6 }}
              >
                {applyingPromo ? 'Validating...' : 'Apply Code'}
              </button>
            </div>
            {promoError && (
              <p style={{ color: '#c62828', fontSize: 11, margin: '6px 0 0 0', fontWeight: 5 }}>
                ❌ {promoError}
              </p>
            )}
          </div>
        )}
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

function ReviewStep({ 
  contact, 
  delivery, 
  cart, 
  cartTotal, 
  onBack, 
  onPlace, 
  submitting, 
  error, 
  goToStep,
  appliedPromo,
  handleApplyPromo,
  handleRemovePromo,
  promoCode,
  setPromoCode,
  promoError,
  applyingPromo
}) {
  return (
    <div className="checkout-form-block">
      <div className="checkout-step-heading-group">
        <p className="eyebrow">Step 3 of 3</p>
        <h2 className="checkout-step-heading">Review & Place Order</h2>
        <p className="checkout-step-subtext">
          Confirm your details before we begin crafting your order.
        </p>
      </div>

      <div className="checkout-review-section">
        <div className="checkout-review-section-header">
          <span>Contact</span>
          <button type="button" onClick={() => goToStep(0)} className="checkout-edit-link">Edit</button>
        </div>
        <div className="checkout-review-details">
          <p>{contact.name}</p>
          <p>{contact.email}</p>
        </div>
      </div>

      <div className="checkout-review-section">
        <div className="checkout-review-section-header">
          <span>Delivery</span>
          <button type="button" onClick={() => goToStep(1)} className="checkout-edit-link">Edit</button>
        </div>
        <div className="checkout-review-details">
          <p>{delivery.address}</p>
          <p>{delivery.city} — {delivery.pincode}</p>
          <p>T: {delivery.phone}</p>
          <p className="checkout-review-method">
            {delivery.method === 'post' ? '📦 Standard Shipping' : '🏠 Personal Pickup'}
          </p>
        </div>
      </div>

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
              <span className="checkout-review-item-total">₹{((item.unitPrice ?? item.basePrice) * item.qty).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PROMO CODE BOX IN STEP 3 */}
      <div style={{ background: '#fff8ef', border: '1px solid #e9dcc9', padding: '16px', borderRadius: '10px', margin: '20px 0' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', fontFamily: 'var(--font-serif)', color: '#b58a3c', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Tag size={13} /> Have a Promo or Coupon Code?
        </h4>
        {appliedPromo ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5e9', padding: '10px 14px', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
            <div>
              <span style={{ fontSize: 10, color: '#2e7d32', fontWeight: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Promo Applied ({appliedPromo.percentage}% Off)</span>
              <strong style={{ fontSize: 14, color: '#1b5e20' }}>{appliedPromo.code}</strong>
            </div>
            <button type="button" onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#c62828', fontSize: 12, cursor: 'pointer', fontWeight: 6 }}>
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter Code (e.g. ATELIER10)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={applyingPromo}
                style={{ flexGrow: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '13px', textTransform: 'uppercase' }}
              />
              <button
                type="button"
                onClick={() => handleApplyPromo()}
                disabled={applyingPromo || !promoCode.trim()}
                style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 6 }}
              >
                {applyingPromo ? 'Validating...' : 'Apply Code'}
              </button>
            </div>
            {promoError && (
              <p style={{ color: '#c62828', fontSize: 11, margin: '6px 0 0 0', fontWeight: 5 }}>
                ❌ {promoError}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="checkout-advance-info-card">
        <div className="checkout-advance-icon">🕯️</div>
        <div>
          <strong>Payment required to begin crafting</strong>
          <p>
            Total Payment of <strong>₹{cartTotal.toLocaleString('en-IN')}</strong> is required to initiate hand-pouring and crafting of your candles.
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

function OrderSummaryContent({
  cart,
  cartTotal,
  appliedPromo,
  handleApplyPromo,
  handleRemovePromo,
  promoCode,
  setPromoCode,
  promoError,
  applyingPromo
}) {
  const discountAmount = appliedPromo ? Math.floor(cartTotal * (appliedPromo.percentage / 100)) : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

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
          <span className="order-summary-item-price">₹{((item.unitPrice ?? item.basePrice) * item.qty).toLocaleString('en-IN')}</span>
        </div>
      ))}

      <div className="order-summary-divider" />

      <div className="order-summary-totals">
        <div className="order-summary-total-row">
          <span>Subtotal</span>
          <span>₹{cartTotal.toLocaleString('en-IN')}</span>
        </div>
        {appliedPromo && (
          <div className="order-summary-total-row" style={{ color: '#2e7d32', fontWeight: 6 }}>
            <span>Promo Discount ({appliedPromo.percentage}%)</span>
            <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="order-summary-total-row order-summary-total-row--muted">
          <span>Shipping</span>
          <span>At checkout</span>
        </div>
        <div className="order-summary-divider" />
        <div className="order-summary-total-row order-summary-total-row--advance">
          <span>Payment due now (100%)</span>
          <span>₹{finalTotal.toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="checkout-promo-box" style={{ marginTop: 20 }}>
        {appliedPromo ? (
          <div className="checkout-promo-applied" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5e9', padding: '10px 14px', borderRadius: 8, border: '1px solid #c8e6c9' }}>
            <div>
              <span style={{ fontSize: 10, color: '#2e7d32', fontWeight: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>Promo Applied</span>
              <strong style={{ fontSize: 13, color: '#1b5e20' }}>{appliedPromo.code}</strong>
            </div>
            <button type="button" onClick={handleRemovePromo} style={{ background: 'none', border: 'none', color: '#c62828', fontSize: 11, cursor: 'pointer', fontWeight: 6 }}>
              Remove
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={applyingPromo}
              style={{ flexGrow: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, textTransform: 'uppercase' }}
            />
            <button
              type="button"
              onClick={() => handleApplyPromo()}
              disabled={applyingPromo || !promoCode.trim()}
              style={{ background: '#111', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 6 }}
            >
              {applyingPromo ? '...' : 'Apply'}
            </button>
          </div>
        )}
        {promoError && (
          <p className="promo-error-text" style={{ color: '#c62828', fontSize: 11, margin: '6px 0 0 0', fontWeight: 5 }}>
            ❌ {promoError}
          </p>
        )}
      </div>

      <div className="order-summary-crafted-note" style={{ marginTop: 20 }}>
        <Sparkles size={12} />
        <span>Handcrafted after your order — made especially for you.</span>
      </div>
    </div>
  );
}

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
    <div className="checkout-confirmation-shell">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="checkout-confirmation-card"
      >
        <div className="confirmation-badge-wrap">
          <div className="confirmation-badge">
            <Check size={28} />
          </div>
        </div>

        <p className="confirmation-eyebrow">Order Placed Successfully</p>
        <h1 className="confirmation-heading">Thank you, {customerName}!</h1>
        <p className="confirmation-subtext">
          Your order number is <strong className="confirmation-order-num">#{orderNumber}</strong>. We&apos;ve sent a receipt to your email.
        </p>

        <div className="confirmation-details-box">
          <div className="confirmation-detail-row">
            <span>Order Number</span>
            <strong>#{orderNumber}</strong>
          </div>
          <div className="confirmation-detail-row">
            <span>Payment Verified</span>
            <strong style={{ color: '#2e7d32' }}>₹{advance ? advance.toLocaleString('en-IN') : '0'} (Paid)</strong>
          </div>
          <div className="confirmation-detail-row">
            <span>Delivery Address</span>
            <span>{result.customer?.address || 'Indore'}</span>
          </div>
        </div>

        <div className="confirmation-next-steps">
          <h3>What happens next?</h3>
          <div className="next-steps-grid">
            {nextSteps.map((step, idx) => (
              <div key={idx} className="next-step-card">
                <span className="next-step-icon">{step.icon}</span>
                <h4>{step.heading}</h4>
                <p>{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="confirmation-actions">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="confirmation-wa-btn">
            <MessageCircle size={16} />
            Chat with Kinzee on WhatsApp
          </a>

          <Link href="/track" className="confirmation-track-btn">
            Track Order Progress
          </Link>
        </div>

      </motion.div>
    </div>
  );
}
