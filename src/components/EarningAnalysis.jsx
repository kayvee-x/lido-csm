import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { generateEarningsData } from '../utils/calculations';
export function EarningsAnalysis({ ethPrice, rewards }) {

  const earningsData = generateEarningsData(rewards, ethPrice);

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
