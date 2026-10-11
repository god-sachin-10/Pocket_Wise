import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingDown, TrendingUp, Clock, Plus, ChevronRight, Lightbulb, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { getHealthScoreColor, getHealthScoreLabel } from '../utils/financeCalculations';
import BalanceForecast from '../components/BalanceForecast';
import SpendingBreakdown from '../components/SpendingBreakdown';
import TransactionList from '../components/TransactionList';
import MoneyMoveSimulator from '../components/MoneyMoveSimulator';
import FinancialHealthScore from '../components/FinancialHealthScore';

const StatCard = ({ icon, label, value, meta, metaColor, bgColor, iconBg }) => (
  <div className="stat-card">
    <div className="stat-card-icon" style={{ background: iconBg || 'var(--primary-bg)' }}>
      {icon}
    </div>
    <div className="stat-card-label">{label}</div>
    <div className="stat-card-value">{value}</div>
    {meta && <div className="stat-card-meta" style={{ color: metaColor }}>{meta}</div>}
  </div>
);

const generateInsights = (metrics) => {
  if (!metrics) return [];
  const insights = [];
  const { flexibleBuffer, commitments, dailyAllowance, primarySavedAmount, primaryTargetAmount,
    primaryGoal, emergencyReserve, riskLevel, healthScore, spendingPaceRatio } = metrics;

  if (flexibleBuffer < 1000 && flexibleBuffer > 0) {
    insights.push({ type: 'warning', icon: <AlertCircle size={15} />, text: `Your planned commitments leave only ${formatCurrency(flexibleBuffer)} for flexible spending. Be careful with optional purchases.` });
  }
  if (primaryGoal && primarySavedAmount < primaryTargetAmount * 0.3) {
    insights.push({ type: 'info', icon: <Info size={15} />, text: `Your savings target "${primaryGoal?.name}" is achievable if you keep optional spending within the suggested daily allowance of ${formatCurrency(dailyAllowance)}.` });
  }
  if (emergencyReserve < 500) {
    insights.push({ type: 'danger', icon: <AlertCircle size={15} />, text: `Your emergency reserve is low at ${formatCurrency(emergencyReserve)}. Consider building it back up before optional spending.` });
  }
  if (spendingPaceRatio > 1.2) {
    insights.push({ type: 'warning', icon: <AlertCircle size={15} />, text: 'You\'re spending faster than your budget allows. Reduce optional purchases to stay on track.' });
  }
  if (healthScore >= 75) {
    insights.push({ type: 'success', icon: <CheckCircle size={15} />, text: 'Your spending is well on track. Keep going and you\'ll finish the month with a comfortable buffer!' });
  }
  if (dailyAllowance < 100) {
    insights.push({ type: 'warning', icon: <AlertCircle size={15} />, text: `Your daily allowance has dropped to ${formatCurrency(dailyAllowance)}. Try to avoid unnecessary expenses for the next few days.` });
  }
  return insights.slice(0, 4);
};

