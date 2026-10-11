import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { formatCurrency } from '../utils/currencyFormatter';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: 'var(--navy)',
        color: 'white',
        padding: '10px 14px',
        borderRadius: 10,
        fontSize: '0.8125rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)' }}>
          Balance: <span style={{ color: '#43B7A2', fontWeight: 700 }}>{formatCurrency(payload[0].value)}</span>
        </div>
        {d.hasCommitment && (
          <div style={{ color: '#F0A34A', fontSize: '0.75rem', marginTop: 4 }}>⚡ Commitment due</div>
        )}
        {d.isProjected && (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: 2 }}>📊 Estimated</div>
        )}
      </div>
    );
  }
  return null;
};

const BalanceForecast = ({ forecastData }) => {
  if (!forecastData || forecastData.length === 0) {
    return (
      <div className="chart-placeholder">
        <span>No forecast data available</span>
      </div>
    );
  }

  const maxVal = Math.max(...forecastData.map(d => d.balance));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7968EF" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#7968EF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="var(--red)" strokeDasharray="4 4" strokeWidth={1.5} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke="#7968EF"
          strokeWidth={2.5}
          fill="url(#balanceGrad)"
          dot={(props) => {
            const { cx, cy, payload } = props;
            if (payload.hasCommitment) {
              return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={5} fill="#F0A34A" stroke="white" strokeWidth={2} />;
            }
            return null;
          }}
          activeDot={{ r: 5, fill: '#7968EF', stroke: 'white', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default BalanceForecast;
