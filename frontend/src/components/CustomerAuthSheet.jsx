import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ShieldCheck, User, MapPin, Package, Heart, Receipt, Plus, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../api/client.js';
import { FlameButton } from './FlameButton.jsx';

export function CustomerAuthSheet({ isOpen, onClose }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile-setup' | 'dashboard'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [customer, setCustomer] = useState(null);
  
  // Dashboard details
  const [dashboardData, setDashboardData] = useState({ orders: [], quotes: [] });
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'quotes' | 'addresses' | 'profile'
  
  // Profile completion / edit
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  
  // Address Creation
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', fullName: '', phone: '', street: '', city: '', state: '', zip: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check auth session on load/open
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
        setStep('phone');
      }
    } catch (err) {
      setStep('phone');
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
        setProfileEmail(res.data.customer.email || '');
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRequestOtp(e) {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    setError('');
    try {
      await api.post('/customer-auth/request-otp', { phone });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request OTP');
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
      const res = await api.post('/customer-auth/verify-otp', { phone, otp });
      const user = res.data.customer;
      setCustomer(user);
      
      // If the customer profile doesn't have a name yet (brand new client, no guest history), complete profile setup
      if (!user.name) {
        setStep('profile-setup');
      } else {
        setStep('dashboard');
        fetchDashboard();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProfile(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/customer-auth/profile', { name: profileName, email: profileEmail });
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
    try {
      const res = await api.delete(`/customer-auth/address/${id}`);
      setCustomer(res.data.customer);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleLogout() {
    try {
      await api.post('/customer-auth/logout');
      setCustomer(null);
      setPhone('');
      setOtp('');
      setStep('phone');
    } catch (err) {
      console.error(err);
    }
  }

  // Handle global events to trigger auth open directly from order success screens
  useEffect(() => {
    const handleTrigger = (e) => {
      if (e.detail?.phone) {
        setPhone(e.detail.phone);
      }
    };
    window.addEventListener('open-customer-auth', handleTrigger);
    return () => window.removeEventListener('open-customer-auth', handleTrigger);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="auth-sheet-backdrop"
          />

          {/* Sliding Sheet */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="auth-sheet-container"
          >
            
            {/* Header close toggle */}
            <div className="auth-sheet-header">
              <h3>{step === 'dashboard' ? 'My Kinzee' : 'Welcome to Kinzee'}</h3>
              <button type="button" onClick={onClose} className="auth-sheet-close-btn" aria-label="Close panel">
                <X size={18} />
              </button>
            </div>

            <div className="auth-sheet-body">
              {error && <div className="auth-error-message">{error}</div>}

              {step === 'phone' && (
                /* Step 1: Phone Entry */
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
                      <span>Phone Number</span>
                      <div className="auth-input-icon-wrapper">
                        <Phone size={16} className="auth-icon" />
                        <input 
                          type="tel" 
                          required 
                          placeholder="e.g. +91 70007 01579" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                        />
                      </div>
                    </label>

                    <FlameButton type="submit" disabled={loading}>
                      {loading ? 'Sending Code...' : 'Continue with Phone Number'}
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
                /* Step 2: OTP Verification */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="auth-step-panel"
                >
                  <p className="auth-step-intro">
                    We sent a verification code to <strong>{phone}</strong>. Enter <strong>123456</strong> to verify.
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

                  <button type="button" onClick={() => setStep('phone')} className="auth-back-link">
                    Back to phone number
                  </button>
                </motion.div>
              )}

              {step === 'profile-setup' && (
                /* Step 3: Complete Profile Setup (For New Clients Only) */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="auth-step-panel"
                >
                  <h3>Almost there</h3>
                  <p className="auth-step-intro">
                    Let us know your name and email to personalize your Kinzee Studio dashboard.
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

                    <label className="auth-input-label">
                      <span>Email Address (Optional)</span>
                      <input 
                        type="email" 
                        placeholder="e.g. eleanor@example.com" 
                        value={profileEmail} 
                        onChange={(e) => setProfileEmail(e.target.value)} 
                      />
                    </label>

                    <FlameButton type="submit" disabled={loading}>
                      Create My Profile
                    </FlameButton>
                  </form>
                </motion.div>
              )}

              {step === 'dashboard' && customer && (
                /* Step 4: My Kinzee Logged-In Dashboard */
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
                    <p className="customer-meta-phone">{customer.phone}</p>
                  </div>

                  {/* Dashboard Tab Selector */}
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

                  {/* Tab Contents */}
                  <div className="dashboard-tab-content-area">
                    
                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                      <div className="dashboard-orders-list">
                        {dashboardData.orders.length === 0 ? (
                          <p className="tab-empty-text">No orders placed yet. Orders matching your phone number will appear here automatically.</p>
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
                              <div className="order-card-footer">
                                <span>Total Paid: ₹{ord.paymentPlan.total}</span>
                                <span className="order-date">{new Date(ord.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Bespoke Requests Tab */}
                    {activeTab === 'quotes' && (
                      <div className="dashboard-quotes-list">
                        {dashboardData.quotes.length === 0 ? (
                          <p className="tab-empty-text">No custom briefs submitted yet. Custom creations matching your phone number will show here.</p>
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
                              {q.quotedPrice && (
                                <div className="quote-card-price-offer">
                                  <span>Quoted Price: <strong>₹{q.quotedPrice}</strong></span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Addresses Tab */}
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
                          /* Add Address Form */
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
                              <button type="submit" className="address-save-submit-btn">Save Address</button>
                              <button type="button" onClick={() => setShowAddAddress(false)} className="address-cancel-btn">Cancel</button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Profile Edit Tab */}
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
                            <span>Email Address (Optional)</span>
                            <input 
                              type="email" 
                              placeholder="eleanor@example.com" 
                              value={profileEmail} 
                              onChange={(e) => setProfileEmail(e.target.value)} 
                            />
                          </label>

                          <button type="submit" className="profile-update-submit-btn">
                            Update Details
                          </button>
                        </form>

                        <button 
                          type="button" 
                          onClick={handleLogout} 
                          className="auth-logout-btn"
                        >
                          Logout Account
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