const Overview = () => {
  const { metrics, financeData } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!metrics || !financeData) {
    return (
      <div className="loading-page">
        <div className="spinner dark" style={{ width: 32, height: 32 }} />
        <span>Loading your dashboard…</span>
      </div>
    );
  }

  const { settings } = financeData;
  const insights = generateInsights(metrics);
  const recentTxns = financeData.transactions?.filter(t =>
    !selectedCategory || t.category === selectedCategory
  ).slice(0, 5) || [];

  return (
    <div>
      {/* Challenge Banner */}
      <div className="challenge-banner">
        <div className="challenge-info">
          <h2 className="challenge-heading">Your money, your moves.</h2>
          <p className="challenge-sub">Make ₹10,000 go further. One smart decision at a time.</p>
        </div>
        <div className="challenge-progress">
          <div className="challenge-stat">
            <div className="challenge-stat-value">{settings?.daysRemaining || 30}</div>
            <div className="challenge-stat-label">Days Left</div>
          </div>
          <div className="challenge-divider" />
          <div className="challenge-stat">
            <div className="challenge-stat-value">{settings?.daysPassed || 0}</div>
            <div className="challenge-stat-label">Days Passed</div>
          </div>
          <div className="challenge-divider" />
          <div className="challenge-stat">
            <div className="challenge-stat-value">{formatCurrency(settings?.startingBudget || 10000, { compact: true })}</div>
            <div className="challenge-stat-label">Total Budget</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          icon={<Wallet size={22} color="#7968EF" />}
          iconBg="var(--primary-bg)"
          label="Available Balance"
          value={formatCurrency(metrics.availableCash)}
          meta={`${((metrics.availableCash / metrics.startingBudget) * 100).toFixed(0)}% of budget remaining`}
          metaColor="var(--text-secondary)"
        />
        <StatCard
          icon={<Clock size={22} color="#F0A34A" />}
          iconBg="var(--orange-bg)"
          label="Daily Allowance"
          value={formatCurrency(metrics.dailyAllowance)}
          meta={`For ${metrics.daysRemaining} remaining days`}
          metaColor="var(--text-secondary)"
        />
        <StatCard
          icon={<TrendingUp size={22} color="#43B7A2" />}
          iconBg="var(--mint-bg)"
          label="Savings Progress"
          value={formatCurrency(metrics.primarySavedAmount)}
          meta={`${metrics.savingsProgress.toFixed(0)}% of ₹${metrics.primaryTargetAmount} goal`}
          metaColor="var(--mint)"
        />
        <StatCard
          icon={<span style={{ fontSize: 22 }}>❤️</span>}
          iconBg="#FDE8EA"
          label="Financial Health"
          value={`${metrics.healthScore}/100`}
          meta={`${getHealthScoreLabel(metrics.healthScore)} · ${metrics.riskLevel} Risk`}
          metaColor={getHealthScoreColor(metrics.healthScore)}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Forecast */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 16 }}>
            <div>
              <div className="card-title">Balance Forecast</div>
              <div className="card-subtitle">Projected balance over remaining challenge days</div>
            </div>
          </div>
          <div className="chart-wrapper">
            <BalanceForecast forecastData={metrics.forecastData} />
          </div>
          <div style={{ display: 'flex', gap: 16, padding: '0 24px 20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 12, height: 3, background: '#7968EF', borderRadius: 2 }} /> Balance curve
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ width: 10, height: 10, background: '#F0A34A', borderRadius: '50%' }} /> Commitment due
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <span>📊 Future values are estimates</span>
            </div>
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 8 }}>
            <div>
              <div className="card-title">Spending Breakdown</div>
              <div className="card-subtitle">By category</div>
            </div>
            {selectedCategory && (
              <button className="btn btn-sm btn-ghost" onClick={() => setSelectedCategory(null)}>
                Clear filter
              </button>
            )}
          </div>
          <SpendingBreakdown
            categoryBreakdown={metrics.categoryBreakdown}
            onCategorySelect={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header" style={{ paddingBottom: 0 }}>
            <div>
              <div className="card-title">Recent Transactions</div>
              {selectedCategory && (
                <div className="card-subtitle">Filtered: {selectedCategory}</div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/transactions" className="btn btn-sm btn-ghost" style={{ textDecoration: 'none' }}>
                View all <ChevronRight size={14} />
              </Link>
              <Link to="/transactions" className="btn btn-sm btn-primary" style={{ textDecoration: 'none' }}>
                <Plus size={14} /> Add
              </Link>
            </div>
          </div>
          <TransactionList transactions={recentTxns} />
        </div>

        {/* Insights + Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header" style={{ paddingBottom: 4 }}>
              <div className="card-title">
                <Lightbulb size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--orange)' }} />
                Insights
              </div>
            </div>
            <div className="insights-list">
              {insights.length > 0 ? insights.map((insight, i) => (
                <div key={i} className={`insight-item ${insight.type}`}>
                  <span className="insight-icon">{insight.icon}</span>
                  <span>{insight.text}</span>
                </div>
              )) : (
                <div className="insight-item success">
                  <CheckCircle size={15} className="insight-icon" />
                  <span>Everything looks great! Keep up the good financial habits.</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ paddingBottom: 8 }}>
              <div className="card-title">Financial Health</div>
              <Link to="/health" className="btn btn-sm btn-ghost" style={{ textDecoration: 'none' }}>Details</Link>
            </div>
            <div style={{ padding: '8px 24px 24px' }}>
              <FinancialHealthScore metrics={metrics} compact={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Simulator */}
      <div style={{ marginTop: 24 }}>
        <MoneyMoveSimulator />
      </div>
    </div>
  );
};

export default Overview;
