/**
 * Pocketwise — Centralized Financial Calculation Engine
 *
 * LEDGER MODEL:
 *  availableCash     = startingBudget + additionalIncome − recordedExpenses
 *  protectedSavings  = sum of savedAmounts across all goals
 *  unpaidReserved    = sum of unpaid, active commitment amounts
 *  flexibleBuffer    = availableCash − protectedSavings − unpaidReserved − emergencyReserve
 *  dailyAllowance    = flexibleBuffer / daysRemaining
 */

// ─── Category Metadata ────────────────────────────────────────────────────────

export const CATEGORIES = [
  { name: 'Food', icon: '🍔', color: '#F0A34A' },
  { name: 'Transport', icon: '🚌', color: '#7968EF' },
  { name: 'Bills', icon: '📄', color: '#E77983' },
  { name: 'Shopping', icon: '🛍️', color: '#43B7A2' },
  { name: 'Entertainment', icon: '🎮', color: '#9B59B6' },
  { name: 'Health', icon: '💊', color: '#2ECC71' },
  { name: 'Education', icon: '📚', color: '#3498DB' },
  { name: 'Personal', icon: '👤', color: '#E67E22' },
  { name: 'Other', icon: '💼', color: '#95A5A6' },
  { name: 'Emergency', icon: '🚨', color: '#E74C3C' },
  { name: 'Tech', icon: '💻', color: '#1ABC9C' },
];

export const getCategoryMeta = (name) =>
  CATEGORIES.find(c => c.name === name) || { name, icon: '💰', color: '#9292A5' };

// ─── Core Calculations ────────────────────────────────────────────────────────

/**
 * Calculate core financial metrics from raw data.
 * @param {Object} data - The full finance data object
 * @param {Object} [simTransaction=null] - Hypothetical transaction to test (not applied)
 * @returns {Object} All derived financial metrics
 */
