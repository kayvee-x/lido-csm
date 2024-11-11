import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatEth } from '../utils/formatting';

export function RewardsBreakdown({ daily, cumulative, calculations }) {
  const comparisonData = [
    {
      period: '1d',
      csm: daily.total,
      vanilla: daily.total / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '7d',
      csm: daily.total * 7,
      vanilla: (daily.total * 7) / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '30d',
      csm: daily.total * 30,
      vanilla: (daily.total * 30) / (calculations.isEA ? 2.37 : 2.32)
    },
    {
      period: '365d',
      csm: daily.total * 365,
      vanilla: (daily.total * 365) / (calculations.isEA ? 2.37 : 2.32)
    }
  ];

  return (
    <div className="rewards-panel">
      <div className="daily-breakdown">
        <h3>Daily Rewards</h3>
        <div className="rewards-grid">
          <div className="reward-card">
            <span className="reward-label">Bond Rebase</span>
            <span className="reward-value">{formatEth(daily.bond)} ETH</span>
            <span className="reward-rate">
              +{((daily.bond / calculations.bondAmount) * 100).toFixed(4)}%
            </span>
          </div>
          <div className="reward-card">
            <span className="reward-label">Node Operator</span>
            <span className="reward-value">{formatEth(daily.operator)} ETH</span>
            <span className="reward-rate">
              +{((daily.operator / (calculations.validators * 32)) * 100).toFixed(4)}%
            </span>
          </div>
        </div>
      </div>

      <div className="cumulative-rewards">
        <h3>CSM vs Vanilla Staking Comparison</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="period" stroke="#64748b" />
              <YAxis
                stroke="#64748b"
                tickFormatter={value => `${(value).toFixed(2)} ETH`}
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
