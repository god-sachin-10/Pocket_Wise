import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/Modal';
import Logo from '../components/Logo';

const Settings = () => {
  const { user, logout } = useAuth();
  const { financeData, updateSettings, resetDemoData, addToast } = useFinance();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    startingBudget: financeData?.settings?.startingBudget || 10000,
    challengeDays: financeData?.settings?.challengeDays || 30,
    daysRemaining: financeData?.settings?.daysRemaining || 15,
    emergencyReserve: financeData?.settings?.emergencyReserve || 1000,
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: Number(e.target.value) }));
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Settings</h1>
          <p>Customize your Pocketwise experience.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Profile */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div className="card-title">Profile</div>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Demo Account</div>
              </div>
            </div>
            <div className="insight-item info" style={{ fontSize: '0.8125rem' }}>
              🔒 This is a local demo account. Your data is stored in your browser only.
            </div>
          </div>
        </div>

        {/* Challenge Settings */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div className="card-title">Challenge Settings</div>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="set-budget">Starting Budget (₹)</label>
              <input id="set-budget" name="startingBudget" type="number" className="form-input" value={settings.startingBudget} onChange={handleChange} />
              <div className="form-hint">The total budget for your challenge period.</div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="set-days">Challenge Days</label>
                <input id="set-days" name="challengeDays" type="number" className="form-input" value={settings.challengeDays} onChange={handleChange} min="1" max="90" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="set-remaining">Days Remaining</label>
                <input id="set-remaining" name="daysRemaining" type="number" className="form-input" value={settings.daysRemaining} onChange={handleChange} min="0" max={settings.challengeDays} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="set-reserve">Emergency Reserve (₹)</label>
              <input id="set-reserve" name="emergencyReserve" type="number" className="form-input" value={settings.emergencyReserve} onChange={handleChange} />
              <div className="form-hint">Amount always kept in reserve for emergencies.</div>
            </div>
            <button id="save-settings-btn" className="btn btn-primary" onClick={handleSave}>
              {saved ? '✓ Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Display & Currency */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ paddingBottom: 16 }}>
          <div className="card-title">Display</div>
        </div>
        <div className="card-body" style={{ paddingTop: 0 }}>
          <div className="form-group" style={{ maxWidth: 240 }}>
            <label className="form-label" htmlFor="set-currency">Currency</label>
            <select id="set-currency" className="form-select" defaultValue="INR" onChange={() => addToast('Currency display: only INR is supported in this demo.', 'info')}>
              <option value="INR">🇮🇳 Indian Rupee (₹)</option>
              <option value="USD">🇺🇸 US Dollar ($)</option>
              <option value="EUR">🇪🇺 Euro (€)</option>
            </select>
            <div className="form-hint">Only ₹ INR is fully supported in this demo.</div>
          </div>
        </div>
      </div>

      {/* Brand & Gen Z Logo Showcase */}
      <div className="card" style={{ marginTop: 24, background: 'linear-gradient(135deg, rgba(30,19,56,0.04) 0%, rgba(121,104,239,0.06) 100%)', border: '1px solid rgba(121,104,239,0.2)' }}>
        <div className="card-header" style={{ paddingBottom: 16 }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚡ Brand Identity & Logo</span>
            <span style={{ fontSize: '0.6875rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(121,104,239,0.15)', color: 'var(--primary)', fontWeight: 700 }}>GEN Z EDITION</span>
          </div>
        </div>
        <div className="card-body" style={{ paddingTop: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'center' }}>
            <div style={{ background: '#0F172A', borderRadius: 'var(--radius-md)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
                Dark Surface Vector Logo
              </div>
              <Logo size="lg" variant="dark" />
              <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                Geometric pocket flap monogram, dual-tone cyber ribbon, and neon sparkle.
              </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: 24, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
                Light Surface Vector Logo
              </div>
              <Logo size="lg" variant="light" />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Optimized for light modes, clean letterforms, and crisp gradient wordmark.
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #1E1338 0%, #0F172A 100%)', borderRadius: 'var(--radius-md)', padding: 20, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid rgba(168,85,247,0.3)' }}>
              <img
                src="/pocketwise-3d-logo.jpg"
                alt="Pocketwise 3D Gen Z Icon"
                style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'cover', boxShadow: '0 8px 24px rgba(121,104,239,0.35)' }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Pocketwise 3D Asset <span>✦</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                  Claymorphic iridescent wallet badge with floating coin & cyber aura.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ marginTop: 20, border: '1px solid rgba(231,121,131,0.3)' }}>
        <div className="card-header" style={{ paddingBottom: 16 }}>
          <div className="card-title" style={{ color: 'var(--red)' }}>Danger Zone</div>
        </div>
        <div className="card-body" style={{ paddingTop: 0, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Reset Demo Data</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Restore all financial data to the original demo state. Your account will be preserved.
            </div>
            <button id="reset-demo-btn" className="btn btn-danger" onClick={() => setShowResetConfirm(true)}>
              🔄 Reset Demo Data
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 220, borderLeft: '1px solid var(--border)', paddingLeft: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Sign Out</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              Sign out from your demo account. Your data will be preserved for next login.
            </div>
            <button id="settings-logout-btn" className="btn btn-secondary" onClick={handleLogout}>
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Demo Data?"
        description="This will reset all your transactions, savings goals, commitments, and settings to the original demo state. Your account credentials will not be affected."
        confirmLabel="Yes, Reset"
        variant="danger"
        icon="🔄"
      />
    </div>
  );
};

export default Settings;
