import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export function YieldComparison({ standard, csm, data }) {
  const yieldDifference = ((csm - standard) / standard * 100).toFixed(2);

  return (
    <div className="yield-panel">
      <div className="yield-comparison">
        <div className="yield-card">
          <h4>Standard Staking</h4>
          <span className="yield-value">{standard.toFixed(2)}% APR</span>
        </div>
        <div className="yield-card highlight">
          <h4>CSM Staking</h4>
          <span className="yield-value">{csm.toFixed(2)}% APR</span>
          <span className="yield-difference">+{yieldDifference}%</span>
        </div>
      </div>

      <div className="yield-chart">
        <AreaChart data={data} height={200}>
          <Area type="monotone" dataKey="csm" fill="#34a853" fillOpacity={0.2} />
          <Area type="monotone" dataKey="standard" fill="#1a73e8" fillOpacity={0.2} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
        </AreaChart>
      </div>
    </div>
  );
}
