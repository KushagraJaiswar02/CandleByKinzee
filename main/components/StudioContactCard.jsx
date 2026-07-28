'use client';

import React from 'react';
import { MessageCircle, Mail, Phone } from 'lucide-react';

export function StudioContactCard({ type, data }) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '917000701579';
  const studioEmail = 'orders@candlewithkinzee.co';
  const studioPhone = '+917000701579';

  // Build dynamic messages
  let title = 'Need assistance?';
  let waMessage = '';
  let emailSubject = '';
  let emailBody = '';

  const [refId, setRefId] = React.useState(data?.refId || 9999);
  React.useEffect(() => {
    if (!data?.refId) {
      setRefId(Math.floor(1000 + Math.random() * 9000));
    }
  }, [data]);

  if (type === 'product' && data) {
    title = `Questions about the ${data.name}?`;
    waMessage = 'Hello!';
    emailSubject = `Inquiry regarding ${data.name}`;
    emailBody = `Hi Kinzee,\n\nI'm browsing the website and interested in the ${data.name} candle. I'd like to learn more.`;
  } else if (type === 'order' && data) {
    title = `Need help with Order #${data.orderNumber}?`;
    const clientName = data.customer?.name || 'Customer';
    const status = data.status || 'placed';
    waMessage = 'Hello!';
    emailSubject = `Support for Order #${data.orderNumber}`;
    emailBody = `Hi Kinzee,\n\nMy name is ${clientName}. I'm reaching out about Order #${data.orderNumber} (Current status: ${status}).`;
  } else if (type === 'quote' && data) {
    title = 'Want to discuss your custom design?';
    const clientName = data.customer?.name || 'Customer';
    const status = data.status || 'pending';
    const id = data._id ? String(data._id).slice(-6).toUpperCase() : 'NEW';
    waMessage = "Hello! I'd like to discuss a custom order.";
    emailSubject = `Discussion for Custom Brief #CR-${id}`;
    emailBody = `Hi Kinzee,\n\nMy name is ${clientName}. I'd like to talk about custom request #CR-${id} (Current status: ${status}).`;
  } else if (type === 'bulk') {
    title = 'Planning a large celebration?';
    waMessage = "Hello! I'd like to discuss a bulk order.";
    emailSubject = `Bulk Inquiry - BQ${refId}`;
    emailBody = `Hello Kinzee,\n\nWe are looking to place a bulk inquiry (Reference: BQ${refId}). Let's discuss quantities and custom favors.`;
  }

  const encodedWa = encodeURIComponent(waMessage);
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedWa}`;
  const mailUrl = `mailto:${studioEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const telUrl = `tel:${studioPhone}`;

  return (
    <div className="studio-contact-card">
      <div className="studio-contact-card-inner">
        <h4>{title}</h4>
        <p className="studio-contact-subtext">Our Indore studio is here to assist. Continue the conversation on your preferred channel.</p>
        <div className="studio-contact-actions">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="studio-action-btn wa-btn">
            <MessageCircle size={16} />
            <span>Continue on WhatsApp →</span>
          </a>
          <div className="studio-action-fallbacks">
            <a href={mailUrl} className="studio-fallback-btn">
              <Mail size={14} />
              <span>Email Studio</span>
            </a>
            <a href={telUrl} className="studio-fallback-btn">
              <Phone size={14} />
              <span>Call Studio</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
