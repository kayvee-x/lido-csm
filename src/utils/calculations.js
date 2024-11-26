export const calculateDailyRewards = ({ validators, bondAmount, standardYield = 0.03 }) => {
  // Standard yield is 3% annually
  const dailyYield = standardYield / 365;
  
  // Calculate bond rebase rewards (with 10% Lido fee)
  const bondRewards = bondAmount * dailyYield * 0.9;
  
  // Calculate node operator rewards (6% of total staking yield)
  const totalStaked = validators * 32;
  const totalDailyYield = totalStaked * dailyYield;
  const operatorRewards = totalDailyYield * 0.06;
  
  return {
    bond: bondRewards,
    operator: operatorRewards,
    total: bondRewards + operatorRewards
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



export const calculateYearlyValues = (validators, bondRequired, standardYield, nodeOperatorFee, lidoFee, lidoApr = standardYield) => {
  // Convert percentages to decimals
  const standardYieldDecimal = standardYield / 100;
  const lidoAprDecimal = lidoApr / 100;
  
  const totalStaked = validators * 32;
  
  // Use Lido APR for bond rewards calculation
  const bondYieldGross = bondRequired * lidoAprDecimal;
  const lidoFeeAmount = bondYieldGross * lidoFee;
  const bondYieldNet = bondYieldGross - lidoFeeAmount;
  
  // Use Lido APR for node operator rewards calculation
  const totalStakingYield = totalStaked * lidoAprDecimal;
  const nodeOperatorFeeYearly = totalStakingYield * nodeOperatorFee;
  
  const totalEarnings = nodeOperatorFeeYearly + bondYieldNet;
  const totalRateOfReturn = (totalEarnings / bondRequired) * 100;
  
  // Calculate capital efficiency against standard yield
  const standardReturn = standardYieldDecimal * 100;
  const csmMultiplier = totalRateOfReturn / standardReturn;

  return {
    nodeOperatorFee: nodeOperatorFeeYearly,
    bondYieldNet,
    totalEarnings,
    totalRateOfReturn,
    csmMultiplier
  };
};

export const calculateRewards = (ethAvailable, isEA, standardYield = 3, lidoApr = 4) => {
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
    } else if (ethAvailable <= 32) {
      // Handle amounts between 15.8 and 32
      validators = Math.floor((ethAvailable - 15.8) / 1.3) + 12;
      bondRequired = 15.8 + ((validators - 12) * 1.3);
    } else {
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
    } else if (ethAvailable <= 32) {
      // Handle amounts between 8 and 32
      validators = Math.floor((ethAvailable - 7.6) / 1.3) + 5;
      bondRequired = 7.6 + ((validators - 5) * 1.3);
    } else {
      const multiplier = Math.floor(ethAvailable / 32);
      validators = 23 * multiplier;
      bondRequired = 31 * multiplier;
    }
  }

  // Rest of the calculation remains the same
  const yearlyValues = calculateYearlyValues(
    validators, 
    bondRequired,
    standardYield,
    0.06,
    0.10,
    lidoApr
  );

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



export const convertToDaily = (yearlyValues) => {
  return {
    nodeOperatorFee: yearlyValues.nodeOperatorFee / 365,
    bondYieldNet: yearlyValues.bondYieldNet / 365,
    totalEarnings: yearlyValues.totalEarnings / 365
  };
};

// export const EPOCH_DAYS = 28;

// export const calculateEpochData = (startDate = new Date()) => {
//   const epochStart = new Date(startDate);
//   const epochEnd = new Date(startDate);
//   epochEnd.setDate(epochEnd.getDate() + EPOCH_DAYS);
  
//   return {
//     startDate: epochStart,
//     endDate: epochEnd,
//     epochNumber: Math.floor(startDate.getTime() / (EPOCH_DAYS * 24 * 60 * 60 * 1000))
//   };
// };

// export const calculateEpochAPR = (rewards, stake, epoch) => {
//   const annualizedReturn = (rewards / stake) * (365 / EPOCH_DAYS);
//   return {
//     epoch: epoch,
//     apr: annualizedReturn * 100,
//     rewards: rewards,
//     stake: stake
//   };
// };