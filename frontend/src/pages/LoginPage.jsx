import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  // Redirect back to where they were trying to go, or dashboard
  const from = location.state?.from || '/dashboard';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError('Please enter your email.'); return; }
    if (!form.password)     { setError('Please enter your password.'); return; }

    setLoading(true);
    setError('');
    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-container">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">🏪</div>
          <div className="brand-title">DUKAN AI</div>
          <div className="brand-sub">Voice Inventory</div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-heading">Welcome back</h1>
            <p className="auth-subtext">Sign in to manage your store</p>
          </div>

          {error && (
            <div className="auth-alert" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Email */}
            <div className={`auth-field ${focusedField === 'email' ? 'focused' : ''}`}>
              <label htmlFor="login-email" className="auth-label">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className="auth-input"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className={`auth-field ${focusedField === 'password' ? 'focused' : ''}`}>
              <label htmlFor="login-password" className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className="auth-input"
                  placeholder="Your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : <>Sign In <span className="btn-arrow">→</span></>}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider"><span>or continue with</span></div>

          {/* Social buttons (UI only — wire to OAuth provider when ready) */}
          <div className="auth-socials">
            <button className="auth-social-btn" type="button" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button className="auth-social-btn" type="button" disabled>
              <span style={{ fontSize: '1.1rem' }}>📱</span>
              Phone OTP
            </button>
          </div>

          {/* Switch */}
          <p className="auth-switch-text">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Create one free →</Link>
          </p>

          {/* Demo hint */}
          <div className="auth-demo-hint">
            <span>🧪</span>
            <span>Demo: <strong>demo@dukanai.com</strong> / <strong>demo123</strong></span>
          </div>
        </div>

        <p className="auth-footer">DUKAN AI © 2025 · Built for Indian shopkeepers</p>
      </div>
    </div>
  );
}
