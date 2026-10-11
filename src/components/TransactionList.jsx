import React from 'react';
import { getCategoryMeta } from '../utils/financeCalculations';
import { formatCurrency } from '../utils/currencyFormatter';
import { Edit2, Trash2 } from 'lucide-react';

const TransactionList = ({ transactions, onEdit, onDelete, limit }) => {
  const items = limit ? transactions.slice(0, limit) : transactions;

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💸</div>
        <div className="empty-state-title">No transactions yet</div>
        <div className="empty-state-desc">Add your first income or expense to get started.</div>
      </div>
    );
  }

  return (
    <div className="txn-list">
      {items.map(txn => {
        const meta = getCategoryMeta(txn.category);
        const date = new Date(txn.date);
        const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return (
          <div key={txn.id} className="txn-item">
            <div
              className="txn-icon"
              style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
            >
              {meta.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="txn-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {txn.name}
              </div>
              <div className="txn-cat">{txn.category} · {dateStr}</div>
            </div>
            <div
              className={`txn-amount ${txn.type}`}
            >
              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
            </div>
            {(onEdit || onDelete) && (
              <div className="txn-actions">
                {onEdit && (
                  <button
                    className="btn btn-icon-sm btn-ghost"
                    onClick={() => onEdit(txn)}
                    aria-label="Edit transaction"
                  >
                    <Edit2 size={13} />
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn btn-icon-sm btn-danger"
                    onClick={() => onDelete(txn)}
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
