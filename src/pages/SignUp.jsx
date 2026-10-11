import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import Logo from '../components/Logo';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const FEATURES = [
  { icon: '💰', text: 'Track your ₹10,000 budget' },
  { icon: '🧠', text: 'Simulate purchases before spending' },
  { icon: '🎯', text: 'Protect your savings goals' },
  { icon: '❤️', text: 'Understand your financial health' },
];

const SignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', terms: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!validateEmail(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!form.terms) errs.terms = 'You must accept the Terms of Service.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await signUp(form.name.trim(), form.email.trim(), form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDemo = () => {
    alert('🔒 Google OAuth is a demo placeholder. This is a frontend-only prototype. Please use the registration form to create a demo account.');
  };

  return (
    <div className="auth-page">
      {/* Branding Panel */}
      <div className="auth-branding">
        <div className="auth-brand-logo">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo size="lg" variant="dark" />
          </Link>
        </div>

        <h1 className="auth-brand-heading">Your next chapter starts here.</h1>
        <p className="auth-brand-sub">Build better money habits, one decision at a time.</p>

        <div className="auth-illustration">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="vis-card"
                style={{ animation: `floatIn 0.5s ease ${i * 0.1}s both` }}
              >
                <div className="vis-card-icon" style={{ background: 'rgba(255,255,255,0.1)', fontSize: 22 }}>
                  {f.icon}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9375rem', fontWeight: 500 }}>
                  {f.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          <div className="auth-mobile-logo" style={{ marginBottom: 20 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Logo size="sm" variant="light" />
            </Link>
          </div>
          <h2 className="auth-form-title">Create account</h2>
          <p className="auth-form-subtitle">Start your 30-day ₹10,000 challenge today.</p>

          {serverError && (
            <div className="insight-item danger" style={{ marginBottom: 20 }}>
              <span>⚠️ {serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="signup-name">Full name <span>*</span></label>
              <input
                id="signup-name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Aarav Sharma"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="signup-email">Email address <span>*</span></label>
              <input
                id="signup-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <PasswordInput
              id="signup-password"
              name="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              error={errors.password}
            />

            <PasswordInput
              id="signup-confirm"
              name="confirmPassword"
              label="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              error={errors.confirmPassword}
            />

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" name="terms" checked={form.terms} onChange={handleChange} />
                <span>
                  I agree to the{' '}
                  <button type="button" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => alert('📄 Terms of Service: This is a demo application for hackathon purposes. No real financial data is collected.')}>
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button type="button" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    onClick={() => alert('🔐 Privacy Policy: All data in this demo is stored locally in your browser and never transmitted to any server.')}>
                    Privacy Policy
                  </button>
                </span>
              </label>
              {errors.terms && <div className="form-error" style={{ marginTop: 4 }}>{errors.terms}</div>}
            </div>

            <button id="signup-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="divider">or continue with</div>

          <button id="google-signup-btn" className="google-btn" type="button" onClick={handleGoogleDemo}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google (Demo)
          </button>

          <div className="auth-footer">
            Already have an account? <Link to="/signin">Sign in</Link>
          </div>

          <div style={{ marginTop: 20, padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
            🔒 <strong>Demo Only</strong> — Credentials are stored locally. Do not use real passwords.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
