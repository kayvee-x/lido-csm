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

  // Calculate annual rewards first
  const annualRewards = {
    // Bond rebase: bond * APR * (1 - 10% fee)
    bondRebase: calculations.bondAmount * 0.03 * 0.9,
    // Node operator rewards: validators * (32 * APR * 6%)
    operatorRewards: calculations.validators * (32 * 0.03 * 0.06)
  };

  const comparisonData = [
    {
      period: '1d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) / 365,
      vanilla: (calculations.totalStaked * 0.03) / 365
    },
    {
      period: '7d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (7 / 365),
      vanilla: (calculations.totalStaked * 0.03 * 7) / 365
    },
    {
      period: '14d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (14 / 365),
      vanilla: (calculations.totalStaked * 0.03 * 14) / 365
    },
    {
      period: '28d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (28 / 365),
      vanilla: (calculations.totalStaked * 0.03 * 28) / 365
    },
    {
      period: '90d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (90 / 365),
      vanilla: (calculations.totalStaked * 0.03 * 90) / 365
    },
    {
      period: '180d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (180 / 365),
      vanilla: (calculations.totalStaked * 0.03 * 180) / 365
    },
    {
      period: '365d',
      csm: annualRewards.bondRebase + annualRewards.operatorRewards,
      vanilla: calculations.totalStaked * 0.03
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