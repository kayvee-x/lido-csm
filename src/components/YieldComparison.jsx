import React from 'react';
import { Ttip } from './Tooltip';

export function YieldComparison({ standard, csm, operatorRewards, config }) {
  return (
    <div className="yield-panel">
      <div className="yield-comparison">
        {operatorRewards && (
          <div className="operator-rewards-panel">
            <h4>Operator {config.nodeOperatorId} Rewards</h4>
            <div className="rewards-grid">
              <div className="reward-item">
                <span>Active Keys:</span>
                <span>{operatorRewards.nonWithdrawnKeys}</span>
              </div>
              <div className="reward-item">
                <span>Required Bond:</span>
                <span>{operatorRewards.totalRequiredBond} ETH</span>
              </div>
              <div className="reward-item">
                <span>Total Rewards:</span>
                <span>{operatorRewards.totalRewardsEth} ETH</span>
              </div>
              <div className="reward-item">
                <span>Claimable Rewards:</span>
                <span>{operatorRewards.excessBond} ETH</span>
              </div>
            </div>
          </div>
        )}
        <div className="yield-card">
          <h4>
            <span>Vanilla Staking</span>
            <Ttip content="Traditional solo staking rewards from running your own Ethereum validator" />
          </h4>
          <span className="yield-value">{standard.toFixed(2)}% APR</span>
        </div>

        <div className="yield-card highlight">
          <h4>
            <span>CSM Staking</span>
            <Ttip content="Combined APR including Node Operator rewards and bond rebase" />
          </h4>
          <span className="yield-value">{csm.toFixed(2)}% APR</span>
        </div>


      </div>
    </div>
  );
}

