import React, { useState, useMemo } from 'react';
import { Zap, TrendingDown, TrendingUp, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { CATEGORIES } from '../utils/financeCalculations';

const PRESETS = [
  { name: 'Sneakers', amount: 1500, category: 'Shopping' },
  { name: 'Concert Ticket', amount: 1200, category: 'Entertainment' },
  { name: 'Online Course', amount: 999, category: 'Education' },
  { name: 'Eating Out', amount: 450, category: 'Food' },
  { name: 'Headphones', amount: 2500, category: 'Shopping' },
];

const MoneyMoveSimulator = () => {
  const { metrics, simulateTransaction, confirmSimulatedPurchase, financeData } = useFinance();
  const [form, setForm] = useState({
    name: '', amount: '', category: 'Shopping', isEssential: false, note: ''
  });
  const [simResult, setSimResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setSimResult(null);
  };

  const handlePreset = (preset) => {
    setForm(prev => ({ ...prev, name: preset.name, amount: preset.amount, category: preset.category }));
    setSimResult(null);
  };

  const handleSimulate = () => {
    if (!form.amount || Number(form.amount) <= 0) return;
    const result = simulateTransaction({
      name: form.name || form.category,
      category: form.category,
      amount: Number(form.amount),
      type: 'expense',
      isEssential: form.isEssential,
    });
    setSimResult(result);
  };

  const handleConfirm = () => {
    if (!simResult) return;
    const available = metrics?.availableCash || 0;
    if (Number(form.amount) > available) return;
    confirmSimulatedPurchase({
      name: form.name || form.category,
      category: form.category,
      amount: Number(form.amount),
      type: 'expense',
      isEssential: form.isEssential,
      description: form.note,
    });
    setSimResult(null);
    setForm({ name: '', amount: '', category: 'Shopping', isEssential: false, note: '' });
  };

  const handleReset = () => {
    setSimResult(null);
    setForm({ name: '', amount: '', category: 'Shopping', isEssential: false, note: '' });
  };

  if (!metrics) return null;

  // Risk classification for simulated purchase
  const getRisk = () => {
    if (!simResult?.simRisk) return null;
    const { simRisk } = simResult;
    if (simRisk.flexibleBuffer > 500 && simRisk.riskLevel !== 'High') return 'green';
    if (simRisk.availableCash > 0 && simRisk.riskLevel !== 'High') return 'amber';
    return 'red';
  };
  const risk = simResult ? getRisk() : null;

  const riskLabels = {
    green: { label: 'Looks Good!', icon: <CheckCircle size={15} />, text: 'This purchase fits within your flexible spending buffer.' },
    amber: { label: 'Think Twice', icon: <AlertTriangle size={15} />, text: 'You can afford this, but it will reduce your safety margin.' },
    red: { label: 'Too Risky!', icon: <XCircle size={15} />, text: 'This exceeds your available funds or threatens your commitments.' },
  };

  const canAfford = simResult && Number(form.amount) <= (metrics?.availableCash || 0);

  return (
    <div className="simulator-section">
      <div className="simulator-header">
        <h2 className="simulator-title">
          <span style={{ marginRight: 8 }}>🧠</span>
          Before you spend, simulate the decision.
        </h2>
        <p className="simulator-subtitle">See the impact before your money moves.</p>
      </div>

      <div className="simulator-grid">
        {/* Input Section */}
        <div className="sim-input-section">
          <div className="sim-presets">
            {PRESETS.map(p => (
              <button
                key={p.name}
                className="sim-preset-btn"
                onClick={() => handlePreset(p)}
              >
                {p.name} — {formatCurrency(p.amount)}
              </button>
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="sim-name">Purchase Name</label>
              <input
                id="sim-name"
                name="name"
                className="form-input"
                placeholder="e.g. New Sneakers"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sim-category">Category</label>
              <select id="sim-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sim-amount">Amount <span style={{ color: 'var(--primary)', fontWeight: 700 }}>₹{form.amount || '0'}</span></label>
            <input
              id="sim-amount"
              name="amount"
              type="number"
              className="form-input"
              placeholder="0"
              min="1"
              value={form.amount}
              onChange={handleChange}
            />
            <input
              type="range"
              className="range-input"
              min="100"
              max="5000"
              step="50"
              value={form.amount || 0}
              onChange={(e) => { setForm(prev => ({ ...prev, amount: e.target.value })); setSimResult(null); }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>₹100</span><span>₹5,000</span>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="isEssential" checked={form.isEssential} onChange={handleChange} />
              Mark as essential expense
            </label>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sim-note">Note (optional)</label>
            <input
              id="sim-note"
              name="note"
              className="form-input"
              placeholder="Why are you making this purchase?"
              value={form.note}
              onChange={handleChange}
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            onClick={handleSimulate}
            disabled={!form.amount || Number(form.amount) <= 0}
          >
            <Zap size={16} />
            Simulate This Purchase
          </button>
        </div>

        {/* Results Section */}
        <div className="sim-results-section">
          {risk && riskLabels[risk] && (
            <div className={`sim-risk-badge ${risk}`} style={{ marginBottom: 16 }}>
              {riskLabels[risk].icon}
              {riskLabels[risk].label} — {riskLabels[risk].text}
            </div>
          )}

          <div className="sim-comparison">
            <div className="sim-col before">
              <div className="sim-col-title">Before</div>
              <div className="sim-metric">
                <span className="sim-metric-label">Available Cash</span>
                <span className="sim-metric-value">{formatCurrency(metrics.availableCash)}</span>
              </div>
              <div className="sim-metric">
                <span className="sim-metric-label">Daily Allowance</span>
                <span className="sim-metric-value">{formatCurrency(metrics.dailyAllowance)}</span>
              </div>
              <div className="sim-metric">
                <span className="sim-metric-label">Flexible Buffer</span>
                <span className="sim-metric-value">{formatCurrency(metrics.flexibleBuffer)}</span>
              </div>
              <div className="sim-metric">
                <span className="sim-metric-label">Savings</span>
                <span className="sim-metric-value">{formatCurrency(metrics.primarySavedAmount)}</span>
              </div>
              <div className="sim-metric">
                <span className="sim-metric-label">Health Score</span>
                <span className="sim-metric-value">{metrics.healthScore}/100</span>
              </div>
              <div className="sim-metric">
                <span className="sim-metric-label">Risk Level</span>
                <span className="sim-metric-value">{metrics.riskLevel}</span>
              </div>
            </div>

            <div className={`sim-col after ${risk || ''}`}>
              <div className="sim-col-title">After Purchase</div>
              {simResult?.simRisk ? (
                <>
                  <div className="sim-metric">
                    <span className="sim-metric-label">Available Cash</span>
                    <span className={`sim-metric-value ${simResult.simRisk.availableCash < metrics.availableCash ? 'negative' : 'positive'}`}>
                      {formatCurrency(simResult.simRisk.availableCash)}
                    </span>
                  </div>
                  <div className="sim-metric">
                    <span className="sim-metric-label">Daily Allowance</span>
                    <span className={`sim-metric-value ${simResult.simRisk.dailyAllowance < metrics.dailyAllowance ? 'negative' : 'positive'}`}>
                      {formatCurrency(simResult.simRisk.dailyAllowance)}
                    </span>
                  </div>
                  <div className="sim-metric">
                    <span className="sim-metric-label">Flexible Buffer</span>
                    <span className={`sim-metric-value ${simResult.simRisk.flexibleBuffer < metrics.flexibleBuffer ? 'negative' : 'positive'}`}>
                      {formatCurrency(simResult.simRisk.flexibleBuffer)}
                    </span>
                  </div>
                  <div className="sim-metric">
                    <span className="sim-metric-label">Savings</span>
                    <span className="sim-metric-value">{formatCurrency(metrics.primarySavedAmount)}</span>
                  </div>
                  <div className="sim-metric">
                    <span className="sim-metric-label">Health Score</span>
                    <span className={`sim-metric-value ${simResult.simRisk.healthScore < metrics.healthScore ? 'negative' : 'positive'}`}>
                      {simResult.simRisk.healthScore}/100
                    </span>
                  </div>
                  <div className="sim-metric">
                    <span className="sim-metric-label">Risk Level</span>
                    <span className={`sim-metric-value ${simResult.simRisk.riskLevel === 'High' ? 'negative' : simResult.simRisk.riskLevel === 'Moderate' ? '' : 'positive'}`}>
                      {simResult.simRisk.riskLevel}
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Enter an amount and click<br />"Simulate This Purchase"
                </div>
              )}
            </div>
          </div>

          {simResult && (
            <div className="sim-actions">
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleReset}>
                Keep Thinking
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleConfirm}
                disabled={!canAfford || risk === 'red'}
                title={!canAfford ? 'Insufficient funds' : risk === 'red' ? 'Too risky to confirm' : ''}
              >
                <CheckCircle size={15} />
                Confirm Purchase
              </button>
            </div>
          )}
          {simResult && !canAfford && (
            <div className="insight-item danger" style={{ marginTop: 12 }}>
              <AlertTriangle size={15} className="insight-icon" />
              <span>Insufficient funds. This purchase exceeds your available cash of {formatCurrency(metrics.availableCash)}.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoneyMoveSimulator;
