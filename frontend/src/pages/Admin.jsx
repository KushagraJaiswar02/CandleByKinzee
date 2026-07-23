import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Lock, Package, Percent, ScrollText } from 'lucide-react';
import { api } from '../api/client.js';

export function Admin() {
  const [admin, setAdmin] = useState(null);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get('/auth/me').then((res) => setAdmin(res.data.admin)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!admin) return;
    api.get('/orders/admin/all').then((res) => setOrders(res.data.orders));
    api.get('/quotes/admin/all').then((res) => setQuotes(res.data.quoteRequests));
    api.get('/products').then((res) => setProducts(res.data.products));
  }, [admin]);

  async function submitLogin(event) {
    event.preventDefault();
    const response = await api.post('/auth/login', login);
    setAdmin(response.data.admin);
  }

  if (!admin) {
    return (
      <main className="admin-login">
        <form className="form" onSubmit={submitLogin}>
          <Lock />
          <h1>Admin login</h1>
          <label className="field">Email<input type="email" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} /></label>
          <label className="field">Password<input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /></label>
          <button className="primary-btn">Sign in</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-app">
      <aside>
        <h1>Candle Admin</h1>
        <a href="#dashboard"><LayoutDashboard /> Dashboard</a>
        <a href="#orders"><ScrollText /> Orders</a>
        <a href="#quotes"><ScrollText /> Quotes</a>
        <a href="#catalog"><Package /> Catalog</a>
        <a href="#discounts"><Percent /> Discounts</a>
      </aside>
      <section className="admin-content">
        <section id="dashboard" className="admin-section">
          <h2>Dashboard</h2>
          <div className="stat-grid">
            <div><strong>{orders.length}</strong><span>orders</span></div>
            <div><strong>{quotes.filter((quote) => quote.status === 'pending').length}</strong><span>pending quotes</span></div>
            <div><strong>{products.length}</strong><span>active products</span></div>
          </div>
        </section>
        <section id="orders" className="admin-section">
          <h2>Orders</h2>
          <table><tbody>{orders.map((order) => <tr key={order._id}><td>{order.orderNumber}</td><td>{order.customer.name}</td><td>{order.status}</td><td>₹{order.paymentPlan.total}</td></tr>)}</tbody></table>
        </section>
        <section id="quotes" className="admin-section">
          <h2>Quote Requests</h2>
          <table><tbody>{quotes.map((quote) => <tr key={quote._id}><td>{quote.customer.name}</td><td>{quote.status}</td><td>{quote.quotedPrice ? `₹${quote.quotedPrice}` : 'Unquoted'}</td></tr>)}</tbody></table>
        </section>
        <section id="catalog" className="admin-section">
          <h2>Catalog Manager</h2>
          <table><tbody>{products.map((product) => <tr key={product._id}><td>{product.name}</td><td>{product.category}</td><td>₹{product.basePrice}</td></tr>)}</tbody></table>
        </section>
        <section id="discounts" className="admin-section">
          <h2>Banners, Offers, Discounts</h2>
          <p>Use the protected API endpoints to create banners and coupon codes. All public banner text is sanitized by the API before display.</p>
        </section>
      </section>
    </main>
  );
}
