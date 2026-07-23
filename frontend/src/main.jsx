import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import { Shop } from './pages/Shop.jsx';
import { ProductDetail } from './pages/ProductDetail.jsx';
import { QuoteRequest } from './pages/QuoteRequest.jsx';
import { Bag } from './pages/Bag.jsx';
import { Checkout } from './pages/Checkout.jsx';
import { Tracking } from './pages/Tracking.jsx';
import { Story } from './pages/Story.jsx';
import { Socials } from './pages/Socials.jsx';
import { Admin } from './pages/Admin.jsx';
import { CartProvider } from './components/CartContext.jsx';
import './styles/main.css';
import './styles/mobile.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections/:category" element={<Shop />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/custom-order" element={<QuoteRequest />} />
          <Route path="/bag" element={<Bag />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<Tracking />} />
          <Route path="/story" element={<Story />} />
          <Route path="/socials" element={<Socials />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </React.StrictMode>
);
