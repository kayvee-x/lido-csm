export function calculateDailyRewards({ validators, bondAmount, lidoApr }) {
  // Constants from documentation
  const NODE_OPERATOR_FEE = 0.06; // 6%
  const LIDO_FEE = 0.10; // 10%
  const VALIDATOR_BALANCE = 32; // ETH

  // Convert APR to daily rate
  const dailyApr = lidoApr / 365 / 100; // Convert percentage to decimal and to daily

  // Calculate bond rebase rewards
  // Formula: bond * APR * (1 - protocol fee)
  const bondRebase = bondAmount * dailyApr * (1 - LIDO_FEE);

  // Calculate node operator rewards
  // Formula: validators * 32 ETH * APR * operator fee
  // Note: Based on full 32 ETH, not (32 - bond) as specified in docs
  const operatorFee = validators * VALIDATOR_BALANCE * dailyApr * NODE_OPERATOR_FEE;

  return {
    bond: bondRebase,
    operator: operatorFee,
    total: bondRebase + operatorFee
  };
}

export function calculateCumulativeRewards(dailyRewards) {
  return {
    weekly: dailyRewards.total * 7,
    monthly: dailyRewards.total * 30.44, // Using average month length
    yearly: dailyRewards.total * 365
  };
}

export function calculateAPY(yearlyRewards, bondAmount) {
  return (yearlyRewards / bondAmount) * 100;
}

export function calculateCapitalEfficiency(csmAPY, standardAPY) {
  return (csmAPY / standardAPY) * 100;
}

export function generateChartData(rewards, months = 12) {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return Array.from({ length: months }, (_, index) => ({
    name: monthNames[index % 12],
    standardYield: rewards.comparison.standard,
    csmYield: rewards.comparison.csm,
    // Compound interest calculation for cumulative returns
    cumulativeStandard: rewards.comparison.standard * (1 + index * (rewards.comparison.standard / 1200)),
    cumulativeCSM: rewards.comparison.csm * (1 + index * (rewards.comparison.csm / 1200))
  }));
}

export function calculateValidatorsAndBond(ethAvailable, isEA) {
  // Early Adoption bonding curve starts at 1.5 ETH for first validator
  // Regular bonding curve requires 2.4 ETH per validator
  const baseRequirement = isEA ? 1.5 : 2.4;
  
  let validators;
  let bondAmount;

  if (isEA) {
    if (ethAvailable >= 15.8) {
      // Max 12 validators during EA phase
      validators = 12;
      bondAmount = 15.8;
    } else {
      validators = Math.floor(ethAvailable / baseRequirement);
      bondAmount = validators * baseRequirement;
    }
  } else {
    validators = Math.floor(ethAvailable / baseRequirement);
    bondAmount = validators * baseRequirement;
  }

  return {
    validators,
    bondAmount,
    totalStaked: validators * 32
  };
}