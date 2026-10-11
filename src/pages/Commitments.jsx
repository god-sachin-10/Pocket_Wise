import React, { useState } from 'react';
import { Plus, Calendar, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { getCategoryMeta, CATEGORIES } from '../utils/financeCalculations';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';

const getDueTag = (dueDate, isPaid, status) => {
  if (isPaid) return { label: 'Paid', className: 'paid' };
  if (status === 'paused') return { label: 'Paused', className: 'paused' };
  const now = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - now) / 86400000);
  if (diff < 0) return { label: 'Overdue', className: 'overdue' };
  if (diff <= 7) return { label: `Due in ${diff}d`, className: 'upcoming' };
  return null;
};

const CommitmentCard = ({ commit, onEdit, onDelete, onToggle, onPay }) => {
  const meta = getCategoryMeta(commit.category);
  const tag = getDueTag(commit.dueDate, commit.isPaid, commit.status);
  const dueStr = commit.dueDate ? new Date(commit.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  return (
    <div className={`commit-card ${commit.status === 'paused' ? 'paused' : ''} ${commit.isPaid ? 'paid' : ''}`}>
      <div className="commit-icon">{meta.icon}</div>
      <div className="commit-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div className="commit-name">{commit.name}</div>
          {commit.type === 'recurring' && <span className="commit-tag recurring">🔁 Recurring</span>}
          {tag && <span className={`commit-tag ${tag.className}`}>{tag.label}</span>}
        </div>
        <div className="commit-meta">
          <span>📅 Due: {dueStr}</span>
          <span>📂 {commit.category}</span>
          {commit.recurrenceInterval && <span>🔄 {commit.recurrenceInterval}</span>}
        </div>
        {commit.description && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 4 }}>{commit.description}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="commit-amount">{formatCurrency(commit.amount)}</div>
      </div>
      <div className="commit-actions">
        {!commit.isPaid && (
          <>
            <button
              className={`btn btn-sm ${commit.status === 'active' ? 'btn-ghost' : 'btn-ghost'}`}
              onClick={() => onToggle(commit)}
              title={commit.status === 'active' ? 'Pause subscription' : 'Resume subscription'}
              aria-label={commit.status === 'active' ? 'Pause' : 'Resume'}
            >
              {commit.status === 'active' ? <ToggleRight size={16} color="var(--mint)" /> : <ToggleLeft size={16} color="var(--text-muted)" />}
            </button>
            <button className="btn btn-success btn-sm" onClick={() => onPay(commit)} title="Mark as paid">
              <CheckCircle size={14} /> Pay
            </button>
          </>
        )}
        <button className="btn btn-icon-sm btn-ghost" onClick={() => onEdit(commit)} aria-label="Edit">✏️</button>
        <button className="btn btn-icon-sm btn-danger" onClick={() => onDelete(commit)} aria-label="Delete">🗑️</button>
      </div>
    </div>
  );
};

const EMPTY_COMMIT = {
  name: '', amount: '', dueDate: '', category: 'Bills',
  type: 'recurring', recurrenceInterval: 'monthly',
  status: 'active', isPaid: false, description: '',
};

