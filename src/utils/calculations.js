export const calculateDailyRewards = ({ validators, bondAmount, lidoApr }) => {
  // Convert APR to daily rate
  const dailyRate = lidoApr / 365 / 100;
  
  // Bond rewards with 10% reduction
  const bondRewards = bondAmount * dailyRate * 0.9;
  
  // Validator rewards with 6% commission
  const operatorRewards = validators * (32 * dailyRate * 0.06);
  
  // Total daily rewards
  const totalRewards = bondRewards + operatorRewards;

  return {
    bond: bondRewards,
    operator: operatorRewards,
    total: totalRewards
  };
};


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

export const calculateRewards = (ethAvailable, isEA) => {
  const defaultValues = {
    validators: 0,
    bondRequired: 0,
    bondRebase: 0,
    nodeOperatorRewards: 0,
    totalRewards: 0,
    apy: 0,
    capitalEfficiency: 0,
    bondYieldNet: 0
  };

  if (!ethAvailable || ethAvailable <= 0) {
    return defaultValues;
  }

  let validators, bondRequired;

  if (isEA) {
    if (ethAvailable <= 2) {
      validators = 1;
      bondRequired = 1.5;
    } else if (ethAvailable <= 8) {
      validators = 6;
      bondRequired = 8;
    } else if (ethAvailable <= 15.8) {
      validators = 12;
      bondRequired = 15.8;
    } else {
      // Scale validators and bond for larger amounts
      const multiplier = Math.floor(ethAvailable / 32);
      validators = 24 * multiplier;
      bondRequired = 31.4 * multiplier;
    }
  } else {
    if (ethAvailable <= 2.4) {
      validators = 1;
      bondRequired = 2.4;
    } else if (ethAvailable <= 8) {
      validators = 5;
      bondRequired = 7.6;
    } else {
      // Scale validators and bond for larger amounts
      const multiplier = Math.floor(ethAvailable / 32);
      validators = 23 * multiplier;
      bondRequired = 31 * multiplier;
    }
  }

  const yearlyValues = calculateYearlyValues(validators, bondRequired, 0.03, 0.06, 0.10);

  return {
    validators,
    bondRequired,
    bondRebase: yearlyValues.bondYieldNet / 365,
    nodeOperatorRewards: yearlyValues.nodeOperatorFee / 365,
    totalRewards: yearlyValues.totalEarnings / 365,
    apy: yearlyValues.totalRateOfReturn,
    capitalEfficiency: yearlyValues.csmMultiplier * 100,
    bondYieldNet: yearlyValues.bondYieldNet
  };
};



export const calculateYearlyValues = (validators, bondRequired, standardYield, nodeOperatorFee, lidoFee) => {
  const totalStaked = validators * 32;
  const totalStakingYield = totalStaked * standardYield;
  const nodeOperatorFeeYearly = totalStakingYield * nodeOperatorFee;
  
  const bondYieldGross = bondRequired * standardYield;
  const lidoFeeAmount = bondYieldGross * lidoFee;
  const bondYieldNet = bondYieldGross - lidoFeeAmount;
  
  const totalEarnings = nodeOperatorFeeYearly + bondYieldNet;
  const totalRateOfReturn = (totalEarnings / bondRequired) * 100;
  const csmMultiplier = totalRateOfReturn / (standardYield * 100);

  return {
    nodeOperatorFee: nodeOperatorFeeYearly,
    bondYieldNet,
    totalEarnings,
    totalRateOfReturn,
    csmMultiplier
  };
};


export const convertToDaily = (yearlyValues) => {
  return {
    nodeOperatorFee: yearlyValues.nodeOperatorFee / 365,
    bondYieldNet: yearlyValues.bondYieldNet / 365,
    totalEarnings: yearlyValues.totalEarnings / 365
  };
};
