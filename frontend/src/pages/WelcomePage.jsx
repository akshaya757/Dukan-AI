import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="welcome-hero-page">
      {/* Decorative background blobs */}
      <div className="welcome-blob welcome-blob-1" />
      <div className="welcome-blob welcome-blob-2" />

      <div className="welcome-hero-content">
        {/* Top Logo & Pill */}
        <div className="welcome-top-badge">
          <span className="live-sparkle">✨</span>
          <span>Next-Gen Indian Retail AI</span>
        </div>

        <div className="welcome-brand-center">
          <div className="welcome-logo-glow">
            <span className="welcome-emoji">🏪</span>
          </div>
          <h1 className="welcome-brand-name">DUKAN AI</h1>
          <p className="welcome-brand-sub">Smart Voice Inventory Assistant</p>
        </div>

        <p className="welcome-hero-description">
          Manage stock with your voice in <strong>Telugu</strong>, <strong>English</strong>, or <strong>Tanglish</strong>. Built specifically for local retail and kirana store owners.
        </p>

        {/* Feature Highlights Grid */}
        <div className="welcome-features-list">
          <div className="welcome-feature-card">
            <span className="wf-icon">🎙️</span>
            <div className="wf-text">
              <h4>Voice Stock In & Out</h4>
              <p>Say <em>"Rice 5 bags add cheyyi"</em> or <em>"Sugar 2 kg ammamu"</em></p>
            </div>
          </div>

          <div className="welcome-feature-card">
            <span className="wf-icon">⚡</span>
            <div className="wf-text">
              <h4>Real-Time Inventory</h4>
              <p>Instant tracking of stock units, quantities, and recent transactions</p>
            </div>
          </div>

          <div className="welcome-feature-card">
            <span className="wf-icon">🚨</span>
            <div className="wf-text">
              <h4>Low-Stock Alerts</h4>
              <p>Automated threshold warnings before essential goods run out</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="welcome-action-group">
          <button
            type="button"
            className="welcome-btn-primary"
            onClick={() => navigate('/signup')}
          >
            Get Started — It's Free 🚀
          </button>

          <div className="welcome-btn-row-sub">
            <button
              type="button"
              className="welcome-btn-secondary"
              onClick={() => navigate('/login')}
            >
              Sign In to Store
            </button>
            <button
              type="button"
              className="welcome-btn-ghost"
              onClick={() => navigate('/dashboard')}
            >
              Live Demo →
            </button>
          </div>
        </div>

        {/* Language Badges */}
        <div className="welcome-languages-wrap">
          <span className="lang-label">Supported Languages:</span>
          <div className="lang-tags-list">
            <span className="lang-tag">English</span>
            <span className="lang-tag">తెలుగు (Telugu)</span>
            <span className="lang-tag">Tanglish</span>
          </div>
        </div>

        <div className="welcome-footer-tag">
          DUKAN AI © 2025 • Designed for Indian Kirana & Retail Stores
        </div>
      </div>
    </div>
  );
}
