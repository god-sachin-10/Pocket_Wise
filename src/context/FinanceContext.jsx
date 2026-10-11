import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFinanceData, saveFinanceData } from '../utils/storage';
import { createInitialDemoData } from '../data/initialDemoData';
import { calculateFinancials } from '../utils/financeCalculations';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);

const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const FinanceProvider = ({ children }) => {
  const { user } = useAuth();
  const [financeData, setFinanceData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Load/init finance data when user changes
  useEffect(() => {
    if (!user) {
      setFinanceData(null);
      setMetrics(null);
      return;
    }
    let data = getFinanceData(user.id);
    if (!data) {
      data = createInitialDemoData();
      saveFinanceData(user.id, data);
    }
    setFinanceData(data);
  }, [user]);

  // Recalculate metrics when data changes
  useEffect(() => {
    if (financeData) {
      setMetrics(calculateFinancials(financeData));
    }
  }, [financeData]);

  // Persist data when it changes
  const updateData = useCallback((updater) => {
    if (!user) return;
    setFinanceData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveFinanceData(user.id, next);
      return next;
    });
  }, [user]);

  // ─── Toast ──────────────────────────────────────────────────────────────────

  const addToast = useCallback((message, type = 'success') => {
    const id = generateId('toast');
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ─── Transactions ────────────────────────────────────────────────────────────

  const addTransaction = useCallback((txn) => {
    const newTxn = { ...txn, id: generateId('txn'), date: txn.date || new Date().toISOString().split('T')[0] };
    updateData(prev => ({ ...prev, transactions: [newTxn, ...(prev.transactions || [])] }));
    addToast(`${txn.type === 'income' ? 'Income' : 'Expense'} recorded: ${txn.name}`, 'success');
  }, [updateData, addToast]);

  const updateTransaction = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      transactions: (prev.transactions || []).map(t => t.id === id ? { ...t, ...updates } : t),
    }));
    addToast('Transaction updated', 'success');
  }, [updateData, addToast]);

  const deleteTransaction = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      transactions: (prev.transactions || []).filter(t => t.id !== id),
    }));
    addToast('Transaction deleted', 'info');
  }, [updateData, addToast]);

  // ─── Savings Goals ───────────────────────────────────────────────────────────

  const addSavingsGoal = useCallback((goal) => {
    const newGoal = { ...goal, id: generateId('goal'), savedAmount: goal.savedAmount || 0 };
    updateData(prev => ({ ...prev, savingsGoals: [...(prev.savingsGoals || []), newGoal] }));
    addToast(`Goal created: ${goal.name}`, 'success');
  }, [updateData, addToast]);

  const updateSavingsGoal = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      savingsGoals: (prev.savingsGoals || []).map(g => g.id === id ? { ...g, ...updates } : g),
    }));
    addToast('Goal updated', 'success');
  }, [updateData, addToast]);

  const deleteSavingsGoal = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      savingsGoals: (prev.savingsGoals || []).filter(g => g.id !== id),
    }));
    addToast('Goal deleted', 'info');
  }, [updateData, addToast]);

  const contributeToGoal = useCallback((goalId, amount) => {
    // Transfer funds: savings allocation increases, does NOT create a new expense
    updateData(prev => ({
      ...prev,
      savingsGoals: (prev.savingsGoals || []).map(g =>
        g.id === goalId ? { ...g, savedAmount: Math.min(g.savedAmount + amount, g.targetAmount) } : g
      ),
    }));
    addToast(`₹${amount} added to savings goal`, 'success');
  }, [updateData, addToast]);

  const withdrawFromGoal = useCallback((goalId, amount) => {
    updateData(prev => ({
      ...prev,
      savingsGoals: (prev.savingsGoals || []).map(g =>
        g.id === goalId ? { ...g, savedAmount: Math.max(g.savedAmount - amount, 0) } : g
      ),
    }));
    addToast(`₹${amount} withdrawn from goal`, 'info');
  }, [updateData, addToast]);

  // ─── Commitments ─────────────────────────────────────────────────────────────

  const addCommitment = useCallback((commit) => {
    const newCommit = { ...commit, id: generateId('commit'), isPaid: false, status: 'active' };
    updateData(prev => ({ ...prev, commitments: [...(prev.commitments || []), newCommit] }));
    addToast(`Commitment added: ${commit.name}`, 'success');
  }, [updateData, addToast]);

  const updateCommitment = useCallback((id, updates) => {
    updateData(prev => ({
      ...prev,
      commitments: (prev.commitments || []).map(c => c.id === id ? { ...c, ...updates } : c),
    }));
    addToast('Commitment updated', 'success');
  }, [updateData, addToast]);

  const deleteCommitment = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      commitments: (prev.commitments || []).filter(c => c.id !== id),
    }));
    addToast('Commitment removed', 'info');
  }, [updateData, addToast]);

  const payCommitment = useCallback((id) => {
    // Mark paid + record expense once
    let commitmentName = '';
    let commitmentAmount = 0;
    let commitmentCategory = 'Bills';
    updateData(prev => {
      const commit = (prev.commitments || []).find(c => c.id === id);
      if (!commit) return prev;
      commitmentName = commit.name;
      commitmentAmount = commit.amount;
      commitmentCategory = commit.category;
      const newTxn = {
        id: generateId('txn'),
        name: commit.name,
        category: commitmentCategory,
        amount: commitmentAmount,
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        description: `Payment for: ${commit.name}`,
        isEssential: true,
      };
      return {
        ...prev,
        commitments: (prev.commitments || []).map(c => c.id === id ? { ...c, isPaid: true } : c),
        transactions: [newTxn, ...(prev.transactions || [])],
      };
    });
    addToast(`Paid: ${commitmentName}`, 'success');
  }, [updateData, addToast]);

  const toggleCommitmentStatus = useCallback((id) => {
    updateData(prev => ({
      ...prev,
      commitments: (prev.commitments || []).map(c =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'paused' : 'active' } : c
      ),
    }));
    addToast('Subscription status updated', 'info');
  }, [updateData, addToast]);

  // ─── Settings ─────────────────────────────────────────────────────────────

  const updateSettings = useCallback((newSettings) => {
    updateData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
    addToast('Settings updated', 'success');
  }, [updateData, addToast]);

  const resetDemoData = useCallback(() => {
    const fresh = createInitialDemoData();
    updateData(() => fresh);
    addToast('Demo data has been reset to defaults', 'info');
  }, [updateData, addToast]);

  // ─── Simulator ───────────────────────────────────────────────────────────────

  const simulateTransaction = useCallback((txn) => {
    if (!financeData) return null;
    return calculateFinancials(financeData, txn);
  }, [financeData]);

  const confirmSimulatedPurchase = useCallback((txn) => {
    addTransaction(txn);
  }, [addTransaction]);

  // ─── Unexpected Expenses ─────────────────────────────────────────────────────

  const applyUnexpectedExpense = useCallback((expense) => {
    const newTxn = {
      id: generateId('txn'),
      name: expense.name,
      category: expense.category || 'Emergency',
      amount: expense.amount,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      description: expense.description || 'Unexpected expense',
      isEssential: true,
    };
    // Also reduce emergency reserve
    updateData(prev => {
      const currentReserve = prev.settings?.emergencyReserve || 1000;
      const newReserve = Math.max(currentReserve - expense.amount, 0);
      return {
        ...prev,
        transactions: [newTxn, ...(prev.transactions || [])],
        settings: { ...prev.settings, emergencyReserve: newReserve },
      };
    });
    addToast(`Unexpected expense applied: ${expense.name}`, 'warning');
  }, [updateData, addToast]);

  return (
    <FinanceContext.Provider value={{
      financeData,
      metrics,
      toasts,
      addToast,
      removeToast,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      contributeToGoal,
      withdrawFromGoal,
      addCommitment,
      updateCommitment,
      deleteCommitment,
      payCommitment,
      toggleCommitmentStatus,
      updateSettings,
      resetDemoData,
      simulateTransaction,
      confirmSimulatedPurchase,
      applyUnexpectedExpense,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
};
