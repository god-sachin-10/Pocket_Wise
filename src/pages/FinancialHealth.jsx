import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { getHealthScoreLabel, getHealthScoreColor, getRiskColor } from '../utils/financeCalculations';
import FinancialHealthScore from '../components/FinancialHealthScore';

const MetricBar = ({ label, value, pct, color, note }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{value}</span>
        {note && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 6 }}>{note}</span>}
      </div>
    </div>
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: color, transition: 'width 0.8s ease' }} />
    </div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{pct.toFixed(0)}% of target</div>
  </div>
);

const FinancialHealth = () => {
  const { metrics } = useFinance();

  if (!metrics) return (
    <div className="loading-page"><div className="spinner dark" /><span>Calculating your financial health…</span></div>
  );

  const {
    healthScore, riskLevel, availableCash, startingBudget, flexibleBuffer,
    protectedSavings, totalSavingsTarget, emergencyReserve, spendingPaceRatio,
    projectedEndBalance, primaryGoal, dailyAllowance, daysRemaining, recordedExpenses,
  } = metrics;

  const label = getHealthScoreLabel(healthScore);
  const color = getHealthScoreColor(healthScore);
  const riskColor = getRiskColor(riskLevel);

  const spendingUtilization = ((startingBudget - availableCash) / startingBudget) * 100;
  const savingsRatio = totalSavingsTarget > 0 ? (protectedSavings / totalSavingsTarget) * 100 : 0;
  const emergencyRatio = (emergencyReserve / 1000) * 100;
  const bufferRatio = (flexibleBuffer / startingBudget) * 100;

  const recommendations = [];
  if (spendingPaceRatio > 1.1) {
    recommendations.push({ type: 'warning', text: 'Your spending pace is above target. Try to reduce optional purchases for the rest of the challenge.' });
  } else {
    recommendations.push({ type: 'success', text: 'Your spending is on track! Keep this pace to comfortably finish the month.' });
  }
  if (savingsRatio < 30) {
    recommendations.push({ type: 'warning', text: `Your savings target is achievable if you keep optional spending within the daily allowance of ${formatCurrency(dailyAllowance)}.` });
  } else {
    recommendations.push({ type: 'success', text: `Great savings progress! You're ${savingsRatio.toFixed(0)}% towards your goals.` });
  }
  if (flexibleBuffer < 1000) {
    recommendations.push({ type: 'info', text: `Your current plan leaves limited room (${formatCurrency(flexibleBuffer)}) for unexpected costs. Consider reducing subscriptions.` });
  }
  if (emergencyReserve < 500) {
    recommendations.push({ type: 'danger', text: 'Your emergency reserve is critically low. Prioritize rebuilding it before optional spending.' });
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Financial Health</h1>
          <p>An educational snapshot of your current money situation.</p>
        </div>
        <div style={{ background: 'var(--orange-bg)', color: 'var(--orange)', padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, border: '1px solid rgba(240,163,74,0.3)' }}>
          📊 Educational Demo — Not a credit score
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Health Ring */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 8 }}>
            <div className="card-title">Overall Health Score</div>
          </div>
          <div className="card-body" style={{ paddingTop: 8 }}>
            <FinancialHealthScore metrics={metrics} />
            <div style={{ marginTop: 20, padding: '14px 16px', background: `${color}15`, borderRadius: 10, border: `1px solid ${color}30` }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color, marginBottom: 4 }}>
                {label} Financial Health
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Risk Level: <strong style={{ color: riskColor }}>{riskLevel}</strong> ·
                Score: <strong style={{ color }}>{healthScore}/100</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div className="card-title">Score Breakdown</div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>How your score is calculated</span>
          </div>
          <div className="card-body" style={{ paddingTop: 0 }}>
            <MetricBar
              label="Spending Utilization"
              value={`${spendingUtilization.toFixed(0)}% used`}
              pct={spendingUtilization}
              color={spendingUtilization < 60 ? '#43B7A2' : spendingUtilization < 80 ? '#F0A34A' : '#E77983'}
              note={`${formatCurrency(recordedExpenses)} spent of ${formatCurrency(startingBudget)}`}
            />
            <MetricBar
              label="Savings Progress"
              value={`${savingsRatio.toFixed(0)}%`}
              pct={savingsRatio}
              color="#7968EF"
              note={`${formatCurrency(protectedSavings)} saved`}
            />
            <MetricBar
              label="Emergency Reserve"
              value={formatCurrency(emergencyReserve)}
              pct={emergencyRatio}
              color={emergencyRatio > 60 ? '#43B7A2' : '#F0A34A'}
              note="of ₹1,000 target"
            />
            <MetricBar
              label="Flexible Buffer"
              value={formatCurrency(flexibleBuffer)}
              pct={bufferRatio}
              color={flexibleBuffer > 1000 ? '#43B7A2' : flexibleBuffer > 300 ? '#F0A34A' : '#E77983'}
              note="after commitments"
            />
          </div>
        </div>
      </div>

      {/* Key Numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Daily Allowance', value: formatCurrency(dailyAllowance), sub: `${daysRemaining} days left`, color: 'var(--primary)' },
          { label: 'Projected End Balance', value: formatCurrency(projectedEndBalance), sub: 'If spending continues', color: projectedEndBalance > 0 ? 'var(--mint)' : 'var(--red)' },
          { label: 'Spending Pace', value: `${(spendingPaceRatio * 100).toFixed(0)}%`, sub: spendingPaceRatio > 1 ? 'Above budget' : 'Within budget', color: spendingPaceRatio > 1.1 ? 'var(--red)' : 'var(--mint)' },
          { label: 'Commitment Coverage', value: `${metrics.unpaidReserved > 0 ? ((availableCash / metrics.unpaidReserved) * 100).toFixed(0) : '∞'}%`, sub: 'Cash vs obligations', color: 'var(--orange)' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ padding: 20 }}>
            <div className="stat-card-label">{c.label}</div>
            <div className="stat-card-value" style={{ fontSize: '1.375rem', color: c.color }}>{c.value}</div>
            <div className="stat-card-meta">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="card">
        <div className="card-header" style={{ paddingBottom: 8 }}>
          <div className="card-title">Personalized Recommendations</div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Based on your current financial data</span>
        </div>
        <div className="insights-list">
          {recommendations.map((r, i) => (
            <div key={i} className={`insight-item ${r.type}`}>
              <span>{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 20, padding: 16, background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
        ⚠️ <strong>Educational Demo Only</strong> — The financial health score shown here is an illustrative model for this hackathon prototype. It is based solely on the demo data in your browser and does not constitute professional financial advice, a credit assessment, or any real financial evaluation. Always consult a qualified financial advisor for actual financial decisions.
      </div>
    </div>
  );
};

export default FinancialHealth;
