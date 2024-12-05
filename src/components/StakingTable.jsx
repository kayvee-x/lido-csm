import React from 'react';
import { formatEth } from '../utils/formatting';


const calculateReturn = (reward, stake, bondAmount, daysInPeriod) => {
  if (!stake || stake === 0) return 0;
  
  const baseAPR = 0.04; // 4%
  const stakingFee = 0.10; // 10%
  const maxFee = 0.06; // 6%
  
  // CSM APR formula
  const bondRewards = bondAmount * baseAPR * (1 - stakingFee);
  const operatorRewards = (32 - bondAmount) * baseAPR * maxFee;
  const totalAPR = (bondRewards + operatorRewards) / bondAmount;
  
  // Convert to the specific time period
  return totalAPR * 100;
};

const calculateAPY = (reward, stake, daysInPeriod) => {
  if (!stake || stake === 0) return 0;
  // APY formula: (1 + r)^n - 1
  const periodsPerYear = 365 / daysInPeriod;
  const ratePerPeriod = reward / stake;
  return (Math.pow(1 + ratePerPeriod, periodsPerYear) - 1) * 100;
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
      daily: rewards?.cumulative?.daily || 0,
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
      ethReward: validRewards.cumulative.daily,
      usdReturn: validRewards.cumulative.daily * ethPrice,
      // Calculate daily return as annualized percentage
      returnPercentage: calculateReturn(
        validRewards.cumulative.daily,
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
      duration: '28 Days',
      ethStake: validCalculations.totalStaked,
      ethReward: validRewards.cumulative.monthly,
      usdReturn: validRewards.cumulative.monthly * ethPrice,
      // Calculate monthly return using average month length
      returnPercentage: calculateReturn(
        validRewards.cumulative.monthly,
        validCalculations.totalStaked,
        28
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