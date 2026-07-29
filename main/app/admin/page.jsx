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
  Trash2,
  ExternalLink,
  HelpCircle,
  ChevronRight,
  Filter,
  ShoppingBag,
  DollarSign,
  Sparkles
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

function TableSkeleton({ rows = 5 }) {
  return (
    <div style={{ padding: '16px' }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="skeleton-pulse skeleton-row" style={{ marginBottom: '8px' }} />
      ))}
    </div>
  );
}

function MetricSkeleton() {
  return (
    <div className="razorpay-metrics-grid">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton-pulse skeleton-card" />
      ))}
    </div>
  );
}

export default function Admin() {
  const [admin, setAdmin] = useState(null);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  
  // Navigation & Search State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'quotes' | 'catalog' | 'discounts'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
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
    setInitialLoading(true);
    Promise.all([
      fetchOrders(),
      fetchQuotes(),
      fetchProducts(),
      fetchDiscounts()
    ]).finally(() => {
      setInitialLoading(false);
    });
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
      const res = await api.get('/products?all=true');
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
      'Delete Coupon Code',
      'Are you sure you want to permanently delete this discount coupon?',
      async () => {
        setIsConfirming(true);
        try {
          await api.delete(`/admin/discounts/${id}`);
          showToast('Coupon deleted permanently');
          fetchDiscounts();
        } catch (err) {
          showToast('Failed to delete coupon', 'error');
        }
        closeConfirm();
      },
      'danger'
    );
  }

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
      setAdmin(null);
    } catch (err) {
      console.error(err);
    }
  }

  // Derived metrics calculations
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (o.paymentPlan?.total || 0), 0);

  const pendingQuotesCount = quotes.filter(q => q.status === 'pending' || q.status === 'in_review').length;
  const activeProductsCount = products.filter(p => p.isActive).length;

  // Filtered dataset calculations
  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchQuery || 
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.customer?.phone?.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(p => {
    return !searchQuery || 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredQuotes = quotes.filter(q => {
    return !searchQuery || 
      q.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.description?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!admin) {
    return (
      <main className="admin-login-shell">
        <div className="login-panel-container">
          <div className="candle-glowing-logo">🕯️</div>
          <h1 className="admin-title">Kinzee Atelier</h1>
          <p className="login-subtitle">Studio Administration Console</p>
          <form onSubmit={submitLogin}>
            {loginError && <div className="login-error-alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}><AlertCircle size={14} /> {loginError}</div>}
            <div className="login-field-label">
              <span>Atelier Email</span>
              <input 
                type="email" 
                value={login.email} 
                onChange={(event) => setLogin({ ...login, email: event.target.value })} 
                placeholder="admin@kinzee.com"
                required
              />
            </div>
            <div className="login-field-label">
              <span>Secret Passcode</span>
              <input 
                type="password" 
                value={login.password} 
                onChange={(event) => setLogin({ ...login, password: event.target.value })} 
                placeholder="••••••••"
                required
              />
            </div>
            <button disabled={isLoggingIn} className="login-submit-btn">
              {isLoggingIn ? 'Unlocking Dashboard...' : 'Unlock Dashboard →'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-root">
      
      {/* 1. Razorpay Dark Top Navbar */}
      <header className="admin-top-navbar">
        <div className="top-brand-group">
          <button className="mobile-top-toggle" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
            <Menu size={20} />
          </button>
          <div className="top-brand-logo">🕯️</div>
          <h1 className="top-brand-title">Kinzee Atelier</h1>
        </div>

        {/* Top Module Links */}
        <nav className="top-nav-menu-links">
          <button 
            className={`top-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setStatusFilter('all'); }}
          >
            Overview
          </button>
          <button 
            className={`top-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setStatusFilter('all'); }}
          >
            Orders
          </button>
          <button 
            className={`top-nav-item ${activeTab === 'quotes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('quotes'); setStatusFilter('all'); }}
          >
            Custom Quotes
          </button>
          <button 
            className={`top-nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => { setActiveTab('catalog'); setStatusFilter('all'); }}
          >
            Catalog
          </button>
          <button 
            className={`top-nav-item ${activeTab === 'discounts' ? 'active' : ''}`}
            onClick={() => { setActiveTab('discounts'); setStatusFilter('all'); }}
          >
            Promos & Offers
          </button>
        </nav>

        <div className="top-header-right">
          <div className="top-global-search">
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search orders, products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            onClick={() => { setActiveTab('catalog'); setFormError(''); setEditProductId(null); setShowProductForm(true); }}
            className="top-quick-action-btn"
          >
            <Plus size={14} /> Add Candle
          </button>

          <div className="user-avatar-badge">YP</div>
        </div>
      </header>

      {/* 2. Main Shell Layout (Sidebar + Workspace) */}
      <div className="admin-main-layout">
        
        {/* Left Sidebar */}
        <aside className={`razorpay-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-nav-section">
            <div>
              <div className="sidebar-group-label">Main Console</div>
              <ul className="sidebar-menu-list">
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('dashboard'); setIsMobileSidebarOpen(false); }}
                  >
                    <LayoutDashboard size={16} /> Overview
                  </button>
                </li>
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('orders'); setIsMobileSidebarOpen(false); }}
                  >
                    <Package size={16} /> Orders
                    <span className="sidebar-badge">{orders.length}</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeTab === 'quotes' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('quotes'); setIsMobileSidebarOpen(false); }}
                  >
                    <ScrollText size={16} /> Custom Quotes
                    {pendingQuotesCount > 0 && <span className="sidebar-badge">{pendingQuotesCount}</span>}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="sidebar-group-label">Catalog Management</div>
              <ul className="sidebar-menu-list">
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeTab === 'catalog' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('catalog'); setIsMobileSidebarOpen(false); }}
                  >
                    <ShoppingBag size={16} /> Product Catalog
                  </button>
                </li>
                <li>
                  <button 
                    className={`sidebar-item-btn ${activeTab === 'discounts' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('discounts'); setIsMobileSidebarOpen(false); }}
                  >
                    <Percent size={16} /> Coupons & Offers
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="sidebar-bottom-area">
            <a href="/" target="_blank" rel="noreferrer" className="sidebar-store-link">
              <ExternalLink size={14} /> Live Storefront ↗
            </a>
            <button onClick={handleLogout} className="sidebar-item-btn" style={{ color: '#ef4444' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        {/* 3. Razorpay Workspace Area */}
        <main className="razorpay-workspace">
          
          {/* Workspace Title */}
          <div className="workspace-header">
            <h2 className="workspace-title">
              {activeTab === 'dashboard' && 'Studio Overview & Performance'}
              {activeTab === 'orders' && 'Client Orders & Fulfillment'}
              {activeTab === 'quotes' && 'Bespoke Custom Inquiry Quotes'}
              {activeTab === 'catalog' && 'Handcrafted Candle Catalog'}
              {activeTab === 'discounts' && 'Promotions & Coupon Discounts'}
            </h2>
            <p className="workspace-subtitle">
              Manage live Atelier inventory, fulfillment workflow, and studio metrics
            </p>
          </div>

          {/* Skeleton Loader during Initial Load */}
          {initialLoading ? (
            <div>
              <MetricSkeleton />
              <div className="rp-card-container">
                <TableSkeleton rows={6} />
              </div>
            </div>
          ) : (
            <div>
              {/* Razorpay Summary Metric Cards */}
              <div className="razorpay-metrics-grid">
                <div className="rp-metric-card">
                  <div className="rp-metric-top">
                    <span className="rp-metric-label">Total Revenue</span>
                    <div className="rp-metric-icon"><DollarSign size={16}/></div>
                  </div>
                  <h3 className="rp-metric-value">₹{totalRevenue.toLocaleString('en-IN')}</h3>
                  <div className="rp-metric-subtext">
                    From captured orders <span>Active</span>
                  </div>
                </div>

                <div className="rp-metric-card">
                  <div className="rp-metric-top">
                    <span className="rp-metric-label">Total Orders</span>
                    <div className="rp-metric-icon"><Package size={16}/></div>
                  </div>
                  <h3 className="rp-metric-value">{orders.length}</h3>
                  <div className="rp-metric-subtext">
                    All fulfillment orders <span>Live</span>
                  </div>
                </div>

                <div className="rp-metric-card">
                  <div className="rp-metric-top">
                    <span className="rp-metric-label">Pending Custom Quotes</span>
                    <div className="rp-metric-icon"><ScrollText size={16}/></div>
                  </div>
                  <h3 className="rp-metric-value">{pendingQuotesCount}</h3>
                  <div className="rp-metric-subtext">
                    Requires pricing <span>Needs Review</span>
                  </div>
                </div>

                <div className="rp-metric-card">
                  <div className="rp-metric-top">
                    <span className="rp-metric-label">Active Catalog Items</span>
                    <div className="rp-metric-icon"><ShoppingBag size={16}/></div>
                  </div>
                  <h3 className="rp-metric-value">{activeProductsCount}</h3>
                  <div className="rp-metric-subtext">
                    Candle products live <span>Storefront</span>
                  </div>
                </div>
              </div>

              {/* Main Content Card with Razorpay Toolbar & Table */}
              <div className="rp-card-container">
                
                {/* Razorpay Toolbar: Filter Pills & Search */}
                <div className="rp-toolbar-bar">
                  {(activeTab === 'dashboard' || activeTab === 'orders') && (
                    <div className="rp-status-pills-list">
                      <button 
                        className={`rp-pill-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                      >
                        All ({orders.length})
                      </button>
                      <button 
                        className={`rp-pill-btn ${statusFilter === 'order_confirmed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('order_confirmed')}
                      >
                        Confirmed
                      </button>
                      <button 
                        className={`rp-pill-btn ${statusFilter === 'handcrafting' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('handcrafting')}
                      >
                        Handcrafting
                      </button>
                      <button 
                        className={`rp-pill-btn ${statusFilter === 'packaging' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('packaging')}
                      >
                        Packaging
                      </button>
                      <button 
                        className={`rp-pill-btn ${statusFilter === 'dispatched' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('dispatched')}
                      >
                        Dispatched
                      </button>
                      <button 
                        className={`rp-pill-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('delivered')}
                      >
                        Delivered
                      </button>
                      <button 
                        className={`rp-pill-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('cancelled')}
                      >
                        Cancelled
                      </button>
                    </div>
                  )}

                  {activeTab === 'catalog' && (
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      All Candles ({filteredProducts.length})
                    </div>
                  )}

                  {activeTab === 'quotes' && (
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      Bespoke Inquiry Quotes ({filteredQuotes.length})
                    </div>
                  )}

                  {activeTab === 'discounts' && (
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                      Active Coupon Codes ({discounts.length})
                    </div>
                  )}

                  <div className="rp-toolbar-right">
                    <div className="rp-table-search">
                      <Search size={14} />
                      <input 
                        type="text" 
                        placeholder="Filter list..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Razorpay Data Table */}
                <div className="table-responsive">
                  
                  {/* ORDERS TABLE */}
                  {(activeTab === 'dashboard' || activeTab === 'orders') && (
                    <table className="razorpay-table">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Total Amount</th>
                          <th>Placed On</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order._id}>
                            <td><strong>#{order.orderNumber}</strong></td>
                            <td>
                              <div><strong>{order.customer.name}</strong></div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{order.customer.phone}</div>
                            </td>
                            <td>
                              <span className={`badge-pill ${order.status}`}>
                                {ORDER_STATUS_LABELS[order.status] || order.status}
                              </span>
                            </td>
                            <td><strong>₹{order.paymentPlan?.total?.toLocaleString('en-IN') || 0}</strong></td>
                            <td style={{ fontSize: '12px', color: '#64748b' }}>
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
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
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                              No orders found matching search criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* QUOTES TABLE */}
                  {activeTab === 'quotes' && (
                    <table className="razorpay-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Contact Details</th>
                          <th>Status</th>
                          <th>Target Date</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuotes.map((q) => (
                          <tr key={q._id}>
                            <td><strong>{q.customer.name}</strong></td>
                            <td>
                              <div>{q.customer.phone}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{q.customer.email}</div>
                            </td>
                            <td><span className={`badge-pill quote-${q.status}`}>{q.status}</span></td>
                            <td>{q.timeline || 'Flexible'}</td>
                            <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {q.description}
                            </td>
                          </tr>
                        ))}
                        {filteredQuotes.length === 0 && (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                              No custom quote inquiries found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* CATALOG TABLE */}
                  {activeTab === 'catalog' && (
                    <table className="razorpay-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((p) => (
                          <tr key={p._id}>
                            <td>
                              <img 
                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=60&q=70'} 
                                alt={p.name} 
                                style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: 6 }}
                              />
                            </td>
                            <td><strong>{p.name}</strong></td>
                            <td><span style={{ fontSize: '12px', color: '#64748b' }}>{p.category}</span></td>
                            <td><strong>₹{p.basePrice.toLocaleString('en-IN')}</strong></td>
                            <td>
                              <span className={`badge-pill ${p.isActive ? 'order_confirmed' : 'cancelled'}`}>
                                {p.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => startEditProduct(p)} className="table-action-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Edit2 size={12} /> Edit
                                </button>
                                <button onClick={() => toggleProductActive(p)} className="table-action-btn" style={{ background: '#64748b' }}>
                                  {p.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* DISCOUNTS TABLE */}
                  {activeTab === 'discounts' && (
                    <table className="razorpay-table">
                      <thead>
                        <tr>
                          <th>Coupon Code</th>
                          <th>Deduction</th>
                          <th>Min Purchase</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discounts.map((d) => (
                          <tr key={d._id}>
                            <td><strong style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', letterSpacing: '0.5px' }}>{d.code}</strong></td>
                            <td><strong>{d.percentage}% Off</strong></td>
                            <td>₹{d.minimumOrderValue.toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`badge-pill ${d.isActive ? 'order_confirmed' : 'cancelled'}`}>
                                {d.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button onClick={() => toggleDiscountActive(d)} className="table-action-btn" style={{ background: '#64748b' }}>
                                  {d.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button onClick={() => deleteDiscount(d._id)} className="table-action-btn" style={{ background: '#ef4444' }}>
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Floating Razorpay Help & Support Button */}
      <div className="floating-help-widget">
        <HelpCircle size={16} /> Atelier Studio Support
      </div>

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
              <div className="modal-header-section" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <span className={`badge-pill ${selectedOrder.status}`}>{ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}</span>
                <h2 style={{ margin: '8px 0 4px 0', fontSize: '1.4rem' }}>Order #{selectedOrder.orderNumber}</h2>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Placed on {new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>

              {/* Fulfilment Pipeline Stepper */}
              <div className="modal-pipeline-stepper" style={{ margin: '16px 0 24px 0', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', fontWeight: 600, marginBottom: '12px' }}>Fulfillment Pipeline</p>
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
                          border: isCurrent ? '1.5px solid #b58a3c' : '1px solid #e2e8f0',
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
                          background: isCurrent ? '#b58a3c' : isDone ? '#10b981' : '#cbd5e1',
                          color: '#fff',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold'
                        }}>
                          {isDone ? <Check size={12}/> : (idx + 1)}
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#b58a3c' : isDone ? '#065f46' : '#64748b', textAlign: 'center', lineHeight: 1.2 }}>
                          {ORDER_STATUS_LABELS[st]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="modal-grid-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b' }}>Shipping Details</h4>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}><strong>Customer:</strong> {selectedOrder.customer.name}</p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}><strong>Address:</strong> {selectedOrder.customer.address}</p>
                    <p style={{ margin: 0, fontSize: '13px' }}><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b' }}>Purchased Items</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {selectedOrder.items.map((item, idx) => (
                        <li key={item._lineId || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #e2e8f0', fontSize: '13px' }}>
                          <span><strong>{item.name}</strong> &times;{item.qty}</span>
                          <span>₹{item.priceAtOrder * item.qty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b' }}>Update Status Workflow</h4>

                  {/* Primary Next Action Stepper */}
                  {nextStatus && (
                    <div style={{ marginBottom: '16px', padding: '14px', background: '#fef7eb', border: '1px solid #fef3c7', borderRadius: '10px' }}>
                      <p style={{ fontSize: '12px', margin: '0 0 8px 0', color: '#b45309', fontWeight: 600 }}>Next Recommended Stage:</p>
                      <button
                        disabled={isActionLoading}
                        onClick={() => updateOrderStatus(nextStatus)}
                        className="top-quick-action-btn"
                        style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                      >
                        {isActionLoading ? 'Updating Stage...' : `Advance to ${ORDER_STATUS_LABELS[nextStatus]} →`}
                      </button>
                    </div>
                  )}

                  <label className="form-field">
                    <span>Internal Log Note</span>
                    <textarea
                      rows={2}
                      placeholder="Provide logistics tracking number or notes..."
                      value={statusUpdateNote}
                      onChange={(e) => setStatusUpdateNote(e.target.value)}
                    />
                  </label>

                  <div style={{ marginTop: '16px' }}>
                    <p style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '8px' }}>Or Jump to Status:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {ORDER_STATUSES.map(st => (
                        <button
                          key={st}
                          disabled={st === selectedOrder.status || isActionLoading}
                          onClick={() => updateOrderStatus(st)}
                          className="table-action-btn"
                          style={{
                            background: selectedOrder.status === st ? '#b58a3c' : '#0f172a',
                            opacity: st === selectedOrder.status ? 0.5 : 1
                          }}
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

      {/* Product Form Overlay */}
      {showProductForm && (
        <div className="drawer-overlay-card">
          <div className="drawer-content-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{editProductId ? 'Edit Product' : 'Add New Candle'}</h3>
              <button onClick={() => setShowProductForm(false)} className="close-btn"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="drawer-form-layout">
              {formError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '13px' }}>{formError}</div>}
              
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

      {/* Discount Form Overlay */}
      {showDiscountForm && (
        <div className="drawer-overlay-card">
          <div className="drawer-content-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Create Coupon Code</h3>
              <button onClick={() => setShowDiscountForm(false)} className="close-btn"><X size={18}/></button>
            </div>
            
            <form onSubmit={handleAddDiscount} className="drawer-form-layout">
              {formError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px', borderRadius: '6px', fontSize: '13px' }}>{formError}</div>}
              
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={closeConfirm}
        isConfirming={isConfirming}
        variant={confirmDialog.variant}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: toast.type === 'error' ? '#ef4444' : '#0f172a',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '100px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.type === 'error' ? <AlertCircle size={16}/> : <Check size={16}/>}
          {toast.message}
        </div>
      )}

    </div>
  );
}