export const calculateFinancials = (data, simTransaction = null) => {
  if (!data) return getEmptyMetrics();

  const { settings = {}, transactions = [], savingsGoals = [], commitments = [] } = data;

  const {
    startingBudget = 10000,
    daysRemaining = 1,
    emergencyReserve = 1000,
  } = settings;

  // --- Cash flows from transactions ---
  const recordedIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const recordedExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // --- Available Cash ---
  let availableCash = startingBudget + recordedIncome - recordedExpenses;

  // Apply simulation if provided
  const simAmount = simTransaction ? (simTransaction.amount || 0) : 0;
  const simAvailableCash = simTransaction
    ? availableCash - (simTransaction.type === 'expense' ? simAmount : -simAmount)
    : null;

  // --- Protected Savings ---
  const protectedSavings = savingsGoals.reduce((sum, g) => sum + (g.savedAmount || 0), 0);
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const primaryGoal = savingsGoals[0] || null;

  // --- Unpaid Commitments ---
  const unpaidCommitments = commitments.filter(c => !c.isPaid && c.status === 'active');
  const unpaidReserved = unpaidCommitments.reduce((sum, c) => sum + (c.amount || 0), 0);

  // --- Flexible Buffer ---
  const safeEmergencyReserve = Math.min(emergencyReserve, availableCash);
  const flexibleBuffer = Math.max(
    availableCash - protectedSavings - unpaidReserved - safeEmergencyReserve,
    0
  );

  // --- Daily Allowance ---
  const safeDaysRemaining = Math.max(daysRemaining, 1);
  const dailyAllowance = flexibleBuffer / safeDaysRemaining;

  // --- Simulated metrics ---
  let simFlexibleBuffer = null;
  let simDailyAllowance = null;
  if (simAvailableCash !== null) {
    simFlexibleBuffer = Math.max(
      simAvailableCash - protectedSavings - unpaidReserved - safeEmergencyReserve,
      0
    );
    simDailyAllowance = simFlexibleBuffer / safeDaysRemaining;
  }

  // --- Spending by Category ---
  const categoryBreakdown = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      const cat = t.category || 'Other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (t.amount || 0);
    });

  // --- Projected Ending Balance ---
  const projectedEndingBalance = availableCash - (dailyAllowance * safeDaysRemaining);
  // A simpler projection: ending = flexible buffer after planned spend
  const projectedEndBalance = Math.max(
    availableCash - protectedSavings - unpaidReserved, 0
  );

  // --- Savings Progress ---
  const primarySavedAmount = primaryGoal?.savedAmount || 0;
  const primaryTargetAmount = primaryGoal?.targetAmount || 2500;
  const savingsProgress = Math.min((primarySavedAmount / Math.max(primaryTargetAmount, 1)) * 100, 100);

  // --- Spending Pace ---
  const daysPassed = Math.max((settings.challengeDays || 30) - daysRemaining, 0);
  const expectedSpendRate = startingBudget / (settings.challengeDays || 30);
  const actualSpendRate = daysPassed > 0 ? recordedExpenses / daysPassed : 0;
  const spendingPaceRatio = actualSpendRate / Math.max(expectedSpendRate, 1);

  // --- Financial Health Score (0–100) ---
  const healthScore = calculateHealthScore({
    availableCash,
    startingBudget,
    flexibleBuffer,
    protectedSavings,
    totalSavingsTarget,
    unpaidReserved,
    emergencyReserve: safeEmergencyReserve,
    spendingPaceRatio,
    daysRemaining,
    projectedEndBalance,
  });

  // --- Risk Level ---
  const riskLevel = calculateRiskLevel(healthScore, flexibleBuffer, availableCash);

  // --- Simulator risk ---
  let simRisk = null;
  if (simAvailableCash !== null) {
    const simHealth = calculateHealthScore({
      availableCash: simAvailableCash,
      startingBudget,
      flexibleBuffer: simFlexibleBuffer,
      protectedSavings,
      totalSavingsTarget,
      unpaidReserved,
      emergencyReserve: safeEmergencyReserve,
      spendingPaceRatio,
      daysRemaining,
      projectedEndBalance: Math.max(simAvailableCash - protectedSavings - unpaidReserved, 0),
    });
    simRisk = {
      healthScore: simHealth,
      riskLevel: calculateRiskLevel(simHealth, simFlexibleBuffer, simAvailableCash),
      availableCash: simAvailableCash,
      flexibleBuffer: simFlexibleBuffer,
      dailyAllowance: simDailyAllowance,
      projectedEndBalance: Math.max(simAvailableCash - protectedSavings - unpaidReserved, 0),
    };
  }

  // --- Balance Forecast Data ---
  const forecastData = generateForecast({
    availableCash,
    dailyAllowance,
    daysRemaining,
    commitments: unpaidCommitments,
    settings,
  });

  return {
    // Core
    startingBudget,
    availableCash,
    recordedIncome,
    recordedExpenses,
    protectedSavings,
    totalSavingsTarget,
    unpaidReserved,
    emergencyReserve: safeEmergencyReserve,
    flexibleBuffer,
    dailyAllowance,
    daysRemaining: safeDaysRemaining,
    daysPassed,
    // Savings
    primaryGoal,
    savingsProgress,
    primarySavedAmount,
    primaryTargetAmount,
    // Spending
    categoryBreakdown,
    spendingPaceRatio,
    // Projections
    projectedEndBalance,
    forecastData,
    // Health
    healthScore,
    riskLevel,
    // Simulation
    simRisk,
    // Metadata
    netFlow: recordedIncome - recordedExpenses,
  };
};

// ─── Health Score ─────────────────────────────────────────────────────────────

