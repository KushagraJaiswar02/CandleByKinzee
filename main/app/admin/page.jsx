'use client';

import './admin.css';
import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Lock, 
  Package, 
  Percent, 
  ScrollText, 
  Check, 
  X, 
  BarChart2, 
  Eye, 
  Target, 
  MousePointerClick, 
  Menu, 
  Search, 
  Bell, 
  LogOut,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { api } from '@/lib/api.js';
import ConfirmDialog from '@/components/ConfirmDialog';

const ORDER_STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  payment_received: 'Payment Received',
  order_confirmed: 'Order Confirmed',
  handcrafting: 'Handcrafting',
  packaging: 'Packaging',
  ready_for_dispatch: 'Ready for Dispatch',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  cancellation_requested: 'Cancellation Requested',
  cancellation_declined: 'Cancellation Declined'
};

const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS);

export default function Admin() {
  const [admin, setAdmin] = useState(null);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  
  // Sidebar state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analytics' | 'orders' | 'quotes' | 'catalog' | 'discounts'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Creation Drawer States
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editProductId, setEditProductId] = useState(null);

  // New Product state
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    basePrice: 0,
    category: 'signature',
    images: ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=600&q=80'],
    customizable: true,
    customOptions: [
      { label: 'Color', choices: ['White', 'Blush pink', 'Sky blue'] },
      { label: 'Scent', choices: ['Vanilla', 'Rose', 'Unscented'] }
    ]
  });

  // New Coupon state
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    percentage: 10,
    minimumOrderValue: 0,
    isActive: true
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'default' // 'default' | 'danger' | 'warning'
  });
  const [isConfirming, setIsConfirming] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Login error state
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  // Form error states
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api.get('/auth/me').then((res) => setAdmin(res.data.admin)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!admin) return;
    fetchOrders();
    fetchQuotes();
    fetchProducts();
    fetchDiscounts();
  }, [admin]);

  function showConfirm(title, message, onConfirm, variant = 'default') {
    setConfirmDialog({ isOpen: true, title, message, onConfirm, variant });
  }

  function closeConfirm() {
    setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null, variant: 'default' });
    setIsConfirming(false);
  }

  function showToast(message, type = 'success') {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }

  async function fetchOrders() {
    try {
      const res = await api.get('/orders/admin/all');
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchQuotes() {
    try {
      const res = await api.get('/quotes/admin/all');
      setQuotes(res.data.quoteRequests);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchProducts() {
    try {
      const res = await api.get('/products');
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchDiscounts() {
    try {
      const res = await api.get('/admin/discounts');
      setDiscounts(res.data.discounts);
    } catch (err) {
      console.error(err);
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const response = await api.post('/auth/login', login);
      setAdmin(response.data.admin);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function openOrderDetails(id) {
    setLoadingOrderId(id);
    try {
      const res = await api.get(`/orders/admin/${id}`);
      setSelectedOrder(res.data.order);
      setStatusUpdateNote('');
    } catch (err) {
      showToast('Failed to load order details', 'error');
    } finally {
      setLoadingOrderId(null);
    }
  }

  async function updateOrderStatus(newStatus) {
    if (!selectedOrder) return;
    setIsActionLoading(true);
    try {
      const res = await api.patch(`/orders/admin/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusUpdateNote
      });
      setSelectedOrder(res.data.order);
      setStatusUpdateNote('');
      fetchOrders();
      showToast('Order status updated successfully');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setFormError('');
    setIsActionLoading(true);
    try {
      if (editProductId) {
        await api.patch(`/products/${editProductId}`, newProduct);
        showToast('Product updated successfully');
      } else {
        await api.post('/products', newProduct);
        showToast('Product added to catalog');
      }
      setShowProductForm(false);
      setEditProductId(null);
      setNewProduct({
        name: '',
        description: '',
        basePrice: 0,
        category: 'signature',
        images: ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=600&q=80'],
        customizable: true,
        customOptions: [
          { label: 'Color', choices: ['White', 'Blush pink', 'Sky blue'] },
          { label: 'Scent', choices: ['Vanilla', 'Rose', 'Unscented'] }
        ]
      });
      fetchProducts();
    } catch (err) {
      setFormError('Failed to save product. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  }

  function startEditProduct(product) {
    setFormError('');
    setEditProductId(product._id);
    setNewProduct({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice,
      category: product.category,
      images: product.images || ['https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=600&q=80'],
      customizable: product.customizable,
      customOptions: product.customOptions || []
    });
    setShowProductForm(true);
  }

  async function toggleProductActive(product) {
    showConfirm(
      product.isActive ? 'Deactivate Product' : 'Activate Product',
      `Are you sure you want to ${product.isActive ? 'deactivate' : 'activate'} "${product.name}"?`,
      async () => {
        setIsConfirming(true);
        try {
          await api.patch(`/products/${product._id}`, { isActive: !product.isActive });
          showToast(`Product ${product.isActive ? 'deactivated' : 'activated'} successfully`);
          fetchProducts();
        } catch (err) {
          showToast('Failed to update product status', 'error');
        }
        closeConfirm();
      },
      product.isActive ? 'warning' : 'default'
    );
  }

  async function handleAddDiscount(e) {
    e.preventDefault();
    setFormError('');
    setIsActionLoading(true);
    try {
      await api.post('/admin/discounts', newDiscount);
      showToast('Coupon created successfully');
      setShowDiscountForm(false);
      setNewDiscount({
        code: '',
        percentage: 10,
        minimumOrderValue: 0,
        isActive: true
      });
      fetchDiscounts();
    } catch (err) {
      setFormError('Failed to create coupon. Please try again.');
    } finally {
      setIsActionLoading(false);
    }
  }

  async function toggleDiscountActive(discount) {
    showConfirm(
      discount.isActive ? 'Deactivate Coupon' : 'Activate Coupon',
      `Are you sure you want to ${discount.isActive ? 'deactivate' : 'activate'} "${discount.code}"?`,
      async () => {
        setIsConfirming(true);
        try {
          await api.patch(`/admin/discounts/${discount._id}`, { isActive: !discount.isActive });
          showToast(`Coupon ${discount.isActive ? 'deactivated' : 'activated'} successfully`);
          fetchDiscounts();
        } catch (err) {
          showToast('Failed to update coupon status', 'error');
        }
        closeConfirm();
      },
      discount.isActive ? 'warning' : 'default'
    );
  }

  async function deleteDiscount(id) {
    showConfirm(
      'Delete Coupon',
      'This action cannot be undone. Are you sure you want to permanently delete this coupon code?',
      async () => {
        setIsConfirming(true);
        try {
          await api.delete(`/admin/discounts/${id}`);
          showToast('Coupon deleted successfully');
          fetchDiscounts();
        } catch (err) {
          showToast('Failed to delete coupon', 'error');
        }
        closeConfirm();
      },
      'danger'
    );
  }

  if (!admin) {
    return (
      <main className="admin-login-shell">
        <div className="radial-glow-left" />
        <div className="radial-glow-right" />
        <div className="login-panel-container">
          <div className="candle-glowing-logo">🕯️</div>
          <h1 className="admin-title">Atelier Unlock</h1>
          <p className="login-subtitle">Kinzee Studio Management Console</p>
          <form onSubmit={submitLogin} className="drawer-form-layout">
            {loginError && <div className="login-error-alert"><AlertCircle size={14} />{loginError}</div>}
            <div className="input-group">
              <label className="login-field-label">
                <span>Atelier Email</span>
                <input 
                  type="email" 
                  value={login.email} 
                  onChange={(event) => setLogin({ ...login, email: event.target.value })} 
                  placeholder="admin@kinzee.com"
                  required
                />
              </label>
            </div>
            <div className="input-group">
              <label className="login-field-label">
                <span>Secret Passcode</span>
                <input 
                  type="password" 
                  value={login.password} 
                  onChange={(event) => setLogin({ ...login, password: event.target.value })} 
                  placeholder="••••••••"
                  required
                />
              </label>
            </div>
            <button disabled={isLoggingIn} className="login-submit-btn">
              {isLoggingIn ? 'Unlocking Dashboard...' : 'Unlock Dashboard →'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // Derived values for dashboard
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const pendingQuotesCount = quotes.filter(q => q.status === 'pending').length;

  return (
    <main className="admin-dashboard-shell">
      {/* MOBILE SIDEBAR OVERLAY BACKGROUND */}
      {isMobileSidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      {/* PROFESSIONAL LEFT SIDEBAR */}
      <aside className={`dashboard-sidebar-menu ${isMobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
        <div className="sidebar-brand-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="sidebar-brand-icon">K</div>
            <div>
              <div className="sidebar-brand-name">Kinzee Studio</div>
              <div className="sidebar-brand-tag">Admin Panel</div>
            </div>
          </div>
          <button className="mobile-sidebar-close-btn" onClick={() => setIsMobileSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <div className="nav-group-label">Overview</div>
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }} className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> 
            <span>Dashboard</span>
          </button>


          <div className="nav-group-label">E-Commerce Pipeline</div>
          <button onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }} className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}>
            <ScrollText size={18} /> 
            <span>Shop Orders</span>
            {activeOrdersCount > 0 && <span className="nav-badge gold">{activeOrdersCount}</span>}
          </button>

          <button onClick={() => { setActiveTab('quotes'); setIsMobileSidebarOpen(false); }} className={`nav-link ${activeTab === 'quotes' ? 'active' : ''}`}>
            <ScrollText size={18} /> 
            <span>Custom Quotes</span>
            {pendingQuotesCount > 0 && <span className="nav-badge">{pendingQuotesCount}</span>}
          </button>

          <div className="nav-group-label">Management</div>
          <button onClick={() => { setActiveTab('catalog'); setIsMobileSidebarOpen(false); }} className={`nav-link ${activeTab === 'catalog' ? 'active' : ''}`}>
            <Package size={18} /> 
            <span>Catalog Manager</span>
          </button>

          <button onClick={() => { setActiveTab('discounts'); setIsMobileSidebarOpen(false); }} className={`nav-link ${activeTab === 'discounts' ? 'active' : ''}`}>
            <Percent size={18} /> 
            <span>Coupons & Offers</span>
          </button>
        </nav>

        <div className="sidebar-admin-profile">
          <div className="profile-avatar-block">
            <div className="avatar-circle">KA</div>
            <div>
              <p className="admin-email">{admin.email}</p>
              <p className="role-label">Studio Admin</p>
            </div>
          </div>
          <button type="button" onClick={() => api.post('/auth/logout').then(() => window.location.reload())} className="sidebar-logout-btn">
            <LogOut size={14} /> Disconnect
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <section className="dashboard-content-workspace">
        {/* TOP HEADER BAR */}
        <header className="top-header-bar">
          <button className="mobile-menu-toggle-btn" onClick={() => setIsMobileSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          
          <div className="header-search-wrap">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search resources..." />
          </div>

          <div className="header-actions">
            <div className="system-pill live">
              <span className="live-dot" /> Database Live
            </div>
          </div>
        </header>

        {/* TAB 1: DASHBOARD METRICS */}
        {activeTab === 'dashboard' && (
          <div className="tab-pane-container animate-fade-in">
            <div className="pane-header-title-block">
              <h1 className="pane-title">Overview Dashboard</h1>
              <p className="pane-subtitle">Real-time studio sales, pipeline activity & metrics</p>
            </div>

            <div className="metrics-cards-grid text-cards-four">
              <div className="metric-card">
                <div className="icon-wrap gold-theme"><ScrollText size={22} /></div>
                <div className="meta">
                  <span>Gross Orders</span>
                  <strong>{orders.length}</strong>
                  <span className="trend-badge positive"><TrendingUp size={12} /> Total Orders</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="icon-wrap"><AlertCircle size={22} /></div>
                <div className="meta">
                  <span>Active Pipeline</span>
                  <strong>{activeOrdersCount}</strong>
                  <span className="trend-badge neutral">In Progress</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="icon-wrap"><Package size={22} /></div>
                <div className="meta">
                  <span>Catalog Products</span>
                  <strong>{products.length}</strong>
                  <span className="trend-badge neutral">Active SKUs</span>
                </div>
              </div>

              <div className="metric-card">
                <div className="icon-wrap"><ScrollText size={22} /></div>
                <div className="meta">
                  <span>Pending Quotes</span>
                  <strong>{pendingQuotesCount}</strong>
                  <span className="trend-badge neutral">Pending</span>
                </div>
              </div>
            </div>

            <div className="dashboard-sections-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
              <div className="dashboard-recent-orders panel-card-table">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eaeaea' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="table-action-btn">View All</button>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order._id}>
                          <td><strong>#{order.orderNumber}</strong></td>
                          <td>{order.customer.name}</td>
                          <td><span className={`badge-pill ${order.status}`}>{ORDER_STATUS_LABELS[order.status] || order.status}</span></td>
                          <td>₹{order.paymentPlan.total.toLocaleString('en-IN')}</td>
                          <td>
                            <button 
                              className="table-action-btn" 
                              disabled={loadingOrderId === order._id} 
                              onClick={() => openOrderDetails(order._id)}
                            >
                              {loadingOrderId === order._id ? 'Loading...' : 'View'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#666' }}>No orders yet</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="dashboard-quick-actions">
                <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <button onClick={() => { setActiveTab('catalog'); setFormError(''); setShowProductForm(true); }} className="create-action-trigger-btn">
                    <Plus size={16} /> Add Product
                  </button>
                  <button onClick={() => { setActiveTab('discounts'); setFormError(''); setShowDiscountForm(true); }} className="create-action-trigger-btn">
                    <Percent size={16} /> Create Coupon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHOP ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="tab-pane-container animate-fade-in">
            <h1 className="pane-title">Shop Orders</h1>
            <div className="panel-card-table">
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td><strong>#{order.orderNumber}</strong></td>
                        <td>{order.customer.name}</td>
                        <td><span className={`badge-pill ${order.status}`}>{ORDER_STATUS_LABELS[order.status] || order.status}</span></td>
                        <td>₹{order.paymentPlan.total.toLocaleString('en-IN')}</td>
                        <td>
                          <button 
                            className="table-action-btn" 
                            disabled={loadingOrderId === order._id} 
                            onClick={() => openOrderDetails(order._id)}
                          >
                            {loadingOrderId === order._id ? 'Loading...' : 'View Details'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM QUOTES */}
        {activeTab === 'quotes' && (
          <div className="tab-pane-container animate-fade-in">
            <h1 className="pane-title">Bespoke Inquiry Quotes</h1>
            <div className="panel-card-table">
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact Info</th>
                      <th>Status</th>
                      <th>Target Date</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr key={q._id}>
                        <td><strong>{q.customer.name}</strong></td>
                        <td>{q.customer.email || q.customer.phone}</td>
                        <td><span className={`badge-pill ${q.status}`}>{q.status}</span></td>
                        <td>{q.timeline || 'Flexible'}</td>
                        <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CATALOG MANAGER */}
        {activeTab === 'catalog' && (
          <div className="tab-pane-container animate-fade-in">
            <div className="pane-header-actions">
              <div>
                <h1 className="pane-title">Product Catalog</h1>
                <p className="pane-subtitle">Manage hand-poured candle inventory and scents</p>
              </div>
              <button onClick={() => { setFormError(''); setEditProductId(null); setShowProductForm(true); }} className="create-action-trigger-btn">
                <Plus size={16} /> Add Product
              </button>
            </div>

            {showProductForm && (
              <div className="drawer-overlay-card">
                <div className="drawer-content-box">
                  <div className="drawer-header">
                    <h3>{editProductId ? 'Edit Product' : 'Add New Candle'}</h3>
                    <button onClick={() => setShowProductForm(false)} className="close-btn"><X size={18}/></button>
                  </div>
                  
                  <form onSubmit={handleAddProduct} className="drawer-form-layout">
                    {formError && <div className="login-error-alert"><AlertCircle size={14} />{formError}</div>}
                    
                    <label className="form-field">
                      <span>Candle Name</span>
                      <input 
                        type="text" required minLength={2}
                        placeholder="e.g. Scented Botanical Jar"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </label>

                    <label className="form-field">
                      <span>Description</span>
                      <textarea 
                        required minLength={5} rows={3}
                        placeholder="Soy wax infusion with essential oils..."
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <label className="form-field">
                        <span>Price (₹)</span>
                        <input 
                          type="number" required min={0}
                          value={newProduct.basePrice}
                          onChange={(e) => setNewProduct({ ...newProduct, basePrice: Number(e.target.value) })}
                        />
                      </label>
                      <label className="form-field">
                        <span>Category</span>
                        <select 
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                          <option value="signature">Signature</option>
                          <option value="Floral candle bouquets">Floral Candle Bouquets</option>
                          <option value="Daisy & glass candles">Daisy & Glass Candles</option>
                          <option value="Gift box sets">Gift Box Sets</option>
                          <option value="Cocktail candle collection">Cocktail Candle Collection</option>
                          <option value="Festive sweet collection">Festive Sweet Collection</option>
                        </select>
                      </label>
                    </div>

                    <label className="form-field">
                      <span>Image URL</span>
                      <input 
                        type="url" required
                        value={newProduct.images[0]}
                        onChange={(e) => setNewProduct({ ...newProduct, images: [e.target.value] })}
                      />
                    </label>

                    <button type="submit" disabled={isActionLoading} className="form-submit-btn">
                      {isActionLoading ? 'Saving Product...' : (editProductId ? 'Save Product Details' : 'Add Product')}
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="panel-card-table">
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Base Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id}>
                        <td>
                          <img 
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=60&q=70'} 
                            alt={p.name} 
                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                          />
                        </td>
                        <td><strong>{p.name}</strong></td>
                        <td><span className="category-text">{p.category}</span></td>
                        <td>₹{p.basePrice.toLocaleString('en-IN')}</td>
                        <td><span className={`badge-pill ${p.isActive ? 'order_confirmed' : 'cancelled'}`}>{p.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => startEditProduct(p)} className="table-action-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Edit2 size={12} /> Edit
                            </button>
                            <button onClick={() => toggleProductActive(p)} className="table-action-btn" style={{ background: '#666' }}>
                              {p.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DISCOUNTS */}
        {activeTab === 'discounts' && (
          <div className="tab-pane-container animate-fade-in">
            <div className="pane-header-actions">
              <div>
                <h1 className="pane-title">Coupons & Offers</h1>
                <p className="pane-subtitle">Configure percentage promo codes & minimum thresholds</p>
              </div>
              <button onClick={() => { setFormError(''); setShowDiscountForm(true); }} className="create-action-trigger-btn">
                <Plus size={16} /> Create Coupon
              </button>
            </div>

            {showDiscountForm && (
              <div className="drawer-overlay-card">
                <div className="drawer-content-box">
                  <div className="drawer-header">
                    <h3>Create Coupon Code</h3>
                    <button onClick={() => setShowDiscountForm(false)} className="close-btn"><X size={18}/></button>
                  </div>
                  
                  <form onSubmit={handleAddDiscount} className="drawer-form-layout">
                    {formError && <div className="login-error-alert"><AlertCircle size={14} />{formError}</div>}
                    <label className="form-field">
                      <span>Promo Code (Uppercase)</span>
                      <input 
                        type="text" required minLength={3}
                        placeholder="e.g. FESTIVE20"
                        value={newDiscount.code}
                        onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                      />
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <label className="form-field">
                        <span>Deduction (%)</span>
                        <input 
                          type="number" required min={1} max={90}
                          value={newDiscount.percentage}
                          onChange={(e) => setNewDiscount({ ...newDiscount, percentage: Number(e.target.value) })}
                        />
                      </label>
                      <label className="form-field">
                        <span>Min Order Value (₹)</span>
                        <input 
                          type="number" required min={0}
                          value={newDiscount.minimumOrderValue}
                          onChange={(e) => setNewDiscount({ ...newDiscount, minimumOrderValue: Number(e.target.value) })}
                        />
                      </label>
                    </div>

                    <button type="submit" disabled={isActionLoading} className="form-submit-btn">
                      {isActionLoading ? 'Registering...' : 'Register Discount Code'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="panel-card-table">
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Percentage</th>
                      <th>Min Purchase</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discounts.map(d => (
                      <tr key={d._id}>
                        <td><strong className="coupon-code-badge">{d.code}</strong></td>
                        <td>{d.percentage}% Off</td>
                        <td>₹{d.minimumOrderValue.toLocaleString('en-IN')}</td>
                        <td><span className={`badge-pill ${d.isActive ? 'order_confirmed' : 'cancelled'}`}>{d.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => toggleDiscountActive(d)} className="table-action-btn" style={{ background: '#666' }}>
                              {d.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteDiscount(d._id)} className="table-action-btn" style={{ background: '#c62828' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* OVERLAY MODAL: ORDER DETAILS */}
      {selectedOrder && (() => {
        const PIPELINE = [
          'pending_payment',
          'payment_received',
          'order_confirmed',
          'handcrafting',
          'packaging',
          'ready_for_dispatch',
          'dispatched',
          'delivered'
        ];
        const currentIdx = PIPELINE.indexOf(selectedOrder.status);
        const nextStatus = currentIdx >= 0 && currentIdx < PIPELINE.length - 1 ? PIPELINE[currentIdx + 1] : null;

        return (
          <div className="details-overlay-container">
            <div className="details-modal-box animate-scale-up">
              <button className="details-modal-close-btn" onClick={() => setSelectedOrder(null)}><X size={18}/></button>
              <div className="modal-header-section">
                <span className={`status-pill ${selectedOrder.status}`}>{ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}</span>
                <h2>Order #{selectedOrder.orderNumber}</h2>
                <p className="date-subtitle">Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>

              {/* Fulfilment Pipeline Stepper */}
              <div className="modal-pipeline-stepper" style={{ margin: '16px 20px', padding: '16px', background: '#fafafa', borderRadius: '12px', border: '1px solid #eaeaea' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888', fontWeight: 600, marginBottom: '12px' }}>Fulfillment Pipeline</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {PIPELINE.map((st, idx) => {
                    const isDone = currentIdx >= 0 && idx < currentIdx;
                    const isCurrent = currentIdx === idx;
                    return (
                      <button
                        key={st}
                        disabled={isActionLoading || isCurrent}
                        onClick={() => updateOrderStatus(st)}
                        title={`Click to set status to ${ORDER_STATUS_LABELS[st]}`}
                        style={{
                          flex: 1,
                          minWidth: '85px',
                          padding: '8px 4px',
                          border: isCurrent ? '1.5px solid #b58a3c' : '1px solid #e5e5e5',
                          background: isCurrent ? '#fef7eb' : isDone ? '#ecfdf5' : '#ffffff',
                          borderRadius: '8px',
                          cursor: isCurrent ? 'default' : 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.2s ease',
                          opacity: isActionLoading ? 0.7 : 1
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: isCurrent ? '#b58a3c' : isDone ? '#10b981' : '#e5e5e5',
                          color: '#fff',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {isDone ? <Check size={12}/> : (idx + 1)}
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#b58a3c' : isDone ? '#065f46' : '#666', textAlign: 'center', lineHeight: 1.2 }}>
                          {ORDER_STATUS_LABELS[st]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-grid-content">
                <div className="modal-details-left">
                  <div className="meta-info-card">
                    <h4 className="card-subheading">Shipping Details</h4>
                    <p><strong>Customer Name:</strong> {selectedOrder.customer.name}</p>
                    <p><strong>Address:</strong> {selectedOrder.customer.address}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                  </div>
                  <div className="meta-info-card">
                    <h4 className="card-subheading">Purchased Items</h4>
                    <ul className="modal-items-list">
                      {selectedOrder.items.map((item, idx) => (
                        <li key={item._lineId || idx} className="modal-item-row">
                          <strong>{item.name}</strong>
                          <span>&times;{item.qty} — ₹{item.priceAtOrder * item.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="modal-details-right">
                  <h4 className="card-subheading">Update Status Workflow</h4>

                  {/* Primary Next Action Stepper */}
                  {nextStatus && (
                    <div style={{ marginBottom: '16px', padding: '14px', background: '#fef7eb', border: '1px solid #fef3c7', borderRadius: '10px' }}>
                      <p style={{ fontSize: '12px', margin: '0 0 8px 0', color: '#b45309', fontWeight: 600 }}>Next Recommended Stage:</p>
                      <button
                        disabled={isActionLoading}
                        onClick={() => updateOrderStatus(nextStatus)}
                        className="create-action-trigger-btn"
                        style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
                      >
                        {isActionLoading ? 'Updating Stage...' : `Advance to ${ORDER_STATUS_LABELS[nextStatus]} →`}
                      </button>
                    </div>
                  )}

                  <label className="internal-notes-field">
                    <span>Internal Log Note</span>
                    <textarea
                      rows={2}
                      placeholder="Provide logistics tracking number or notes..."
                      value={statusUpdateNote}
                      onChange={(e) => setStatusUpdateNote(e.target.value)}
                    />
                  </label>

                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#888', fontWeight: 600, marginBottom: '8px' }}>Or Jump to Status:</p>
                    <div className="status-timeline-actions">
                      {ORDER_STATUSES.map(st => (
                        <button
                          key={st}
                          disabled={st === selectedOrder.status || isActionLoading}
                          onClick={() => updateOrderStatus(st)}
                          className={`status-workflow-btn ${selectedOrder.status === st ? 'active' : ''}`}
                        >
                          {ORDER_STATUS_LABELS[st]}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type} show`}>
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        isConfirming={isConfirming}
        onConfirm={() => confirmDialog.onConfirm?.()}
        onCancel={closeConfirm}
        confirmText={confirmDialog.variant === 'danger' ? 'Delete' : 'Confirm'}
      />
    </main>
  );
}
