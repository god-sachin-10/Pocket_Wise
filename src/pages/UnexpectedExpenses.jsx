import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { calculateFinancials, CATEGORIES } from '../utils/financeCalculations';
import { ConfirmDialog } from '../components/Modal';

const PRESETS = [
  { name: 'Laptop Repair', amount: 2500, category: 'Tech', description: 'Screen cracked' },
  { name: 'Medical Expense', amount: 1500, category: 'Health', description: 'Clinic visit + medicines' },
  { name: 'Emergency Travel', amount: 3000, category: 'Transport', description: 'Last-minute bus/flight' },
  { name: 'College Expense', amount: 1200, category: 'Education', description: 'Exam fees or supplies' },
  { name: 'Home Repair', amount: 1800, category: 'Bills', description: 'Plumbing or electrical fix' },
];

const UnexpectedExpenses = () => {
  const { metrics, financeData, simulateTransaction, applyUnexpectedExpense, addToast } = useFinance();
  const [form, setForm] = useState({ name: '', amount: '', category: 'Emergency', description: '' });
  const [simResult, setSimResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSimResult(null);
  };

  const handlePreset = (p) => {
    setForm({ name: p.name, amount: p.amount, category: p.category, description: p.description });
    setSimResult(null);
  };

  const handleSimulate = () => {
    if (!form.amount || Number(form.amount) <= 0) {
      addToast('Enter a valid amount to simulate', 'error');
      return;
    }
    const result = simulateTransaction({
      name: form.name || 'Unexpected Expense',
      category: form.category,
      amount: Number(form.amount),
      type: 'expense',
    });
    setSimResult(result);
  };

  const handleApply = () => {
    setShowConfirm(false);
    applyUnexpectedExpense({
      name: form.name || 'Unexpected Expense',
      category: form.category,
      amount: Number(form.amount),
      description: form.description,
    });
    setForm({ name: '', amount: '', category: 'Emergency', description: '' });
    setSimResult(null);
  };

  if (!metrics) return null;

  const amount = Number(form.amount) || 0;
  const canAfford = amount <= (metrics?.availableCash || 0);
  const shortfall = amount - (metrics?.availableCash || 0);

  const getSimRisk = () => {
    if (!simResult?.simRisk) return null;
    if (simResult.simRisk.availableCash < 0 || simResult.simRisk.riskLevel === 'High') return 'red';
    if (simResult.simRisk.flexibleBuffer < 500) return 'amber';
    return 'green';
  };
  const risk = simResult ? getSimRisk() : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>What if life happens?</h1>
          <p>Simulate unexpected expenses and see how they affect your finances.</p>
        </div>
      </div>

      {/* Current State Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Available Cash', value: formatCurrency(metrics.availableCash), color: 'var(--primary)', sub: 'Current balance' },
          { label: 'Emergency Reserve', value: formatCurrency(metrics.emergencyReserve), color: 'var(--mint)', sub: 'Protected buffer' },
          { label: 'Daily Allowance', value: formatCurrency(metrics.dailyAllowance), color: 'var(--orange)', sub: 'Per remaining day' },
          { label: 'Flexible Buffer', value: formatCurrency(metrics.flexibleBuffer), color: metrics.flexibleBuffer > 500 ? 'var(--mint)' : 'var(--red)', sub: 'After commitments' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ padding: 20 }}>
            <div className="stat-card-label">{c.label}</div>
            <div className="stat-card-value" style={{ fontSize: '1.375rem', color: c.color }}>{c.value}</div>
            <div className="stat-card-meta">{c.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Input */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div>
              <div className="card-title">
                <Zap size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--orange)' }} />
                Simulate an Expense
              </div>
              <div className="card-subtitle">Test how an emergency would affect your finances</div>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            {/* Presets */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Quick Presets</div>
              <div className="sim-presets">
                {PRESETS.map(p => (
                  <button key={p.name} className="sim-preset-btn" onClick={() => handlePreset(p)}>
                    {p.name} — {formatCurrency(p.amount)}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ue-name">Expense Name</label>
              <input id="ue-name" name="name" className="form-input" placeholder="e.g. Laptop Repair" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ue-amount">
                Amount — <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(amount)}</span>
              </label>
              <input id="ue-amount" name="amount" type="number" className="form-input" placeholder="0" value={form.amount} onChange={handleChange} />
              <input
                type="range" className="range-input" min="100" max="10000" step="100"
                value={form.amount || 0}
                onChange={e => { setForm(prev => ({ ...prev, amount: e.target.value })); setSimResult(null); }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>₹100</span><span>₹10,000</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ue-category">Category</label>
              <select id="ue-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ue-desc">Notes</label>
              <input id="ue-desc" name="description" className="form-input" placeholder="What happened?" value={form.description} onChange={handleChange} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button id="simulate-expense-btn" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSimulate} disabled={!form.amount || amount <= 0}>
                <Zap size={15} /> Simulate Expense
              </button>
              <button className="btn btn-secondary" onClick={() => { setSimResult(null); setForm({ name: '', amount: '', category: 'Emergency', description: '' }); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {simResult ? (
            <div className="card">
              <div className="card-header" style={{ paddingBottom: 12 }}>
                <div className="card-title">Impact Analysis</div>
                {risk && (
                  <div className={`sim-risk-badge ${risk}`}>
                    {risk === 'green' ? <CheckCircle size={14} /> : risk === 'amber' ? <AlertTriangle size={14} /> : <XCircle size={14} />}
                    {risk === 'green' ? 'Manageable' : risk === 'amber' ? 'Tough but Possible' : 'Shortfall Warning'}
                  </div>
                )}
              </div>
              <div className="card-body" style={{ paddingTop: 0 }}>
                {/* Before/After */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg)', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 10 }}>Before</div>
                    {[
                      ['Cash', formatCurrency(metrics.availableCash)],
                      ['Reserve', formatCurrency(metrics.emergencyReserve)],
                      ['Buffer', formatCurrency(metrics.flexibleBuffer)],
                      ['Daily', formatCurrency(metrics.dailyAllowance)],
                      ['Health', `${metrics.healthScore}/100`],
                      ['Risk', metrics.riskLevel],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                        <span style={{ fontWeight: 700 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: risk === 'red' ? 'var(--red-bg)' : risk === 'amber' ? 'var(--orange-bg)' : 'var(--mint-bg)', borderRadius: 10, padding: 14, border: `1px solid ${risk === 'red' ? 'rgba(231,121,131,0.3)' : risk === 'amber' ? 'rgba(240,163,74,0.3)' : 'rgba(67,183,162,0.3)'}` }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 10 }}>After</div>
                    {simResult.simRisk && [
                      ['Cash', formatCurrency(simResult.simRisk.availableCash), simResult.simRisk.availableCash < 0 ? 'negative' : ''],
                      ['Reserve', formatCurrency(Math.max(metrics.emergencyReserve - amount, 0)), metrics.emergencyReserve - amount < 0 ? 'negative' : ''],
                      ['Buffer', formatCurrency(simResult.simRisk.flexibleBuffer), simResult.simRisk.flexibleBuffer < 300 ? 'negative' : ''],
                      ['Daily', formatCurrency(simResult.simRisk.dailyAllowance), simResult.simRisk.dailyAllowance < 100 ? 'negative' : ''],
                      ['Health', `${simResult.simRisk.healthScore}/100`, simResult.simRisk.healthScore < metrics.healthScore ? 'negative' : ''],
                      ['Risk', simResult.simRisk.riskLevel, simResult.simRisk.riskLevel === 'High' ? 'negative' : ''],
                    ].map(([k, v, cls]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                        <span style={{ fontWeight: 700, color: cls === 'negative' ? 'var(--red)' : 'inherit' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shortfall Warning */}
                {!canAfford && (
                  <div className="insight-item danger" style={{ marginBottom: 16 }}>
                    <AlertTriangle size={15} className="insight-icon" />
                    <span>
                      <strong>Shortfall of {formatCurrency(shortfall)}</strong> — You don't have enough to cover this expense.
                      Your available cash is only {formatCurrency(metrics.availableCash)}.
                    </span>
                  </div>
                )}

                <button
                  id="apply-expense-btn"
                  className="btn btn-danger btn-full"
                  onClick={() => setShowConfirm(true)}
                  disabled={!canAfford}
                >
                  Apply This Expense
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
                <h3 style={{ marginBottom: 8, color: 'var(--text-primary)' }}>Your financial safety net</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: 260 }}>
                  Fill in the expense details and click "Simulate Expense" to see the impact before applying.
                </p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header" style={{ paddingBottom: 8 }}>
              <div className="card-title">💡 Financial Tips</div>
            </div>
            <div className="insights-list">
              <div className="insight-item info">
                <span>Your emergency reserve of {formatCurrency(metrics.emergencyReserve)} is your first line of defense. Applying an expense reduces it.</span>
              </div>
              {metrics.emergencyReserve < 500 && (
                <div className="insight-item warning">
                  <AlertTriangle size={14} className="insight-icon" />
                  <span>Your emergency reserve is running low. Consider building it up before optional spending.</span>
                </div>
              )}
              {metrics.flexibleBuffer > 1000 && (
                <div className="insight-item success">
                  <CheckCircle size={14} className="insight-icon" />
                  <span>You have a healthy flexible buffer of {formatCurrency(metrics.flexibleBuffer)} to handle most small emergencies.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleApply}
        title="Apply Unexpected Expense?"
        description={`This will deduct ${formatCurrency(Number(form.amount))} from your balance and reduce your emergency reserve. This action cannot be undone easily.`}
        confirmLabel="Apply Expense"
        variant="danger"
        icon="⚡"
      />
    </div>
  );
};

export default UnexpectedExpenses;
