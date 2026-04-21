import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaBrain } from 'react-icons/fa';

/**
 * Navbar - Responsive glassmorphic navigation bar with mobile menu.
 * Highlights the current active route.
 */
const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/model', label: 'Detect' },
  { path: '/report', label: 'Report' },
  { path: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav
      id="main-navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(15, 15, 26, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '72px',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaBrain color="#fff" size={20} />
          </div>
          <span
            style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}
          >
            Stroke<span className="gradient-text">Sense</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          className="hidden md:flex"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                id={`nav-${link.label.toLowerCase()}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: isActive ? '#fff' : 'var(--color-text-muted)',
                  background: isActive ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(108, 99, 255, 0.3)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.color = '#fff';
                    e.target.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.color = 'var(--color-text-muted)';
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden"
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '8px',
          }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
            style={{
              background: 'rgba(15, 15, 26, 0.95)',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: isActive ? '#fff' : 'var(--color-text-muted)',
                      background: isActive ? 'rgba(108, 99, 255, 0.15)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
