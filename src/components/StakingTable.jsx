import React from 'react';
import { formatEth } from '../utils/formatting';
import { calculateReturn, generateStakingData } from '../utils/calculations';




export function StakingTable({ calculations, rewards, ethPrice }) {
  const stakingData = generateStakingData(calculations, rewards, ethPrice);

  return (
    <div className="staking-table-container">
      <h3>CSM Returns Analysis</h3>
      <div className="table-responsive">
        <table className="staking-table">
          <thead>
            <tr>
              <th>Duration</th>
              <th>ETH Staked</th>
              <th>ETH Reward (Total) </th>
              <th>Return (USD)</th>
            </tr>
          </thead>
          <tbody>
            {stakingData.map((row) => (
              <tr key={row.duration}>
                <td>{row.duration}</td>
                <td>{formatEth(row.ethStake)} ETH</td>
                <td>{formatEth(row.ethReward)} ETH</td>
                <td>${row.usdReturn.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}