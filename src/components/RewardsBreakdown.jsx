import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatEth } from '../utils/formatting';

export function RewardsBreakdown({ daily, cumulative, calculations }) {
  const getTimeframeLabel = (days) => {
    if (days === 1) return '24-Hour';
    if (days === 7) return '7-Day';
    if (days === 14) return '14-Day';
    if (days === 28) return '28-Day';
    if (days === 90) return '3-Month';
    if (days === 180) return '6-Month';
    if (days === 365) return '12-Month';
    return `${days}-Day`;
  };

  const comparisonData = [
    {
      period: '1d',
      csm: daily.total / 28,  // Convert from epoch to daily
      vanilla: (daily.total / 28) / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '7d',
      csm: (daily.total / 28) * 7,
      vanilla: ((daily.total / 28) * 7) / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '14d',
      csm: (daily.total / 28) * 14,
      vanilla: ((daily.total / 28) * 14) / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '28d',
      csm: daily.total,
      vanilla: daily.total / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '90d',
      csm: daily.total * (90 / 28),
      vanilla: (daily.total * (90 / 28)) / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '180d',
      csm: daily.total * (180 / 28),
      vanilla: (daily.total * (180 / 28)) / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '365d',
      csm: daily.total * (365 / 28),
      vanilla: (daily.total * (365 / 28)) / (calculations.isEA ? 2.37 : 2.32)
    }
  ];

  // Filter data to show only up to selected duration
  const filteredData = comparisonData.filter(item => {
    const itemDays = parseInt(item.period);
    return itemDays <= calculations.stakingDuration;
  });

  return (
    <div className="rewards-panel">
      <div className="daily-breakdown">
        <h3>{getTimeframeLabel(calculations.stakingDuration)} Rewards</h3>
        <div className="rewards-grid">
          <div className="reward-card">
            <span className="reward-label">Bond Rebase</span>
            <span className="reward-value">{formatEth(daily.bond)} ETH</span>
            <span className="reward-rate">
              +{((daily.bond / (calculations.bondAmount || 1)) * 100).toFixed(4)}%
            </span>
          </div>
          <div className="reward-card">
            <span className="reward-label">Node Operator</span>
            <span className="reward-value">{formatEth(daily.operator)} ETH</span>
            <span className="reward-rate">
              +{((daily.operator / ((calculations.validators * 32) || 1)) * 100).toFixed(4)}%
            </span>
          </div>
        </div>
      </div>

      <div className="cumulative-rewards">
        <h3>CSM vs Vanilla Staking Comparison</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="period" stroke="#64748b" />
              <YAxis
                stroke="#64748b"
                tickFormatter={value => `${(value).toFixed(1)}-ETH`}
                domain={[0, 'auto']}
                scale="linear"
              />

              <Tooltip
                contentStyle={{
                  background: '#fff',
                  borderRadius: '8px',
                  padding: '10px'
                }}
                formatter={value => [`${formatEth(value)} ETH`]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="csm"
                name="CSM Staking"
                stroke="#1a73e8"
                strokeWidth={2}
                dot={{ fill: '#1a73e8' }}
              />
              <Line
                type="monotone"
                dataKey="vanilla"
                name="Vanilla Staking"
                stroke="#34a853"
                strokeWidth={2}
                dot={{ fill: '#34a853' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}