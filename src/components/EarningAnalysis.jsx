import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function EarningsAnalysis({ ethPrice, rewards }) {
  const earningsData = [
    { month: 'Jan 2025', earnings: rewards.monthly * 1 * ethPrice },
    { month: 'Mar 2025', earnings: rewards.monthly * 3 * ethPrice },
    { month: 'May 2025', earnings: rewards.monthly * 5 * ethPrice },
    { month: 'Jul 2025', earnings: rewards.monthly * 7 * ethPrice },
    { month: 'Sep 2025', earnings: rewards.monthly * 9 * ethPrice },
    { month: 'Nov 2025', earnings: rewards.monthly * 11 * ethPrice }
  ];

  return (
    <div className="earnings-chart">
    <div className="earnings-container">
      <h3>CSM Earnings Analysis</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={earningsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
          <XAxis 
            dataKey="month" 
            stroke="#64748b"
            tick={{ fill: '#64748b' }}
          />
          <YAxis 
            stroke="#64748b"
            tick={{ fill: '#64748b' }}
            tickFormatter={value => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ 
              background: '#fff',
              border: '1px solid #eef2f7',
              borderRadius: '8px'
            }}
            formatter={value => [`$${value.toLocaleString()}`, 'Earnings']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="earnings" 
            stroke="#1a73e8" 
            strokeWidth={3}
            dot={{ fill: '#1a73e8', strokeWidth: 2 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
}
