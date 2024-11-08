import React from 'react';

export function StakingTable({ calculations, rewards, ethPrice }) {
  // Early return if data isn't ready
  if (!calculations?.totalStaked || !rewards?.daily?.total) {
    return <div className="staking-table-container">Loading...</div>;
  }

  const stakingData = [
    {
      duration: '24 Hours',
      ethStake: calculations.totalStaked,
      ethReward: rewards.daily.total,
      return: rewards.daily.total * ethPrice,
      returnPercentage: (rewards.daily.total / calculations.totalStaked) * 100
    },
    {
      duration: '7 Days',
      ethStake: calculations.totalStaked,
      ethReward: rewards.cumulative.weekly,
      return: rewards.cumulative.weekly * ethPrice,
      returnPercentage: (rewards.cumulative.weekly / calculations.totalStaked) * 100
    },
    {
      duration: '30 Days',
      ethStake: calculations.totalStaked,
      ethReward: rewards.cumulative.monthly,
      return: rewards.cumulative.monthly * ethPrice,
      returnPercentage: (rewards.cumulative.monthly / calculations.totalStaked) * 100
    },
    {
      duration: '365 Days',
      ethStake: calculations.totalStaked,
      ethReward: rewards.cumulative.yearly,
      return: rewards.cumulative.yearly * ethPrice,
      returnPercentage: (rewards.cumulative.yearly / calculations.totalStaked) * 100
    }
  ];

  return (
    <div className="staking-table-container">
      <h3>Staking Returns Analysis</h3>
      <div className="table-responsive">
        <table className="staking-table">
          <thead>
            <tr>
              <th>Duration</th>
              <th>ETH Stake</th>
              <th>ETH Reward</th>
              <th>Return (USD)</th>
              <th>Return %</th>
            </tr>
          </thead>
          <tbody>
            {stakingData.map((row) => (
              <tr key={row.duration}>
                <td>{row.duration}</td>
                <td>{row.ethStake.toFixed(4)} ETH</td>
                <td>{row.ethReward.toFixed(4)} ETH</td>
                <td>${row.return.toLocaleString()}</td>
                <td className="return-percentage">
                  {row.returnPercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
