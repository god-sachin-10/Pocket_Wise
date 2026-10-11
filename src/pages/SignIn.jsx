import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import Logo from '../components/Logo';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required.';
    else if (!validateEmail(form.email)) errs.email = 'Please enter a valid email address.';
    if (!form.password) errs.password = 'Password is required.';
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
      await signIn(form.email, form.password);
      navigate('/');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleDemo = () => {
    setServerError('');
    alert('🔒 Google OAuth is a demo placeholder. This is a frontend-only prototype — no real authentication is performed. Please use the email/password form with a registered demo account.');
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

        <h1 className="auth-brand-heading">Welcome back to your money space.</h1>
        <p className="auth-brand-sub">Make every rupee count. Your financial journey continues here.</p>

        <div className="auth-illustration">
          <div className="finance-cards-visual">
            <div className="vis-card">
              <div className="vis-card-icon" style={{ background: 'rgba(121,104,239,0.2)' }}>💳</div>
              <div>
                <div className="vis-card-label">Available Balance</div>
                <div className="vis-card-value">₹7,452</div>
              </div>
            </div>
            <div className="vis-card">
              <div className="vis-card-icon" style={{ background: 'rgba(67,183,162,0.2)' }}>🎯</div>
              <div>
                <div className="vis-card-label">Savings Goal</div>
                <div className="vis-card-value">₹2,500</div>
                <div className="vis-card-progress">
                  <div className="vis-progress-bar">
                    <div className="vis-progress-fill" style={{ width: '40%', background: '#43B7A2' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="vis-card">
              <div className="vis-card-icon" style={{ background: 'rgba(240,163,74,0.2)' }}>📊</div>
              <div>
                <div className="vis-card-label">Daily Allowance</div>
                <div className="vis-card-value">₹248/day</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-benefits">
          {[
            'Stay on top of your spending.',
            'Make confident financial decisions.',
            'Keep your goals within reach.',
          ].map((b, i) => (
            <div key={i} className="auth-benefit">
              <div className="benefit-dot" />
              {b}
            </div>
          ))}
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
          <h2 className="auth-form-title">Welcome back!</h2>
          <p className="auth-form-subtitle">Sign in to continue your financial journey.</p>

          {serverError && (
            <div className="insight-item danger" style={{ marginBottom: 20 }}>
              <span>⚠️ {serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="signin-email">Email address <span>*</span></label>
              <input
                id="signin-email"
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
              id="signin-password"
              name="password"
              label="Password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              error={errors.password}
            />

            <div className="remember-row">
              <label className="checkbox-label">
                <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} />
                Remember me
              </label>
              <button type="button" className="forgot-link" onClick={() => alert('🔒 Password recovery is not available in this demo prototype.')}>
                Forgot password?
              </button>
            </div>

            <button id="signin-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="divider">or continue with</div>

          <button id="google-signin-btn" className="google-btn" type="button" onClick={handleGoogleDemo}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google (Demo)
          </button>

          <div className="auth-footer">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </div>

          <div style={{ marginTop: 20, padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
            🔒 <strong>Demo Only</strong> — This is a frontend prototype. Data is stored locally in your browser. Do not use real credentials.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
