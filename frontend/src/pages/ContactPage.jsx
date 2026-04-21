import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaMapMarkerAlt, FaPaperPlane, FaGithub, FaLinkedin, FaExclamationTriangle } from 'react-icons/fa';
import PageTransition from '../components/PageTransition';

/**
 * ContactPage - Contact form + contact info cards.
 * Provides a form with name, email, subject, and message fields.
 * Uses FormSubmit.co AJAX API to deliver messages to balaganeshan196@gmail.com.
 * No API key or signup required — just confirm the first email you receive.
 */

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const response = await fetch('https://formsubmit.co/ajax/balaganeshan196@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          _subject: form.subject || 'New Contact Form Submission — StrokeSense',
          message: form.message,
          _template: 'table',
        }),
      });

      const data = await response.json();

      if (data.success === 'true' || data.success === true) {
        setSubmitted(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'Email',
      value: 'balaganeshan196@gmail.com',
      color: '#6c63ff',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Location',
      value: 'India',
      color: '#00d4aa',
    },
  ];

  return (
    <PageTransition>
      <section className="section" style={{ minHeight: '85vh' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          {/* Header */}
          <motion.div
            {...fadeUp(0)}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            <h1
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 800,
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '520px', margin: '0 auto' }}>
              Have questions, feedback, or want to collaborate? We'd love to hear from you. Drop us a
              message and we'll get back to you soon.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.5fr',
              gap: '32px',
            }}
            className="contact-grid"
          >
            {/* Left - Contact Info */}
            <motion.div {...fadeUp(0.1)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {contactInfo.map((info, i) => (
                <div
                  key={i}
                  className="glass-card"
                  style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: `${info.color}15`,
                      border: `1px solid ${info.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <info.icon size={20} style={{ color: info.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                      {info.title}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{info.value}</div>
                  </div>
                </div>
              ))}

              {/* Social links */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                  Follow us
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { Icon: FaGithub, label: 'GitHub' },
                    { Icon: FaLinkedin, label: 'LinkedIn' },
                  ].map(({ Icon, label }, i) => (
                    <a
                      key={i}
                      href="#"
                      aria-label={label}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'var(--color-surface-card)',
                        border: '1px solid var(--glass-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-muted)',
                        transition: 'all 0.2s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                      }}
                    >
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right - Contact Form */}
            <motion.div {...fadeUp(0.2)} className="glass-card" style={{ padding: '36px 32px' }}>
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(0, 212, 170, 0.1)',
                      border: '1px solid rgba(0, 212, 170, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                    }}
                  >
                    <FaPaperPlane size={24} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>
                    Message Sent!
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    Thank you for reaching out. We'll get back to you soon.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} id="contact-form">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="form-grid">
                      <div>
                        <label
                          htmlFor="name"
                          style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-muted)' }}
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-muted)' }}
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className="input-field"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-muted)' }}
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="What's this about?"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-muted)' }}
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Your message..."
                        rows={5}
                        style={{ resize: 'vertical', minHeight: '120px' }}
                        required
                      />
                    </div>

                    {/* Error message */}
                    {error && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: 'rgba(255, 71, 87, 0.08)',
                          border: '1px solid rgba(255, 71, 87, 0.25)',
                          color: '#ff4757',
                          fontSize: '0.9rem',
                        }}
                      >
                        <FaExclamationTriangle size={16} style={{ flexShrink: 0 }} />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      id="submit-contact"
                      className="btn-primary"
                      disabled={sending}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '16px',
                        marginTop: '4px',
                        opacity: sending ? 0.6 : 1,
                      }}
                    >
                      {sending ? (
                        <>
                          <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Responsive */}
      <style>{`
        .contact-grid {
          grid-template-columns: 1fr 1.5fr;
        }
        .form-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
          .form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageTransition>
  );
};

export default ContactPage;