const Commitments = () => {
  const { financeData, addCommitment, updateCommitment, deleteCommitment, payCommitment, toggleCommitmentStatus } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editCommit, setEditCommit] = useState(null);
  const [deleteCommit, setDeleteCommit] = useState(null);
  const [payCommit, setPayCommit] = useState(null);
  const [form, setForm] = useState(EMPTY_COMMIT);
  const [errors, setErrors] = useState({});

  const commitments = financeData?.commitments || [];
  const upcoming = commitments.filter(c => !c.isPaid && c.status === 'active')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const paid = commitments.filter(c => c.isPaid);
  const paused = commitments.filter(c => c.status === 'paused' && !c.isPaid);
  const totalReserved = upcoming.reduce((s, c) => s + c.amount, 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount.';
    if (!form.dueDate) errs.dueDate = 'Due date is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openAdd = () => {
    setEditCommit(null);
    setForm(EMPTY_COMMIT);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditCommit(c);
    setForm({ ...c });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const data = { ...form, amount: Number(form.amount) };
    if (editCommit) {
      updateCommitment(editCommit.id, data);
    } else {
      addCommitment(data);
    }
    setShowModal(false);
  };

  const sections = [
    { title: `Upcoming Payments (${upcoming.length})`, items: upcoming, empty: 'No upcoming payments' },
    { title: `Paused Subscriptions (${paused.length})`, items: paused, empty: 'No paused subscriptions' },
    { title: `Paid This Month (${paid.length})`, items: paid, empty: 'No paid commitments yet' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Commitments &amp; Subscriptions</h1>
          <p>Track upcoming bills, subscriptions, and one-time obligations.</p>
        </div>
        <button id="add-commitment-btn" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Commitment
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Reserved', value: formatCurrency(totalReserved), sub: 'Unpaid obligations', color: 'var(--red)' },
          { label: 'Upcoming Bills', value: upcoming.length, sub: 'Active commitments', color: 'var(--primary)' },
          { label: 'Paid This Period', value: paid.length, sub: 'Completed payments', color: 'var(--mint)' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ padding: 20 }}>
            <div className="stat-card-label">{c.label}</div>
            <div className="stat-card-value" style={{ fontSize: '1.5rem', color: c.color }}>{c.value}</div>
            <div className="stat-card-meta">{c.sub}</div>
          </div>
        ))}
      </div>

      {commitments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div className="empty-state-title">No commitments yet</div>
            <div className="empty-state-desc">Add your bills, subscriptions, and planned expenses.</div>
            <button className="btn btn-primary" onClick={openAdd}><Plus size={15} /> Add First Commitment</button>
          </div>
        </div>
      ) : (
        <>
          {sections.map(s => s.items.length > 0 && (
            <div key={s.title} className="card" style={{ marginBottom: 20 }}>
              <div className="card-header" style={{ paddingBottom: 8 }}>
                <div className="card-title">{s.title}</div>
              </div>
              <div className="commitments-list">
                {s.items.length === 0 ? (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '8px 0' }}>{s.empty}</div>
                ) : s.items.map(c => (
                  <CommitmentCard
                    key={c.id}
                    commit={c}
                    onEdit={openEdit}
                    onDelete={setDeleteCommit}
                    onToggle={toggleCommitmentStatus}
                    onPay={setPayCommit}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editCommit ? 'Edit Commitment' : 'Add Commitment'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button id="save-commitment-btn" className="btn btn-primary" onClick={handleSubmit}>{editCommit ? 'Save Changes' : 'Add'}</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label" htmlFor="commit-name">Name <span>*</span></label>
          <input id="commit-name" name="name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Airtel Recharge" value={form.name} onChange={handleChange} />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="commit-amount">Amount (₹) <span>*</span></label>
            <input id="commit-amount" name="amount" type="number" className={`form-input ${errors.amount ? 'error' : ''}`} placeholder="0" value={form.amount} onChange={handleChange} />
            {errors.amount && <div className="form-error">{errors.amount}</div>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="commit-due">Due Date <span>*</span></label>
            <input id="commit-due" name="dueDate" type="date" className={`form-input ${errors.dueDate ? 'error' : ''}`} value={form.dueDate} onChange={handleChange} />
            {errors.dueDate && <div className="form-error">{errors.dueDate}</div>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="commit-category">Category</label>
            <select id="commit-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="commit-type">Type</label>
            <select id="commit-type" name="type" className="form-select" value={form.type} onChange={handleChange}>
              <option value="recurring">Recurring</option>
              <option value="one-time">One-time</option>
            </select>
          </div>
        </div>
        {form.type === 'recurring' && (
          <div className="form-group">
            <label className="form-label" htmlFor="commit-recur">Recurrence</label>
            <select id="commit-recur" name="recurrenceInterval" className="form-select" value={form.recurrenceInterval} onChange={handleChange}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        )}
        <div className="form-group">
          <label className="form-label" htmlFor="commit-desc">Description</label>
          <input id="commit-desc" name="description" className="form-input" placeholder="Optional note" value={form.description} onChange={handleChange} />
        </div>
      </Modal>

      {/* Pay Confirm */}
      <ConfirmDialog
        isOpen={!!payCommit}
        onClose={() => setPayCommit(null)}
        onConfirm={() => { payCommitment(payCommit.id); setPayCommit(null); }}
        title="Confirm Payment"
        description={`Mark "${payCommit?.name}" as paid? This will record a ${formatCurrency(payCommit?.amount)} expense and release the reservation.`}
        confirmLabel="Pay Now"
        variant="success"
        icon="💳"
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteCommit}
        onClose={() => setDeleteCommit(null)}
        onConfirm={() => { deleteCommitment(deleteCommit.id); setDeleteCommit(null); }}
        title="Delete Commitment?"
        description={`Remove "${deleteCommit?.name}"? This will free up the reserved funds.`}
        confirmLabel="Delete"
        variant="danger"
        icon="🗑️"
      />
    </div>
  );
};

export default Commitments;
