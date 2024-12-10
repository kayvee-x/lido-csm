import React from 'react';
import { Ttip } from './Tooltip';

export function YieldComparison({ standard, csm, operatorRewards, config }) {

  return (
    <div className="yield-panel">
      <div className="yield-comparison">
        {operatorRewards && config.nodeOperatorId && (
          <div className="operator-rewards">
            <h4>Operator {config.nodeOperatorId} Rewards
              <Ttip content="Detailed breakdown of rewards and bonds for this specific node operator" />
            </h4>
            <div className="rewards-details">
              <div>Keys: {operatorRewards.keys}</div>
              <div>Total Required Bond: {operatorRewards.totalRequiredBond?.toFixed(4)} ETH</div>
              <div>Excess Bond: {operatorRewards.totalClaimableRewardsEth?.toFixed(4)} ETH</div>
              <div>Total Distributed ETH: {operatorRewards.distributedEth?.toFixed(4)} ETH</div>
              <div>Total Node Operator ETH: {operatorRewards.totalNodeOperatorEth?.toFixed(4)} ETH</div>
              <div>Total ETH Rewards: {operatorRewards.totalRewardsEth?.toFixed(4)} ETH</div>
            </div>
          </div>
        )}
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
