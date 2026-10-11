import React, { useState } from 'react';
import { Plus, Target, TrendingUp, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';

const GOAL_ICONS = { Emergency: '🚨', Tech: '💻', Travel: '✈️', Education: '📚', Entertainment: '🎵', Other: '🎯' };

const GoalCard = ({ goal, onContribute, onWithdraw, onEdit, onDelete }) => {
  const pct = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - goal.savedAmount, 0);
  const icon = GOAL_ICONS[goal.category] || '🎯';
  const daysLeft = goal.targetDate ? Math.max(Math.ceil((new Date(goal.targetDate) - new Date()) / 86400000), 0) : null;

  return (
    <div className="goal-card">
      <div className="goal-header">
        <div>
          <div className="goal-icon">{icon}</div>
          <div className="goal-name">{goal.name}</div>
          <div className="goal-description">{goal.description}</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-icon-sm btn-ghost" onClick={() => onEdit(goal)} aria-label="Edit goal">✏️</button>
          <button className="btn btn-icon-sm btn-danger" onClick={() => onDelete(goal)} aria-label="Delete goal">🗑️</button>
        </div>
      </div>

      <div className="goal-amounts">
        <div className="goal-saved">{formatCurrency(goal.savedAmount)}</div>
        <div className="goal-target">of {formatCurrency(goal.targetAmount)} goal</div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: goal.color || '#7968EF' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="goal-pct">{pct.toFixed(0)}% complete</span>
        {daysLeft !== null && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Calendar size={12} style={{ display: 'inline', marginRight: 3 }} />
            {daysLeft}d left
          </span>
        )}
      </div>

      {remaining > 0 && (
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          {formatCurrency(remaining)} to go
        </div>
      )}
      {pct >= 100 && (
        <div className="insight-item success" style={{ marginTop: 8 }}>🎉 Goal reached!</div>
      )}

      <div className="goal-actions">
        <button className="btn btn-success btn-sm" onClick={() => onContribute(goal)}>
          <TrendingUp size={13} /> Contribute
        </button>
        {goal.savedAmount > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={() => onWithdraw(goal)}>
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
};

const EMPTY_GOAL = {
  name: '', targetAmount: '', savedAmount: 0, targetDate: '', category: 'Other',
  color: '#7968EF', description: '', isProtected: false,
};

const SavingsGoals = () => {
  const { financeData, metrics, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, contributeToGoal, withdrawFromGoal, addToast } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [withdrawGoal, setWithdrawGoal] = useState(null);
  const [deleteGoal, setDeleteGoal] = useState(null);
  const [form, setForm] = useState(EMPTY_GOAL);
  const [errors, setErrors] = useState({});
  const [contributeAmount, setContributeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const goals = financeData?.savingsGoals || [];
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Goal name is required.';
    if (!form.targetAmount || Number(form.targetAmount) <= 0) errs.targetAmount = 'Enter a valid target amount.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAdd = () => {
    setEditGoal(null);
    setForm(EMPTY_GOAL);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (goal) => {
    setEditGoal(goal);
    setForm({ ...goal });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = { ...form, targetAmount: Number(form.targetAmount), savedAmount: Number(form.savedAmount || 0) };
    if (editGoal) {
      updateSavingsGoal(editGoal.id, data);
    } else {
      addSavingsGoal(data);
    }
    setShowModal(false);
  };

  const handleContribute = () => {
    const amount = Number(contributeAmount);
    if (amount <= 0) { addToast('Enter a valid amount', 'error'); return; }
    const available = metrics?.flexibleBuffer || 0;
    if (amount > available) {
      addToast(`Insufficient flexible funds. Max available: ${formatCurrency(available)}`, 'error');
      return;
    }
    if (contributeGoal.savedAmount + amount > contributeGoal.targetAmount) {
      addToast('Amount exceeds goal target.', 'error');
      return;
    }
    contributeToGoal(contributeGoal.id, amount);
    setContributeGoal(null);
    setContributeAmount('');
  };

  const handleWithdraw = () => {
    const amount = Number(withdrawAmount);
    if (amount <= 0) { addToast('Enter a valid amount', 'error'); return; }
    if (amount > withdrawGoal.savedAmount) {
      addToast('Cannot withdraw more than saved.', 'error');
      return;
    }
    withdrawFromGoal(withdrawGoal.id, amount);
    setWithdrawGoal(null);
    setWithdrawAmount('');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Savings Goals</h1>
          <p>Set goals, contribute funds, and watch your savings grow.</p>
        </div>
        <button id="add-goal-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Saved', value: formatCurrency(totalSaved), color: 'var(--mint)' },
          { label: 'Total Target', value: formatCurrency(totalTarget), color: 'var(--primary)' },
          { label: 'Overall Progress', value: `${totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%`, color: 'var(--orange)' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ padding: 20 }}>
            <div className="stat-card-label">{c.label}</div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem', color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {goals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Target size={48} style={{ opacity: 0.3 }} /></div>
            <div className="empty-state-title">No savings goals yet</div>
            <div className="empty-state-desc">Create your first goal to start tracking your savings progress.</div>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Create First Goal</button>
          </div>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onContribute={setContributeGoal}
              onWithdraw={setWithdrawGoal}
              onEdit={openEdit}
              onDelete={setDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editGoal ? 'Edit Goal' : 'New Savings Goal'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button id="save-goal-btn" className="btn btn-primary" onClick={handleSubmit}>{editGoal ? 'Save Changes' : 'Create Goal'}</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="goal-name">Goal Name <span>*</span></label>
          <input id="goal-name" name="name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Emergency Fund" value={form.name} onChange={handleChange} />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="goal-target">Target Amount (₹) <span>*</span></label>
            <input id="goal-target" name="targetAmount" type="number" className={`form-input ${errors.targetAmount ? 'error' : ''}`} placeholder="0" value={form.targetAmount} onChange={handleChange} />
            {errors.targetAmount && <div className="form-error">{errors.targetAmount}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="goal-saved">Already Saved (₹)</label>
            <input id="goal-saved" name="savedAmount" type="number" className="form-input" placeholder="0" value={form.savedAmount} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="goal-date">Target Date</label>
            <input id="goal-date" name="targetDate" type="date" className="form-input" value={form.targetDate} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="goal-category">Category</label>
            <select id="goal-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
              {['Emergency', 'Tech', 'Travel', 'Education', 'Entertainment', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="goal-desc">Description</label>
          <input id="goal-desc" name="description" className="form-input" placeholder="What is this goal for?" value={form.description} onChange={handleChange} />
        </div>
      </Modal>

      {/* Contribute Modal */}
      <Modal isOpen={!!contributeGoal} onClose={() => { setContributeGoal(null); setContributeAmount(''); }}
        title={`Contribute to "${contributeGoal?.name}"`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setContributeGoal(null); setContributeAmount(''); }}>Cancel</button>
            <button id="confirm-contribute-btn" className="btn btn-success" onClick={handleContribute}>Add to Goal</button>
          </>
        }
      >
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          Available flexible funds: <strong style={{ color: 'var(--mint)' }}>{formatCurrency(metrics?.flexibleBuffer || 0)}</strong>
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor="contribute-amount">Amount (₹)</label>
          <input id="contribute-amount" type="number" className="form-input" placeholder="0" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} />
        </div>
        <div className="insight-item info" style={{ fontSize: '0.8125rem' }}>
          <span>💡 Savings contributions are not counted as expenses — they transfer funds from your flexible balance to protected savings.</span>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={!!withdrawGoal} onClose={() => { setWithdrawGoal(null); setWithdrawAmount(''); }}
        title={`Withdraw from "${withdrawGoal?.name}"`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setWithdrawGoal(null); setWithdrawAmount(''); }}>Cancel</button>
            <button id="confirm-withdraw-btn" className="btn btn-danger" onClick={handleWithdraw}>Withdraw</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="withdraw-amount">Amount to Withdraw (₹)</label>
          <input id="withdraw-amount" type="number" className="form-input" placeholder="0" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} max={withdrawGoal?.savedAmount} />
          <div className="form-hint">Max: {formatCurrency(withdrawGoal?.savedAmount || 0)}</div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteGoal}
        onClose={() => setDeleteGoal(null)}
        onConfirm={() => { deleteSavingsGoal(deleteGoal.id); setDeleteGoal(null); }}
        title="Delete Goal?"
        description={`Delete "${deleteGoal?.name}"? This will release its saved funds back to your flexible balance.`}
        confirmLabel="Delete"
        variant="danger"
        icon="🎯"
      />
    </div>
  );
};

export default SavingsGoals;
