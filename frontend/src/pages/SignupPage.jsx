import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'te', label: 'తెలుగు (Telugu)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'ta', label: 'Tamil' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    shopName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: 'en',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [done, setDone] = useState(false);
  const [createdShop, setCreatedShop] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.shopName.trim())  errs.shopName = 'Shop name is required';
    if (!form.name.trim())      errs.name = 'Owner name is required';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) errs.email = 'Enter a valid email';
    if (form.phone && !form.phone.match(/^\d{10}$/)) errs.phone = '10-digit number required';
    if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        shopName: form.shopName.trim(),
        phone: form.phone.trim() || null,
        preferredLanguage: form.preferredLanguage,
      });
      setCreatedShop(form.shopName.trim());
      setDone(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-container">
          <div className="auth-card auth-success-card">
            <div className="auth-success-icon">🎉</div>
            <h2 className="auth-heading" style={{ textAlign: 'center' }}>
              {createdShop} is Live!
            </h2>
            <p className="auth-subtext" style={{ textAlign: 'center', marginBottom: 28 }}>
              Your account is set up. Start managing inventory with your voice.
            </p>
            <button className="auth-btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-container">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-logo">🏪</div>
          <div className="brand-title">DUKAN AI</div>
          <div className="brand-sub">Create your store</div>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-heading">Open your dukan</h1>
            <p className="auth-subtext">Free forever · No card required</p>
          </div>

          {serverError && (
            <div className="auth-alert" role="alert">
              <span>⚠️</span> {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Shop Name */}
            <div className={`auth-field ${focusedField === 'shopName' ? 'focused' : ''} ${errors.shopName ? 'error' : ''}`}>
              <label htmlFor="su-shopName" className="auth-label">Shop / Store name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🏪</span>
                <input id="su-shopName" type="text" name="shopName"
                  value={form.shopName} onChange={handleChange}
                  onFocus={() => setFocusedField('shopName')} onBlur={() => setFocusedField('')}
                  className="auth-input" placeholder="e.g. Sri Rama Stores"
                  autoComplete="organization" disabled={loading} />
              </div>
              {errors.shopName && <span className="auth-error-msg">{errors.shopName}</span>}
            </div>

            {/* Owner Name */}
            <div className={`auth-field ${focusedField === 'name' ? 'focused' : ''} ${errors.name ? 'error' : ''}`}>
              <label htmlFor="su-name" className="auth-label">Owner name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">👤</span>
                <input id="su-name" type="text" name="name"
                  value={form.name} onChange={handleChange}
                  onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField('')}
                  className="auth-input" placeholder="Your full name"
                  autoComplete="name" disabled={loading} />
              </div>
              {errors.name && <span className="auth-error-msg">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className={`auth-field ${focusedField === 'email' ? 'focused' : ''} ${errors.email ? 'error' : ''}`}>
              <label htmlFor="su-email" className="auth-label">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input id="su-email" type="email" name="email"
                  value={form.email} onChange={handleChange}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')}
                  className="auth-input" placeholder="you@example.com"
                  autoComplete="email" disabled={loading} />
              </div>
              {errors.email && <span className="auth-error-msg">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className={`auth-field ${focusedField === 'phone' ? 'focused' : ''} ${errors.phone ? 'error' : ''}`}>
              <label htmlFor="su-phone" className="auth-label">
                Phone number <span className="auth-optional">(optional)</span>
              </label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">📱</span>
                <input id="su-phone" type="tel" name="phone"
                  value={form.phone} onChange={handleChange}
                  onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField('')}
                  className="auth-input" placeholder="10-digit mobile number"
                  autoComplete="tel" maxLength={10} disabled={loading} />
              </div>
              {errors.phone && <span className="auth-error-msg">{errors.phone}</span>}
            </div>

            {/* Preferred Language */}
            <div className={`auth-field ${focusedField === 'preferredLanguage' ? 'focused' : ''}`}>
              <label htmlFor="su-lang" className="auth-label">Preferred language</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🌐</span>
                <select id="su-lang" name="preferredLanguage"
                  value={form.preferredLanguage} onChange={handleChange}
                  onFocus={() => setFocusedField('preferredLanguage')} onBlur={() => setFocusedField('')}
                  className="auth-input auth-select" disabled={loading}>
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className={`auth-field ${focusedField === 'password' ? 'focused' : ''} ${errors.password ? 'error' : ''}`}>
              <label htmlFor="su-password" className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input id="su-password" type={showPassword ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField('')}
                  className="auth-input" placeholder="Min. 6 characters"
                  autoComplete="new-password" disabled={loading} />
                <button type="button" className="auth-eye-btn"
                  onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="auth-error-msg">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className={`auth-field ${focusedField === 'confirmPassword' ? 'focused' : ''} ${errors.confirmPassword ? 'error' : ''}`}>
              <label htmlFor="su-confirm" className="auth-label">Confirm password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔐</span>
                <input id="su-confirm" type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField('')}
                  className="auth-input" placeholder="Repeat password"
                  autoComplete="new-password" disabled={loading} />
                <button type="button" className="auth-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="auth-error-msg">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" id="signup-submit" className="auth-btn-primary"
              disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <span className="auth-spinner" /> : <>Create My Store 🚀</>}
            </button>
          </form>

          <p className="auth-terms">
            By signing up you agree to our{' '}
            <a href="#terms" className="auth-link-small">Terms</a> &amp;{' '}
            <a href="#privacy" className="auth-link-small">Privacy Policy</a>
          </p>

          <p className="auth-switch-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in →</Link>
          </p>
        </div>

        <p className="auth-footer">DUKAN AI © 2025 · Built for Indian shopkeepers</p>
      </div>
    </div>
  );
}
