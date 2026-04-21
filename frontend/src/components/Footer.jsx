import { FaBrain, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * Footer - Application footer with branding, quick links,
 * social icons, and copyright info.
 */
const Footer = () => {
  return (
    <footer
      id="app-footer"
      style={{
        position: 'relative',
        zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(15, 15, 26, 0.6)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 24px 30px',
        }}
      >
        {/* Top Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FaBrain color="#fff" size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                Stroke<span className="gradient-text">Sense</span>
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              AI-powered brain stroke detection from MRI/CT scans. Fast, accurate, and accessible
              healthcare technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { to: '/', label: 'Home' },
                { to: '/model', label: 'Detect Stroke' },
                { to: '/report', label: 'View Report' },
                { to: '/contact', label: 'Contact Us' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--color-primary-light)')}
                  onMouseLeave={(e) => (e.target.style.color = 'var(--color-text-muted)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <span>✉️ contact@strokesense.ai</span>
              <span>📍 India</span>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              {[FaGithub, FaLinkedin, FaTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
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
                    e.currentTarget.style.background = 'rgba(108,99,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-muted)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            © {new Date().getFullYear()} StrokeSense. All rights reserved.
          </p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Built with ❤️ using React & TensorFlow
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
