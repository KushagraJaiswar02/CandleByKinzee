'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldCheck, User, MapPin, Package, Heart, Receipt, Plus, Trash2, ArrowRight, ShoppingBag, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api.js';
import { FlameButton } from './FlameButton.jsx';
import { useCart } from './CartContext.jsx';

export function CustomerAuthSheet({ isOpen, onClose }) {
  const { addToCart } = useCart();
  const [step, setStep] = useState('email-login'); // email-login, otp, profile-setup, dashboard
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [customer, setCustomer] = useState(null);
  
  const [dashboardData, setDashboardData] = useState({ orders: [], quotes: [] });
  const [activeTab, setActiveTab] = useState('orders');
  
  const [profileName, setProfileName] = useState('');
  
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', fullName: '', phone: '', street: '', city: '', state: '', zip: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  async function checkAuth() {
    try {
      const res = await api.get('/customer-auth/me');
      if (res.data.customer) {
        setCustomer(res.data.customer);
        setStep('dashboard');
        fetchDashboard();
      } else {
        setStep('email-login');
      }
    } catch (err) {
      setStep('email-login');
    }
  }

  async function fetchDashboard() {
    try {
      const res = await api.get('/customer-auth/dashboard');
      setDashboardData({
        orders: res.data.orders || [],
        quotes: res.data.quotes || []
      });
      if (res.data.customer) {
        setCustomer(res.data.customer);
        setProfileName(res.data.customer.name || '');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRequestOtp(e) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/customer-auth/request-otp', { email });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request verification code');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/customer-auth/verify-otp', { email, otp });
      const user = res.data.customer;
      setCustomer(user);
      
      if (!user.name) {
        setStep('profile-setup');
      } else {
        setStep('dashboard');
        fetchDashboard();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProfile(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/customer-auth/profile', { name: profileName });
      setCustomer(res.data.customer);
      setStep('dashboard');
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/customer-auth/address', newAddress);
      setCustomer(res.data.customer);
      setShowAddAddress(false);
      setNewAddress({ label: '', fullName: '', phone: '', street: '', city: '', state: '', zip: '' });
    } catch (err) {
      setError('Failed to save address');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAddress(id) {
    setError('');
    setLoading(true);
    try {
      const res = await api.delete(`/customer-auth/address/${id}`);
      setCustomer(res.data.customer);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete address');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setError('');
    setLoading(true);
    try {
      await api.post('/customer-auth/logout');
      setCustomer(null);
      setEmail('');
      setOtp('');
      setStep('email-login');
    } catch (err) {
      setError(err.response?.data?.message || 'Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleTrigger = (e) => {
      if (e.detail?.email) {
        setEmail(e.detail.email);
      }
    };
    window.addEventListener('open-customer-auth', handleTrigger);
    return () => window.removeEventListener('open-customer-auth', handleTrigger);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="auth-sheet-backdrop"
          />

          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="auth-sheet-container"
          >
            <div className="auth-sheet-header">
              <h3>{step === 'dashboard' ? 'My Kinzee' : 'Welcome to Kinzee'}</h3>
              <button type="button" onClick={onClose} className="auth-sheet-close-btn" aria-label="Close panel">
                <X size={18} />
              </button>
            </div>

            <div className="auth-sheet-body">
              {error && <div className="auth-error-message">{error}</div>}

              {step === 'email-login' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="auth-step-panel"
                >
                  <p className="auth-step-intro">
                    Your orders and custom requests can always be placed as a guest. 
                    Creating a profile simply keeps your journey organized.
                  </p>
                  
                  <form onSubmit={handleRequestOtp} className="auth-phone-form">
                    <label className="auth-input-label">
                      <span>Email Address</span>
                      <div className="auth-input-icon-wrapper">
                        <Mail size={16} className="auth-icon" />
                        <input 
                          type="email" 
                          required 
                          placeholder="e.g. customer@example.com" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value.toLowerCase())} 
                        />
                      </div>
                    </label>

                    <FlameButton type="submit" disabled={loading}>
                      {loading ? 'Sending Code...' : 'Continue with Email'}
                    </FlameButton>
                  </form>

                  <button type="button" onClick={onClose} className="auth-guest-cancel-btn">
                    Continue as Guest
                  </button>

                  <div className="auth-reassurance-microcopy">
                    <p>&ldquo;Every custom request is discussed personally before production.&rdquo;</p>
                  </div>
                </motion.div>
              )}

              {step === 'otp' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="auth-step-panel"
                >
                  <p className="auth-step-intro">
                    We sent a 6-digit verification code to <strong>{email}</strong>. Please check your inbox.
                  </p>

                  <form onSubmit={handleVerifyOtp} className="auth-otp-form">
                    <label className="auth-input-label">
                      <span>Verification Code</span>
                      <div className="auth-input-icon-wrapper">
                        <ShieldCheck size={16} className="auth-icon" />
                        <input 
                          type="text" 
                          maxLength={6} 
                          required 
                          placeholder="Enter 6-digit code" 
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value)}
                          className="auth-otp-input"
                        />
                      </div>
                    </label>

                    <FlameButton type="submit" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify & Continue'}
                    </FlameButton>
                  </form>

                  <button type="button" onClick={() => setStep('email-login')} className="auth-back-link">
                    Back to Email
                  </button>
                </motion.div>
              )}

              {step === 'profile-setup' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="auth-step-panel"
                >
                  <h3>Almost there</h3>
                  <p className="auth-step-intro">
                    Let us know your name to personalize your Kinzee Studio dashboard.
                  </p>

                  <form onSubmit={handleCompleteProfile} className="auth-profile-setup-form">
                    <label className="auth-input-label">
                      <span>Full Name</span>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Eleanor Vance" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)} 
                      />
                    </label>

                    <FlameButton type="submit" disabled={loading}>
                      Create My Profile
                    </FlameButton>
                  </form>
                </motion.div>
              )}

              {step === 'dashboard' && customer && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="auth-dashboard-panel"
                >
                  <div className="auth-dashboard-header">
                    <div className="auth-dashboard-header-title-row">
                      <h2>Hi, {customer.name || 'Friend'} 👋</h2>
                      <button 
                        type="button" 
                        onClick={handleLogout} 
                        className="dashboard-direct-logout-btn"
                      >
                        Logout
                      </button>
                    </div>
                    <p className="customer-meta-phone">{customer.email}</p>
                  </div>

                  <div className="auth-dashboard-tabs">
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('orders')} 
                      className={`dashboard-tab-btn ${activeTab === 'orders' ? 'is-active' : ''}`}
                    >
                      Orders ({dashboardData.orders.length})
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('quotes')} 
                      className={`dashboard-tab-btn ${activeTab === 'quotes' ? 'is-active' : ''}`}
                    >
                      Bespoke Requests ({dashboardData.quotes.length})
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('addresses')} 
                      className={`dashboard-tab-btn ${activeTab === 'addresses' ? 'is-active' : ''}`}
                    >
                      Addresses
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('profile')} 
                      className={`dashboard-tab-btn ${activeTab === 'profile' ? 'is-active' : ''}`}
                    >
                      Profile
                    </button>
                  </div>

                  <div className="dashboard-tab-content-area">
                    {activeTab === 'orders' && (
                      <div className="dashboard-orders-list">
                        {dashboardData.orders.length === 0 ? (
                          <p className="tab-empty-text">No orders placed yet. Orders matching your email will appear here automatically.</p>
                        ) : (
                          dashboardData.orders.map((ord) => (
                            <div key={ord.orderNumber} className="dashboard-order-card">
                              <div className="order-card-header">
                                <span className="order-num">#{ord.orderNumber}</span>
                                <span className={`order-status-badge status--${ord.status}`}>
                                  {ord.status}
                                </span>
                              </div>
                              <div className="order-card-items">
                                {ord.items.map((item, idx) => (
                                  <div key={idx} className="order-item-row">
                                    <span>{item.name} (x{item.qty})</span>
                                    <span>₹{item.priceAtOrder * item.qty}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="order-card-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Total Paid: ₹{ord.paymentPlan?.total || 0}</span>
                                  <span className="order-date" style={{ fontSize: '11px', color: '#64748b' }}>{new Date(ord.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <a 
                                    href={`/track?order=${ord.orderNumber}`}
                                    onClick={onClose}
                                    style={{
                                      flex: 1,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      padding: '6px 12px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      color: '#0f172a',
                                      background: '#f8fafc',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: '6px',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    Track Order ↗
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      ord.items.forEach(item => {
                                        addToCart({
                                          productId: item.productId || item._id,
                                          name: item.name,
                                          basePrice: item.priceAtOrder || item.basePrice || 0,
                                          qty: item.qty || 1,
                                          image: item.image,
                                          selectedOptions: item.selectedOptions || {}
                                        });
                                      });
                                      onClose();
                                    }}
                                    style={{
                                      flex: 1,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '4px',
                                      padding: '6px 12px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      color: '#ffffff',
                                      background: '#b58a3c',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Reorder Candles 🛍️
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'quotes' && (
                      <div className="dashboard-quotes-list">
                        {dashboardData.quotes.length === 0 ? (
                          <p className="tab-empty-text">No custom briefs submitted yet. Custom creations matching your email will show here.</p>
                        ) : (
                          dashboardData.quotes.map((q) => (
                            <div key={q._id} className="dashboard-quote-card">
                              <div className="quote-card-header">
                                <span className="quote-date">{new Date(q.createdAt).toLocaleDateString()}</span>
                                <span className={`quote-status-badge status--${q.status}`}>
                                  {q.status}
                                </span>
                              </div>
                              <p className="quote-card-desc">{q.description}</p>
                              {q.referenceImages?.length > 0 && (
                                <div className="quote-card-previews">
                                  {q.referenceImages.map((img, idx) => (
                                    <img key={idx} src={img} alt="Inspiration preview" className="quote-card-preview-thumb" />
                                  ))}
                                </div>
                              )}
                              {q.quotedPrice ? (
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', marginTop: '12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 700 }}>
                                      Studio Offer Received
                                    </span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                                      ₹{q.quotedPrice.toLocaleString('en-IN')}
                                    </span>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        addToCart({
                                          productId: `custom-quote-${q._id}`,
                                          name: `Custom Order: ${q.description.slice(0, 25)}...`,
                                          unitPrice: q.quotedPrice,
                                          basePrice: q.quotedPrice,
                                          image: q.referenceImages?.[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=600&q=80',
                                          qty: 1,
                                          selectedOptions: { Brief: q.description.slice(0, 30) }
                                        });
                                        onClose();
                                        window.location.href = '/checkout';
                                      }}
                                      style={{
                                        background: '#0f172a',
                                        color: '#ffffff',
                                        border: 'none',
                                        padding: '8px 10px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <ShoppingBag size={13} /> Accept & Checkout
                                    </button>
                                    
                                    <a
                                      href={`https://wa.me/917000701579?text=${encodeURIComponent(`Hi Kinzee Studio! I am reviewing my quote request for ₹${q.quotedPrice} (Brief: "${q.description.slice(0, 40)}..."). I would like to accept / discuss payment and delivery!`)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{
                                        background: '#ecfdf5',
                                        color: '#047857',
                                        border: '1px solid #a7f3d0',
                                        padding: '8px 10px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <MessageSquare size={13} /> Discuss on WhatsApp ↗
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div style={{ background: '#fffbebe6', border: '1px solid #fef3c7', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#92400e', marginTop: '10px' }}>
                                  ⏳ Studio team is reviewing your brief. We will send price quote here &amp; on WhatsApp shortly.
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'addresses' && (
                      <div className="dashboard-address-book">
                        {!showAddAddress ? (
                          <>
                            <button 
                              type="button" 
                              onClick={() => setShowAddAddress(true)}
                              className="add-address-trigger-btn"
                            >
                              <Plus size={16} />
                              <span>Add New Address</span>
                            </button>

                            <div className="addresses-list-grid">
                              {customer.savedAddresses?.length === 0 ? (
                                <p className="tab-empty-text">No saved addresses. Add one to speed up checkout.</p>
                              ) : (
                                customer.savedAddresses.map((addr) => (
                                  <div key={addr._id} className="address-card">
                                    <div className="address-card-header">
                                      <span className="address-label">{addr.label}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => handleDeleteAddress(addr._id)}
                                        className="address-delete-btn"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                    <p className="address-card-name">{addr.fullName}</p>
                                    <p className="address-card-street">{addr.street}</p>
                                    <p className="address-card-city">{addr.city}, {addr.state} - {addr.zip}</p>
                                    <p className="address-card-phone">T: {addr.phone}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </>
                        ) : (
                          <form onSubmit={handleSaveAddress} className="add-address-form">
                            <h4>New Address Details</h4>
                            <div className="form-grid-2">
                              <label className="auth-input-label">
                                <span>Address Label (e.g. Home, Office)</span>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="Home"
                                  value={newAddress.label} 
                                  onChange={(e) => setNewAddress({...newAddress, label: e.target.value})} 
                                />
                              </label>
                              <label className="auth-input-label">
                                <span>Receiver Name</span>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="Recipient Name"
                                  value={newAddress.fullName} 
                                  onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})} 
                                />
                              </label>
                            </div>

                            <label className="auth-input-label">
                              <span>Phone Number</span>
                              <input 
                                type="tel" 
                                required 
                                placeholder="Receiver phone number"
                                value={newAddress.phone} 
                                onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} 
                              />
                            </label>

                            <label className="auth-input-label">
                              <span>Street Address</span>
                              <input 
                                type="text" 
                                required 
                                placeholder="House/Flat No, Apartment, Street"
                                value={newAddress.street} 
                                onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} 
                              />
                            </label>

                            <div className="form-grid-3">
                              <label className="auth-input-label">
                                <span>City</span>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="City"
                                  value={newAddress.city} 
                                  onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} 
                                />
                              </label>
                              <label className="auth-input-label">
                                <span>State</span>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="State"
                                  value={newAddress.state} 
                                  onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} 
                                />
                              </label>
                              <label className="auth-input-label">
                                <span>Pincode</span>
                                <input 
                                  type="text" 
                                  required 
                                  placeholder="Pincode"
                                  value={newAddress.zip} 
                                  onChange={(e) => setNewAddress({...newAddress, zip: e.target.value})} 
                                />
                              </label>
                            </div>

                            <div className="address-form-actions">
                              <button type="submit" disabled={loading} className="address-save-submit-btn">
                                {loading ? 'Saving Address...' : 'Save Address'}
                              </button>
                              <button type="button" onClick={() => setShowAddAddress(false)} className="address-cancel-btn">Cancel</button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {activeTab === 'profile' && (
                      <div className="dashboard-profile-edit">
                        <form onSubmit={handleCompleteProfile} className="auth-profile-edit-form">
                          <label className="auth-input-label">
                            <span>Full Name</span>
                            <input 
                              type="text" 
                              required 
                              placeholder="Eleanor Vance" 
                              value={profileName} 
                              onChange={(e) => setProfileName(e.target.value)} 
                            />
                          </label>

                          <label className="auth-input-label">
                            <span>Email Address (Account Identifier)</span>
                            <input 
                              type="email" 
                              disabled 
                              value={customer.email} 
                              className="auth-input-disabled"
                            />
                          </label>

                          <button type="submit" disabled={loading} className="profile-update-submit-btn">
                            {loading ? 'Updating Profile...' : 'Update Profile Name'}
                          </button>
                        </form>

                        <button 
                          type="button" 
                          disabled={loading}
                          onClick={handleLogout} 
                          className="customer-dashboard-logout-btn"
                        >
                          {loading ? 'Logging out...' : 'Sign Out of Account'}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
