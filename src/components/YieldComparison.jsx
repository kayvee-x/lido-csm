import React from 'react';
import { Ttip } from './Tooltip';

export function YieldComparison({ standard, csm, data }) {
  const yieldDifference = ((csm - standard) / standard * 100).toFixed(2);
  const multiplier = (csm / standard).toFixed(1);

  return (
    <div className="yield-panel">
      <div className="yield-comparison">
        <div className="yield-card">
          <h4>
            <span>Vanilla Staking</span>
            <Ttip content="Traditional solo staking rewards from running your own Ethereum validator. Includes base consensus rewards and MEV opportunities, but requires managing your own infrastructure and maintaining 99.9% uptime." />
          </h4>
          <span className="yield-value">{standard.toFixed(2)}% APR</span>
        </div>
        <div className="yield-card highlight">
          <h4>
            <span>CSM Staking
            </span>
            <Ttip content="Combined APR including Node Operator rewards and bond rebase. Rewards are smoothed across modules to reduce volatility and ensure consistent returns." />
          </h4>
          <span className="yield-value">{csm.toFixed(2)}% APR</span>
        </div>
      </div>
    </div>
  );
}
