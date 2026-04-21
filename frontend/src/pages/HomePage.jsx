import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBrain, FaShieldAlt, FaBolt, FaChartLine, FaCloudUploadAlt } from 'react-icons/fa';
import PageTransition from '../components/PageTransition';

/**
 * HomePage - Landing page with hero section, feature cards,
 * statistics, how-it-works section, and CTA.
 */

/* Animation helpers */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const features = [
  {
    icon: FaBrain,
    title: 'AI-Powered Analysis',
    desc: 'Our deep learning CNN model analyzes MRI and CT brain scans with high precision to detect stroke indicators.',
    color: '#6c63ff',
  },
  {
    icon: FaBolt,
    title: 'Instant Results',
    desc: 'Get prediction results in seconds with detailed confidence scores — no wait, no delays.',
    color: '#00d4aa',
  },
  {
    icon: FaShieldAlt,
    title: 'Secure & Private',
    desc: 'Your medical images are processed securely and never stored on our servers. Privacy first.',
    color: '#ff4d6a',
  },
  {
    icon: FaChartLine,
    title: 'Detailed Reports',
    desc: 'View comprehensive prediction reports with visual confidence gauges and actionable insights.',
    color: '#ffb84d',
  },
];

const steps = [
  { num: '01', title: 'Upload Scan', desc: 'Upload your MRI or CT brain scan image in JPG, PNG, or DICOM format.' },
  { num: '02', title: 'AI Analysis', desc: 'Our CNN model preprocesses and analyzes the image for stroke indicators.' },
  { num: '03', title: 'Get Results', desc: 'Receive instant prediction with confidence score and detailed report.' },
];

const stats = [
  { value: '95%+', label: 'Accuracy' },
  { value: '<3s', label: 'Analysis Time' },
  { value: '10K+', label: 'Scans Analyzed' },
  { value: '24/7', label: 'Available' },
];

const HomePage = () => {
  return (
    <PageTransition>
      {/* HERO SECTION */}
      <section
        id="hero-section"
        className="section"
        style={{ minHeight: '90vh', display: 'flex', alignItems: 'center' }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '60px',
              alignItems: 'center',
            }}
            className="hero-grid"
          >
            {/* Left - Text Content */}
            <div>
              <motion.div
                {...fadeUp(0)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '50px',
                  background: 'rgba(108, 99, 255, 0.1)',
                  border: '1px solid rgba(108, 99, 255, 0.2)',
                  marginBottom: '24px',
                  fontSize: '0.85rem',
                  color: 'var(--color-primary-light)',
                  fontWeight: 500,
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
                AI-Powered Medical Imaging
              </motion.div>

              <motion.h1
                {...fadeUp(0.1)}
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginBottom: '24px',
                  letterSpacing: '-0.03em',
                }}
              >
                Detect Brain Strokes{' '}
                <span className="gradient-text">Instantly</span> with AI
              </motion.h1>

              <motion.p
                {...fadeUp(0.2)}
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.7,
                  marginBottom: '36px',
                  maxWidth: '520px',
                }}
              >
                Upload your MRI or CT scan and our advanced CNN model will analyze it in seconds to
                detect potential stroke indicators with high confidence.
              </motion.p>

              <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/model" id="cta-detect">
                  <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCloudUploadAlt size={18} />
                    Start Detection
                  </button>
                </Link>
                <Link to="/contact" id="cta-learn">
                  <button className="btn-outline">Learn More</button>
                </Link>
              </motion.div>
            </div>

            {/* Right - Brain Visual */}
            <motion.div
              {...fadeUp(0.2)}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              className="hero-visual"
            >
              <div
                style={{
                  position: 'relative',
                  width: '380px',
                  height: '380px',
                }}
              >
                {/* Outer glow ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    borderRadius: '50%',
                    border: '2px dashed rgba(108, 99, 255, 0.2)',
                  }}
                />
                {/* Middle ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute',
                    inset: '10px',
                    borderRadius: '50%',
                    border: '1px solid rgba(0, 212, 170, 0.15)',
                  }}
                />
                {/* Center brain icon */}
                <div
                  className="pulse-ring"
                  style={{
                    position: 'absolute',
                    inset: '40px',
                    borderRadius: '50%',
                    background: 'var(--gradient-card)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <FaBrain size={100} style={{ color: 'var(--color-primary-light)', opacity: 0.8 }} />
                </div>
                {/* Floating dots */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Infinity,
                    }}
                    style={{
                      position: 'absolute',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)',
                      top: ['20%', '70%', '30%', '80%'][i],
                      left: ['10%', '85%', '90%', '5%'][i],
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ padding: '0 24px 40px', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <motion.div
            {...fadeUp(0)}
            className="glass-card"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '24px',
              padding: '36px 40px',
            }}
          >
            {stats.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div
                  className="gradient-text"
                  style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}
                >
                  {stat.value}
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features-section" className="section" style={{ paddingTop: '60px' }}>
        <div className="container">
          <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 800,
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              Why Choose <span className="gradient-text">StrokeSense</span>?
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Our platform combines cutting-edge deep learning with an intuitive interface to deliver
              fast and reliable stroke detection.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {features.map((feat, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.1)}
                className="glass-card"
                style={{ padding: '36px 30px' }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    background: `${feat.color}15`,
                    border: `1px solid ${feat.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <feat.icon size={24} style={{ color: feat.color }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px' }}>
                  {feat.title}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section">
        <div className="container">
          <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 800,
                marginBottom: '16px',
                letterSpacing: '-0.02em',
              }}
            >
              How It <span className="gradient-text">Works</span>
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', maxWidth: '560px', margin: '0 auto' }}>
              Three simple steps to get an AI-powered stroke analysis from your brain scan.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '30px',
            }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.15)}
                className="glass-card"
                style={{
                  padding: '40px 30px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    fontSize: '6rem',
                    fontWeight: 900,
                    opacity: 0.04,
                    lineHeight: 1,
                    color: '#fff',
                  }}
                >
                  {step.num}
                </div>
                <div
                  className="gradient-text"
                  style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', letterSpacing: '0.05em' }}
                >
                  STEP {step.num}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '12px' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="section" style={{ paddingBottom: '120px' }}>
        <div className="container">
          <motion.div
            {...fadeUp(0)}
            className="glass-card"
            style={{
              padding: '60px 40px',
              textAlign: 'center',
              background: 'var(--gradient-card)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'var(--gradient-primary)',
              }}
            />
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                fontWeight: 800,
                marginBottom: '16px',
              }}
            >
              Ready to Analyze Your Scan?
            </h2>
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '1.1rem',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px',
              }}
            >
              Upload your brain MRI or CT scan now and get instant AI-powered stroke detection results.
            </p>
            <Link to="/model">
              <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '16px 40px' }}>
                Get Started — It's Free
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Responsive styles */}
      <style>{`
        .hero-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .hero-visual {
            order: -1;
          }
          .hero-visual > div {
            width: 260px !important;
            height: 260px !important;
          }
        }
      `}</style>
    </PageTransition>
  );
};

export default HomePage;
