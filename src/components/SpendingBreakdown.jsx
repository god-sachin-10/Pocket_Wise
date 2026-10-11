import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { getCategoryMeta, CATEGORIES } from '../utils/financeCalculations';
import { formatCurrency } from '../utils/currencyFormatter';

const SpendingBreakdown = ({ categoryBreakdown, onCategorySelect, selectedCategory }) => {
  const total = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);

  const data = Object.entries(categoryBreakdown)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => {
      const meta = getCategoryMeta(cat);
      return { name: cat, value: amount, color: meta.color, icon: meta.icon, pct: ((amount / total) * 100).toFixed(1) };
    });

  if (data.length === 0) {
    return (
      <div className="empty-state" style={{ padding: 32 }}>
        <div className="empty-state-icon">📊</div>
        <div className="empty-state-title">No spending yet</div>
        <div className="empty-state-desc">Add some expenses to see your spending breakdown.</div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, icon, pct } = payload[0].payload;
      return (
        <div style={{ background: 'var(--navy)', color: 'white', padding: '8px 12px', borderRadius: 8, fontSize: '0.8125rem' }}>
          <div style={{ fontWeight: 700 }}>{icon} {name}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)' }}>{formatCurrency(value)} ({pct}%)</div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div style={{ padding: '0 24px' }}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              onClick={(entry) => onCategorySelect && onCategorySelect(entry.name === selectedCategory ? null : entry.name)}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={selectedCategory && selectedCategory !== entry.name ? 0.35 : 1}
                  style={{ cursor: 'pointer', outline: 'none' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="donut-legend">
        {data.slice(0, 6).map(item => (
          <div
            key={item.name}
            className="legend-item"
            style={{ cursor: 'pointer', opacity: selectedCategory && selectedCategory !== item.name ? 0.4 : 1 }}
            onClick={() => onCategorySelect && onCategorySelect(item.name === selectedCategory ? null : item.name)}
          >
            <div className="legend-dot" style={{ background: item.color }} />
            <span className="legend-name">{item.icon} {item.name}</span>
            <span className="legend-amount">{formatCurrency(item.value)}</span>
            <span className="legend-pct">{item.pct}%</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default SpendingBreakdown;
