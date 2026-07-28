'use client';

import React from 'react';
import { Instagram, Mail, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/Layout.jsx';

export default function Socials() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917000701579';
  return (
    <Layout>
      <section className="page-head">
        <p className="eyebrow">Contact</p>
        <h1>Talk through colors, quantities, delivery, or deadlines.</h1>
        <div className="social-list">
          <a href={`https://wa.me/${number}?text=${encodeURIComponent('Hello!')}`}><MessageCircle /> WhatsApp</a>
          <a href="https://www.instagram.com/candle_by_kinzee/"><Instagram /> Instagram</a>
          <a href="mailto:orders@candlebykinzee.example"><Mail /> Email</a>
        </div>
      </section>
    </Layout>
  );
}
