import React from 'react';

export function YieldComparison({ standard, csm, data }) {
  const yieldDifference = ((csm - standard) / standard * 100).toFixed(2);

  return (
    <div className="yield-panel">
      <div className="yield-comparison">
        <div className="yield-card">
          <h4>Vanilla Staking</h4>
          <span className="yield-value">{standard.toFixed(2)}% APR</span>
        </div>
        <div className="yield-card highlight">
          <h4>CSM Staking</h4>
          <span className="yield-value">{csm.toFixed(2)}% APR</span>
          <span className="yield-difference">+{yieldDifference}%</span>
        </div>
      </div>
    </div>
  );
}
