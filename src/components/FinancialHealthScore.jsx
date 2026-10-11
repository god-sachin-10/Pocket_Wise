import React from 'react';
import { getHealthScoreLabel, getHealthScoreColor, getRiskColor } from '../utils/financeCalculations';
import { formatCurrency } from '../utils/currencyFormatter';

const FinancialHealthScore = ({ metrics, compact = false }) => {
  if (!metrics) return null;

  const { healthScore, riskLevel, availableCash, startingBudget, flexibleBuffer, protectedSavings,
    totalSavingsTarget, emergencyReserve, spendingPaceRatio, projectedEndBalance } = metrics;

  const label = getHealthScoreLabel(healthScore);
  const color = getHealthScoreColor(healthScore);
  const circumference = 2 * Math.PI * 65;
  const offset = circumference - (healthScore / 100) * circumference;

  const spendPct = Math.min((availableCash / startingBudget) * 100, 100);
  const savePct = totalSavingsTarget > 0 ? Math.min((protectedSavings / totalSavingsTarget) * 100, 100) : 0;
  const reservePct = Math.min((emergencyReserve / 1000) * 100, 100);

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: compact ? 'nowrap' : 'wrap', alignItems: 'center' }}>
      {/* Ring */}
      <div className="health-score-circle" style={{ flexShrink: 0 }}>
        <svg width="160" height="160" className="score-ring">
          <circle className="score-track" cx="80" cy="80" r="65" />
          <circle
            className="score-fill"
            cx="80" cy="80" r="65"
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="score-label">
          <div className="score-number" style={{ color }}>{healthScore}</div>
          <div className="score-text" style={{ color }}>{label}</div>
        </div>
      </div>

      {/* Metrics */}
      {!compact && (
        <div className="health-metrics" style={{ flex: 1 }}>
          <div className="health-metric-item">
            <div className="health-metric-label">Budget Remaining</div>
            <div className="health-metric-bar">
              <div className="health-metric-fill" style={{ width: `${spendPct}%`, background: spendPct > 40 ? '#43B7A2' : '#E77983' }} />
            </div>
            <div className="health-metric-value">{spendPct.toFixed(0)}%</div>
          </div>
          <div className="health-metric-item">
            <div className="health-metric-label">Savings Progress</div>
            <div className="health-metric-bar">
              <div className="health-metric-fill" style={{ width: `${savePct}%`, background: '#7968EF' }} />
            </div>
            <div className="health-metric-value">{savePct.toFixed(0)}%</div>
          </div>
          <div className="health-metric-item">
            <div className="health-metric-label">Emergency Reserve</div>
            <div className="health-metric-bar">
              <div className="health-metric-fill" style={{ width: `${reservePct}%`, background: '#F0A34A' }} />
            </div>
            <div className="health-metric-value">{formatCurrency(emergencyReserve)}</div>
          </div>
          <div className="health-metric-item">
            <div className="health-metric-label">Flexible Buffer</div>
            <div className="health-metric-bar">
              <div className="health-metric-fill" style={{ width: `${Math.min((flexibleBuffer / startingBudget) * 100, 100)}%`, background: flexibleBuffer > 1000 ? '#43B7A2' : '#F0A34A' }} />
            </div>
            <div className="health-metric-value">{formatCurrency(flexibleBuffer)}</div>
          </div>
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Risk Level</span>
              <span style={{ fontWeight: 700, color: getRiskColor(riskLevel) }}>{riskLevel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialHealthScore;