export const calculateHealthScore = ({
  availableCash,
  startingBudget,
  flexibleBuffer,
  protectedSavings,
  totalSavingsTarget,
  unpaidReserved,
  emergencyReserve,
  spendingPaceRatio,
  daysRemaining,
  projectedEndBalance,
}) => {
  let score = 100;

  // 1. Spending pace penalty (0–25 points)
  if (spendingPaceRatio > 1.5) score -= 25;
  else if (spendingPaceRatio > 1.2) score -= 15;
  else if (spendingPaceRatio > 1.0) score -= 8;

  // 2. Available cash ratio (0–20 points)
  const cashRatio = availableCash / Math.max(startingBudget, 1);
  if (cashRatio < 0.1) score -= 20;
  else if (cashRatio < 0.2) score -= 12;
  else if (cashRatio < 0.3) score -= 6;

  // 3. Flexible buffer vs commitments (0–20 points)
  if (flexibleBuffer <= 0) score -= 20;
  else if (flexibleBuffer < 500) score -= 12;
  else if (flexibleBuffer < 1000) score -= 6;

  // 4. Savings progress (0–20 points)
  const savingsRatio = protectedSavings / Math.max(totalSavingsTarget, 1);
  if (savingsRatio < 0.1) score -= 15;
  else if (savingsRatio < 0.3) score -= 8;
  else if (savingsRatio < 0.5) score -= 3;

  // 5. Emergency reserve coverage (0–15 points)
  if (emergencyReserve <= 0) score -= 15;
  else if (emergencyReserve < 500) score -= 8;
  else if (emergencyReserve < 800) score -= 3;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const calculateRiskLevel = (healthScore, flexibleBuffer, availableCash) => {
  if (healthScore >= 70 && flexibleBuffer > 500) return 'Low';
  if (healthScore >= 45 || availableCash > 2000) return 'Moderate';
  return 'High';
};

export const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'Low': return '#43B7A2';
    case 'Moderate': return '#F0A34A';
    case 'High': return '#E77983';
    default: return '#9292A5';
  }
};

// ─── Balance Forecast ─────────────────────────────────────────────────────────

export const generateForecast = ({ availableCash, dailyAllowance, daysRemaining, commitments, settings }) => {
  const data = [];
  const today = new Date();
  let balance = availableCash;

  // Build commitment map by date
  const commitmentMap = {};
  commitments.forEach(c => {
    const key = c.dueDate;
    if (key) {
      commitmentMap[key] = (commitmentMap[key] || 0) + (c.amount || 0);
    }
  });

  for (let i = 0; i <= Math.min(daysRemaining, 30); i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Deduct daily spending
    if (i > 0) balance -= dailyAllowance;

    // Deduct upcoming commitments on their date
    if (commitmentMap[dateStr]) {
      balance -= commitmentMap[dateStr];
    }

    data.push({
      day: i === 0 ? 'Today' : `Day +${i}`,
      date: dateStr,
      balance: Math.max(Math.round(balance), 0),
      isProjected: i > 0,
      hasCommitment: !!commitmentMap[dateStr],
    });
  }

  return data;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getEmptyMetrics = () => ({
  startingBudget: 10000,
  availableCash: 10000,
  recordedIncome: 0,
  recordedExpenses: 0,
  protectedSavings: 0,
  totalSavingsTarget: 0,
  unpaidReserved: 0,
  emergencyReserve: 1000,
  flexibleBuffer: 9000,
  dailyAllowance: 300,
  daysRemaining: 30,
  daysPassed: 0,
  primaryGoal: null,
  savingsProgress: 0,
  primarySavedAmount: 0,
  primaryTargetAmount: 2500,
  categoryBreakdown: {},
  spendingPaceRatio: 1,
  projectedEndBalance: 0,
  forecastData: [],
  healthScore: 75,
  riskLevel: 'Low',
  simRisk: null,
  netFlow: 0,
});

export const getHealthScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 45) return 'Fair';
  if (score >= 25) return 'At Risk';
  return 'Critical';
};

export const getHealthScoreColor = (score) => {
  if (score >= 80) return '#43B7A2';
  if (score >= 65) return '#7968EF';
  if (score >= 45) return '#F0A34A';
  return '#E77983';
};
