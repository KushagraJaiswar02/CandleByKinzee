'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Calendar, Check } from 'lucide-react';
import { Layout } from '@/components/Layout.jsx';
import { FlameButton } from '@/components/FlameButton.jsx';
import { api } from '@/lib/api.js';

export default function QuoteRequest() {
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);
  const [visionText, setVisionText] = useState('');
  const [timeline, setTimeline] = useState('');
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [activePreviewUrl, setActivePreviewUrl] = useState(null);
  
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    async function checkCustomer() {
      try {
        const res = await api.get('/customer-auth/me');
        if (res.data?.customer) {
          setLoggedInCustomer(res.data.customer);
          setCustomer({
            name: res.data.customer.name || '',
            phone: res.data.customer.phone || '',
            email: res.data.customer.email || '',
          });
        }
      } catch {
        // Not logged in as customer
      }
    }
    checkCustomer();
  }, []);

  const handleFiles = (filesList) => {
    const validFiles = Array.from(filesList).filter(
      (file) => file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp'
    );

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => [
          ...prev, 
          { id: Math.random().toString(36).substr(2, 9), name: file.name, dataUrl: reader.result }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    const finalDescription = `
[Target Date]: ${timeline || 'Flexible'}

[Vision / Creative Brief]:
${visionText}
    `.trim();

    try {
      const referenceImagesUrls = uploadedImages.map((img) => img.dataUrl);
      
      await api.post('/quotes', { 
        customer, 
        description: finalDescription, 
        referenceImages: referenceImagesUrls 
      });

      setSent(true);
      setCustomer({ name: '', phone: '', email: '' });
      setTimeline('');
      setVisionText('');
      setUploadedImages([]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit quote request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="quote-split-page">
        <div className="quote-split-container">
          
          <div className="quote-split-left">
            <p className="eyebrow">The Kinzee Studio</p>
            <h1>Start Your Custom Creation</h1>
            <p className="quote-split-intro">
              Let&apos;s craft something uniquely yours. Whether you are planning bespoke wedding favours, 
              arranging corporate gifts, or designing custom celebration candles, we collaborate with you 
              to formulate custom scents, shapes, and personalized details.
            </p>
            
            <div className="quote-split-image-container">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80" 
                alt="Kinzee Studio candle crafting" 
              />
              <div className="quote-split-image-overlay" />
            </div>

            <div className="quote-split-reassurance">
              <p>&ldquo;Every custom order is discussed personally before production. Don&apos;t worry if you don&apos;t know all the details yet—our studio will help refine your vision.&rdquo;</p>
            </div>
          </div>

          <div className="quote-split-right">
            {sent ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="quote-success-panel"
              >
                <div className="success-icon-badge">
                  <Check size={32} />
                </div>
                <h2>Your Request is Received</h2>
                <p>
                  We will contact you shortly through WhatsApp.
                </p>
                
                {loggedInCustomer ? (
                  <div className="success-auth-invite" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                    <h4 style={{ color: '#065f46' }}>Linked to Your Account ({loggedInCustomer.name || loggedInCustomer.email}) ✨</h4>
                    <p style={{ color: '#047857' }}>This custom request is saved to your profile. You can view its status and updates anytime in your dashboard.</p>
                    <button 
                      type="button" 
                      onClick={() => window.dispatchEvent(new CustomEvent('open-customer-auth'))}
                      className="success-invite-auth-btn"
                      style={{ background: '#059669', color: '#ffffff' }}
                    >
                      View My Custom Requests 👤
                    </button>
                  </div>
                ) : (
                  <div className="success-auth-invite">
                    <h4>Want to keep everything in one place?</h4>
                    <p>Create your free Kinzee account in under 10 seconds to track status, view custom requests, and store addresses.</p>
                    <button 
                      type="button" 
                      onClick={() => window.dispatchEvent(new CustomEvent('open-customer-auth', { detail: { phone: customer.phone } }))}
                      className="success-invite-auth-btn"
                    >
                      Continue with Phone Number
                    </button>
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={() => setSent(false)} 
                  className="quote-reset-btn"
                >
                  Not Now
                </button>
              </motion.div>
            ) : (
              <form className="quote-minimal-form" onSubmit={submit}>
                {error && (
                  <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                    {error}
                  </div>
                )}
                <div className="quote-minimal-section">
                  <h4>01. Contact Information</h4>
                  <div className="quote-minimal-inputs">
                    <label className="quote-minimal-label">
                      <span>Full Name</span>
                      <input 
                        type="text" 
                        required 
                        value={customer.name} 
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        placeholder="Your full name" 
                      />
                    </label>

                    <label className="quote-minimal-label">
                      <span>Phone Number</span>
                      <input 
                        type="tel" 
                        required 
                        value={customer.phone} 
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        placeholder="Primary phone number" 
                      />
                    </label>

                    <label className="quote-minimal-label">
                      <span>Email Address</span>
                      <input 
                        type="email" 
                        required 
                        value={customer.email} 
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        placeholder="Your email address" 
                      />
                    </label>
                  </div>
                </div>

                <div className="quote-minimal-section">
                  <h4>02. Tell Us Your Vision</h4>
                  <label className="quote-minimal-label">
                    <span>Your Idea</span>
                    <textarea
                      required
                      value={visionText}
                      onChange={(e) => setVisionText(e.target.value)}
                      placeholder="Tell us about your idea... E.g., Wedding favours for 150 guests, soft sage green and ivory colour palette, lavender fragrance, delivery before 15 September..."
                      className="quote-story-textarea"
                    />
                  </label>

                  <div className="quote-helper-tips">
                    <span className="quote-helper-title">Helpful things to mention (optional)</span>
                    <ul>
                      <li>Occasion & Event Type</li>
                      <li>Approximate quantity</li>
                      <li>Preferred colours</li>
                      <li>Favourite fragrances</li>
                      <li>Delivery date</li>
                      <li>Target budget</li>
                    </ul>
                  </div>
                </div>

                <div className="quote-minimal-section">
                  <h4>03. Timeline</h4>
                  <label className="quote-minimal-label">
                    <span>When do you need it? (Optional)</span>
                    <div className="quote-input-icon-wrapper">
                      <Calendar size={16} className="quote-icon" />
                      <input 
                        type="date" 
                        value={timeline} 
                        onChange={(e) => setTimeline(e.target.value)} 
                        className="quote-date-input"
                      />
                    </div>
                  </label>
                </div>

                <div className="quote-minimal-section">
                  <h4>04. Inspiration Board</h4>
                  <p className="quote-section-microcopy">Reference images are always welcome. Drop any inspiration files below.</p>
                  
                  <div className="quote-upload-wrapper">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`quote-upload-dragzone ${dragOver ? 'is-dragover' : ''}`}
                    >
                      <Upload size={20} className="quote-upload-icon" />
                      <p>Drag & drop inspiration here, or <label className="file-browse-btn">browse files<input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e.target.files)} /></label></p>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="quote-upload-previews-list">
                        {uploadedImages.map((img) => (
                          <div key={img.id} className="quote-upload-preview-card">
                            <img 
                              src={img.dataUrl} 
                              alt="Preview reference" 
                              onClick={() => setActivePreviewUrl(img.dataUrl)}
                            />
                            <button 
                              type="button" 
                              onClick={() => removeImage(img.id)}
                              className="preview-remove-btn"
                              aria-label="Remove image"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="quote-submit-block">
                  <FlameButton type="submit" disabled={submitting}>
                    {submitting ? 'Sending Idea...' : 'Start Your Custom Creation'}
                  </FlameButton>
                  <p className="quote-cta-disclaimer">Every custom order is discussed personally with you before production.</p>
                </div>

              </form>
            )}
          </div>

        </div>

        <AnimatePresence>
          {activePreviewUrl && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePreviewUrl(null)}
              className="quote-lightbox-overlay"
            >
              <motion.div 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="quote-lightbox-content"
                onClick={(e) => e.stopPropagation()}
              >
                <img src={activePreviewUrl} alt="Enlarged inspiration preview" />
                <button 
                  type="button" 
                  onClick={() => setActivePreviewUrl(null)}
                  className="lightbox-close-btn"
                >
                  <X size={18} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
}
