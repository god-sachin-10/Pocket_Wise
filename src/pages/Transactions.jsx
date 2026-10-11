import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, TrendingUp, TrendingDown, ArrowLeftRight, Wallet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { CATEGORIES } from '../utils/financeCalculations';
import TransactionList from '../components/TransactionList';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';

const EMPTY_FORM = {
  name: '', category: 'Food', amount: '', type: 'expense',
  date: new Date().toISOString().split('T')[0], description: '', isEssential: false,
};

const Transactions = () => {
  const { financeData, metrics, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showModal, setShowModal] = useState(false);
  const [editTxn, setEditTxn] = useState(null);
  const [deleteTxn, setDeleteTxn] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const transactions = financeData?.transactions || [];

  const filtered = useMemo(() => {
    let list = transactions.filter(t => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCat && t.category !== filterCat) return false;
      if (filterType && t.type !== filterType) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
    return list;
  }, [transactions, search, filterCat, filterType, sortBy]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const openAdd = () => {
    setEditTxn(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (txn) => {
    setEditTxn(txn);
    setForm({ ...txn });
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount.';
    if (!form.date) errs.date = 'Date is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const txn = { ...form, amount: Number(form.amount) };
    if (editTxn) {
      updateTransaction(editTxn.id, txn);
    } else {
      addTransaction(txn);
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Transactions</h1>
          <p>Track every rupee that comes in and goes out.</p>
        </div>
        <div className="page-header-actions">
          <button id="add-transaction-btn" className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome), color: 'var(--mint)', icon: <TrendingUp size={18} color="#43B7A2" />, bg: 'var(--mint-bg)' },
          { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: 'var(--red)', icon: <TrendingDown size={18} color="#E77983" />, bg: 'var(--red-bg)' },
          { label: 'Net Cash Flow', value: formatCurrency(totalIncome - totalExpenses), color: totalIncome >= totalExpenses ? 'var(--mint)' : 'var(--red)', icon: <ArrowLeftRight size={18} color={totalIncome >= totalExpenses ? '#43B7A2' : '#E77983'} />, bg: totalIncome >= totalExpenses ? 'var(--mint-bg)' : 'var(--red-bg)' },
          { label: 'Available Balance', value: formatCurrency(metrics?.availableCash || 0), color: 'var(--primary)', icon: <Wallet size={18} color="#7968EF" />, bg: 'var(--primary-bg)' },
        ].map(c => (
          <div key={c.label} className="stat-card" style={{ padding: 20 }}>
            <div className="stat-card-icon" style={{ background: c.bg, width: 36, height: 36, marginBottom: 12 }}>{c.icon}</div>
            <div className="stat-card-label">{c.label}</div>
            <div className="stat-card-value" style={{ fontSize: '1.375rem', color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="card">
        {/* Filter Bar */}
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              id="txn-search"
              className="form-input"
              placeholder="Search transactions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <select id="txn-filter-cat" className="form-select" value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
          <select id="txn-filter-type" className="form-select" value={filterType} onChange={e => setFilterType(e.target.value)} style={{ maxWidth: 140 }}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select id="txn-sort" className="form-select" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ maxWidth: 160 }}>
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <TransactionList transactions={filtered} onEdit={openEdit} onDelete={setDeleteTxn} />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editTxn ? 'Edit Transaction' : 'Add Transaction'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button id="save-transaction-btn" className="btn btn-primary" onClick={handleSubmit}>
              {editTxn ? 'Save Changes' : 'Add Transaction'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['expense', 'income'].map(t => (
              <button
                key={t}
                type="button"
                className={`btn ${form.type === t ? (t === 'income' ? 'btn-success' : 'btn-danger') : 'btn-secondary'}`}
                style={{ flex: 1, textTransform: 'capitalize' }}
                onClick={() => setForm(prev => ({ ...prev, type: t }))}
              >
                {t === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {t}
              </button>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="txn-name">Name <span>*</span></label>
            <input id="txn-name" name="name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Zomato order" value={form.name} onChange={handleChange} />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="txn-amount">Amount (₹) <span>*</span></label>
              <input id="txn-amount" name="amount" type="number" className={`form-input ${errors.amount ? 'error' : ''}`} placeholder="0" min="0.01" value={form.amount} onChange={handleChange} />
              {errors.amount && <div className="form-error">{errors.amount}</div>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="txn-date">Date <span>*</span></label>
              <input id="txn-date" name="date" type="date" className={`form-input ${errors.date ? 'error' : ''}`} value={form.date} onChange={handleChange} />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="txn-category">Category</label>
            <select id="txn-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="txn-desc">Description</label>
            <input id="txn-desc" name="description" className="form-input" placeholder="Optional note" value={form.description} onChange={handleChange} />
          </div>
          <label className="checkbox-label">
            <input type="checkbox" name="isEssential" checked={form.isEssential} onChange={handleChange} />
            Mark as essential expense
          </label>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTxn}
        onClose={() => setDeleteTxn(null)}
        onConfirm={() => { deleteTransaction(deleteTxn.id); setDeleteTxn(null); }}
        title="Delete Transaction?"
        description={`Are you sure you want to delete "${deleteTxn?.name}"? This will update your available balance.`}
        confirmLabel="Delete"
        variant="danger"
        icon="🗑️"
      />
    </div>
  );
};

export default Transactions;
