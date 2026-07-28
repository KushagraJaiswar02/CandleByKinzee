import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Lock, Package, Percent, ScrollText, ChevronDown, Check, X } from 'lucide-react';
import { api } from '../api/client.js';

const ORDER_STATUS_LABELS = {
  pending_payment: 'Pending Payment',
  payment_received: 'Payment Received',
  order_confirmed: 'Order Confirmed',
  handcrafting: 'Handcrafting',
  packaging: 'Packaging',
  ready_for_dispatch: 'Ready for Dispatch',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS);

export function Admin() {
  const [admin, setAdmin] = useState(null);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  useEffect(() => {
    api.get('/auth/me').then((res) => setAdmin(res.data.admin)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!admin) return;
    fetchOrders();
    api.get('/quotes/admin/all').then((res) => setQuotes(res.data.quoteRequests));
    api.get('/products').then((res) => setProducts(res.data.products));
  }, [admin]);

  async function fetchOrders() {
    const res = await api.get('/orders/admin/all');
    setOrders(res.data.orders);
  }

  async function submitLogin(event) {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', login);
      setAdmin(response.data.admin);
    } catch (err) {
      alert('Login failed');
    }
  }

  async function openOrderDetails(id) {
    const res = await api.get(`/orders/admin/${id}`);
    setSelectedOrder(res.data.order);
    setStatusUpdateNote('');
  }

  async function updateOrderStatus(newStatus) {
    if (!selectedOrder) return;
    try {
      const res = await api.patch(`/orders/admin/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusUpdateNote
      });
      setSelectedOrder(res.data.order);
      setStatusUpdateNote('');
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
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
                  <td>{order.orderNumber}</td>
                  <td>{order.customer.name}</td>
                  <td>{ORDER_STATUS_LABELS[order.status] || order.status}</td>
                  <td>₹{order.paymentPlan.total}</td>
                  <td>
                    <button onClick={() => openOrderDetails(order._id)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {selectedOrder && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}><X size={20}/></button>
              <h2>Order #{selectedOrder.orderNumber}</h2>
              <div className="admin-order-details">
                <div>
                  <strong>Customer:</strong> {selectedOrder.customer.name} ({selectedOrder.customer.phone})
                  <br/>
                  <strong>Address:</strong> {selectedOrder.customer.address}
                </div>
                <div>
                  <strong>Items:</strong>
                  <ul>
                    {selectedOrder.items.map(item => (
                      <li key={item._lineId}>{item.name} x{item.qty} (₹{item.priceAtOrder * item.qty})</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Total:</strong> ₹{selectedOrder.paymentPlan.total}
                  <br/>
                  <strong>Advance:</strong> ₹{selectedOrder.paymentPlan.advanceAmount} ({selectedOrder.paymentPlan.advanceStatus})
                  <br/>
                  <strong>Balance:</strong> ₹{selectedOrder.paymentPlan.balanceAmount} ({selectedOrder.paymentPlan.balanceStatus})
                </div>
                
                <hr/>
                
                <h3>Update Status</h3>
                <p>Current Status: <strong>{ORDER_STATUS_LABELS[selectedOrder.status]}</strong></p>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px'}}>
                  {ORDER_STATUSES.map(status => (
                    <button 
                      key={status} 
                      disabled={status === selectedOrder.status}
                      onClick={() => updateOrderStatus(status)}
                    >
                      Set to {ORDER_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="Optional internal note / update message" 
                  value={statusUpdateNote}
                  onChange={e => setStatusUpdateNote(e.target.value)}
                  style={{width: '100%', padding: '8px', marginBottom: '15px'}}
                />

                <h3>Status History</h3>
                <ul>
                  {selectedOrder.statusHistory?.map((entry, i) => (
                    <li key={i}>
                      <strong>{ORDER_STATUS_LABELS[entry.status]}</strong> - {new Date(entry.timestamp).toLocaleString()}
                      {entry.note && <div><em>Note: {entry.note}</em></div>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <section id="quotes" className="admin-section">
          <h2>Quote Requests</h2>
          <table><tbody>{quotes.map((quote) => <tr key={quote._id}><td>{quote.customer.name}</td><td>{quote.status}</td><td>{quote.quotedPrice ? `₹${quote.quotedPrice}` : 'Unquoted'}</td></tr>)}</tbody></table>
        </section>
        <section id="catalog" className="admin-section">
          <h2>Catalog Manager</h2>
          <table><tbody>{products.map((product) => <tr key={product._id}><td>{product.name}</td><td>{product.category}</td><td>₹{product.basePrice}</td></tr>)}</tbody></table>
        </section>
      </section>

      <style>{`
        .admin-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100;
        }
        .admin-modal {
          background: white; padding: 20px; border-radius: 8px; width: 90%; max-width: 600px;
          max-height: 90vh; overflow-y: auto; position: relative;
        }
        .admin-modal-close {
          position: absolute; top: 10px; right: 10px; background: none; border: none; cursor: pointer;
        }
        .admin-order-details > div { margin-bottom: 15px; }
      `}</style>
    </main>
  );
}
