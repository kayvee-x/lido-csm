import React from 'react';
import { formatEth } from '../utils/formatting';


// Helper function to safely calculate percentages and avoid division by zero
const calculateReturn = (reward, stake, daysInPeriod) => {
  if (!stake || stake === 0) return 0;
  // Convert to annual rate for periods other than 365 days
  const annualizedReturn = (reward / stake) * (365 / daysInPeriod) * 100;
  return annualizedReturn;
};

export function StakingTable({ calculations, rewards, ethPrice }) {
  // Data validation and defaults
  const validCalculations = {
    totalStaked: calculations?.totalStaked || 0,
    validators: calculations?.validators || 0,
    bondAmount: calculations?.bondAmount || 0
  };

  const validRewards = {
    daily: {
      total: rewards?.daily?.total || 0,
      bond: rewards?.daily?.bond || 0,
      operator: rewards?.daily?.operator || 0
    },
    cumulative: {
      weekly: rewards?.cumulative?.weekly || 0,
      monthly: rewards?.cumulative?.monthly || 0,
      yearly: rewards?.cumulative?.yearly || 0
    }
  };

  // Calculate staking data for each time period
  const stakingData = [
    {
      duration: '24 Hours',
      ethStake: validCalculations.totalStaked,
      ethReward: validRewards.daily.total,
      usdReturn: validRewards.daily.total * ethPrice,
      // Calculate daily return as annualized percentage
      returnPercentage: calculateReturn(
        validRewards.daily.total,
        validCalculations.totalStaked,
        1
      )
    },
    {
      duration: '7 Days',
      ethStake: validCalculations.totalStaked,
      ethReward: validRewards.cumulative.weekly,
      usdReturn: validRewards.cumulative.weekly * ethPrice,
      // Calculate weekly return as annualized percentage
      returnPercentage: calculateReturn(
        validRewards.cumulative.weekly,
        validCalculations.totalStaked,
        7
      )
    },
    {
      duration: '30 Days',
      ethStake: validCalculations.totalStaked,
      ethReward: validRewards.cumulative.monthly,
      usdReturn: validRewards.cumulative.monthly * ethPrice,
      // Calculate monthly return using average month length
      returnPercentage: calculateReturn(
        validRewards.cumulative.monthly,
        validCalculations.totalStaked,
        30.44  // Average days in a month for more accurate calculations
      )
    },
    {
      duration: '365 Days',
      ethStake: validCalculations.totalStaked,
      ethReward: validRewards.cumulative.yearly,
      usdReturn: validRewards.cumulative.yearly * ethPrice,
      // Yearly return (no need to annualize)
      returnPercentage: calculateReturn(
        validRewards.cumulative.yearly,
        validCalculations.totalStaked,
        365
      )
    }
  ];

  // Breakdown of returns by source (bond vs operator)
  const returnsBreakdown = {
    daily: {
      bondReturn: (validRewards.daily.bond / validCalculations.bondAmount) * 100,
      operatorReturn: (validRewards.daily.operator / (validCalculations.totalStaked - validCalculations.bondAmount)) * 100
    },
    yearly: {
      bondReturn: (validRewards.cumulative.yearly * (validRewards.daily.bond / validRewards.daily.total) / validCalculations.bondAmount) * 100,
      operatorReturn: (validRewards.cumulative.yearly * (validRewards.daily.operator / validRewards.daily.total) / (validCalculations.totalStaked - validCalculations.bondAmount)) * 100
    }
  };

  return (
    <div className="staking-table-container">
      <h3>CSM Returns Analysis</h3>
      <div className="table-responsive">
        <table className="staking-table">
          <thead>
            <tr>
              <th>Duration</th>
              <th>ETH Stake</th>
              <th>ETH Reward</th>
              <th>Return (USD)</th>
              <th>APR %</th>
            </tr>
          </thead>
          <tbody>
            {stakingData.map((row) => (
              <tr key={row.duration}>
                <td>{row.duration}</td>
                <td>{formatEth(row.ethStake)} ETH</td>
                <td>{formatEth(row.ethReward)} ETH</td>
                <td>${row.usdReturn.toLocaleString()}</td>
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