// Constants
const CONSTANTS = {
  BASE_APR: 0.03,
  LIDO_FEE: 0.10,
  OPERATOR_FEE: 0.06,
  VALIDATOR_SIZE: 32,
  EA_BOND_MIN: 1.5,
  REGULAR_BOND_MIN: 2.4,
  EPOCH_DAYS: 28,
  DAYS_PER_YEAR: 365,
  MONTH_NAMES: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
};

const validateInput = (value, name = 'Value') => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(`${name} must be a valid number`);
  }
  if (value < 0) {
    throw new Error(`${name} cannot be negative`);
  }
};

export const calculateDailyRewards = ({ validators, bondAmount, standardYield = 0.03 }) => {
  validateInput(validators, 'Validators');
  validateInput(bondAmount, 'Bond amount');
  validateInput(standardYield, 'Standard yield');

  const dailyYield = standardYield / CONSTANTS.DAYS_PER_YEAR;
  const bondRewards = bondAmount * dailyYield * 0.9;
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
  validateInput(dailyRewards.total, 'Daily rewards');

  return {
    weekly: dailyRewards.total * 7,
    monthly: dailyRewards.total * 30.44,
    yearly: dailyRewards.total * CONSTANTS.DAYS_PER_YEAR
  };
}

export function calculateAPY(yearlyRewards, bondAmount) {
  validateInput(yearlyRewards, 'Yearly rewards');
  validateInput(bondAmount, 'Bond amount');

  return (yearlyRewards / bondAmount) * 100;
}

export function calculateCapitalEfficiency(csmAPY, standardAPY) {
  validateInput(csmAPY, 'CSM APY');
  validateInput(standardAPY, 'Standard APY');

  return (csmAPY / standardAPY) * 100;
}

export function generateChartData(rewards, months = 12) {
  return Array.from({ length: months }, (_, index) => ({
    name: CONSTANTS.MONTH_NAMES[index % 12],
    standardYield: rewards.comparison.standard,
    csmYield: rewards.comparison.csm,
    cumulativeStandard: rewards.comparison.standard * (1 + index * (rewards.comparison.standard / 1200)),
    cumulativeCSM: rewards.comparison.csm * (1 + index * (rewards.comparison.csm / 1200))
  }));
}

export function calculateValidatorsAndBond(ethAvailable, isEA) {
  validateInput(ethAvailable, 'ETH available');

  const baseRequirement = isEA ? 1.5 : 2.4;
  let validators;
  let bondAmount;

  if (isEA) {
    if (ethAvailable >= 15.8) {
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
  validateInput(validators, 'Validators');
  validateInput(bondRequired, 'Bond required');
  validateInput(standardYield, 'Standard yield');

  const standardYieldDecimal = standardYield / 100;
  const lidoAprDecimal = lidoApr / 100;
  const lidoAprStatic = 3.21 / 100;
  const totalStaked = validators * 32;

  const bondYieldGross = bondRequired * lidoAprStatic;
  const lidoFeeAmount = bondYieldGross * lidoFee;
  const bondYieldNet = bondYieldGross - lidoFeeAmount;

  const totalStakingYield = totalStaked * lidoAprStatic;
  const nodeOperatorFeeYearly = totalStakingYield * nodeOperatorFee;
  
  const totalEarnings = nodeOperatorFeeYearly + bondYieldNet;
  const totalRateOfReturn = (totalEarnings / bondRequired) * 100;
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
  validateInput(ethAvailable, 'ETH available');
  validateInput(standardYield, 'Standard yield');
  validateInput(lidoApr, 'Lido APR');

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
      validators = Math.floor((ethAvailable - 7.6) / 1.3) + 5;
      bondRequired = 7.6 + ((validators - 5) * 1.3);
    } else {
      const multiplier = Math.floor(ethAvailable / 32);
      validators = 23 * multiplier;
      bondRequired = 31 * multiplier;
    }
  }

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
    bondRebase: yearlyValues.bondYieldNet / CONSTANTS.DAYS_PER_YEAR,
    nodeOperatorRewards: yearlyValues.nodeOperatorFee / CONSTANTS.DAYS_PER_YEAR,
    totalRewards: yearlyValues.totalEarnings / CONSTANTS.DAYS_PER_YEAR,
    apy: yearlyValues.totalRateOfReturn,
    capitalEfficiency: yearlyValues.csmMultiplier * 100,
    bondYieldNet: yearlyValues.bondYieldNet
  };
};

export const getValidatorCount = (ethAmount, isEA) => {
  validateInput(ethAmount, 'ETH amount');

  if (isEA) {
    if (ethAmount < 1.5) return 0;
    if (ethAmount === 2) return 1;
    if (ethAmount === 8) return 6;
    if (ethAmount === 15.8) return 12;
    if (ethAmount === 32) return 24;
    if (ethAmount > 32) {
      const additionalValidators = Math.floor((ethAmount - 31.4) / 1.3);
      return 24 + additionalValidators;
    }
    return Math.floor((ethAmount - 1.5) / 1.3) + 1;
  } else {
    if (ethAmount < 2.4) return 0;
    if (ethAmount === 2.4) return 1;
    if (ethAmount === 8) return 5;
    if (ethAmount === 32) return 23;
    if (ethAmount > 32) {
      const additionalValidators = Math.floor((ethAmount - 31) / 1.3);
      return 23 + additionalValidators;
    }
    return Math.floor((ethAmount - 2.4) / 1.3) + 1;
  }
};

export const generateComparisonData = (calculations, rewards) => {
  const annualRewards = {
    bondRebase: calculations.bondAmount * 0.03 * 0.9,
    operatorRewards: calculations.validators * (32 * 0.03 * 0.06)
  };

  return [
    {
      period: '1d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) / CONSTANTS.DAYS_PER_YEAR,
      vanilla: (calculations.totalStaked * 0.03) / CONSTANTS.DAYS_PER_YEAR
    },
    {
      period: '7d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (7 / CONSTANTS.DAYS_PER_YEAR),
      vanilla: (calculations.totalStaked * 0.03 * 7) / CONSTANTS.DAYS_PER_YEAR
    },
    {
      period: '14d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (14 / CONSTANTS.DAYS_PER_YEAR),
      vanilla: (calculations.totalStaked * 0.03 * 14) / CONSTANTS.DAYS_PER_YEAR
    },
    {
      period: '28d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (28 / CONSTANTS.DAYS_PER_YEAR),
      vanilla: (calculations.totalStaked * 0.03 * 28) / CONSTANTS.DAYS_PER_YEAR
    },
    {
      period: '90d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (90 / CONSTANTS.DAYS_PER_YEAR),
      vanilla: (calculations.totalStaked * 0.03 * 90) / CONSTANTS.DAYS_PER_YEAR
    },
    {
      period: '180d',
      csm: (annualRewards.bondRebase + annualRewards.operatorRewards) * (180 / CONSTANTS.DAYS_PER_YEAR),
      vanilla: (calculations.totalStaked * 0.03 * 180) / CONSTANTS.DAYS_PER_YEAR
    },
    {
      period: '365d',
      csm: annualRewards.bondRebase + annualRewards.operatorRewards,
      vanilla: calculations.totalStaked * 0.03
    }
  ];
};

export const convertToDaily = (yearlyValues) => {
  return {
    nodeOperatorFee: yearlyValues.nodeOperatorFee / CONSTANTS.DAYS_PER_YEAR,
    bondYieldNet: yearlyValues.bondYieldNet / CONSTANTS.DAYS_PER_YEAR,
    totalEarnings: yearlyValues.totalEarnings / CONSTANTS.DAYS_PER_YEAR
  };
};

export const calculateEpochData = (startDate = new Date()) => {
  const epochStart = new Date(startDate);
  const epochEnd = new Date(startDate);
  epochEnd.setDate(epochEnd.getDate() + CONSTANTS.EPOCH_DAYS);
  
  return {
    startDate: epochStart,
    endDate: epochEnd,
    epochNumber: Math.floor(startDate.getTime() / (CONSTANTS.EPOCH_DAYS * 24 * 60 * 60 * 1000))
  };
};

export const calculateEpochAPR = (rewards, stake, epoch) => {
  validateInput(rewards, 'Rewards');
  validateInput(stake, 'Stake');
  validateInput(epoch, 'Epoch');

  const annualizedReturn = (rewards / stake) * (CONSTANTS.DAYS_PER_YEAR / CONSTANTS.EPOCH_DAYS);
  return {
    epoch,
    apr: annualizedReturn * 100,
    rewards,
    stake
  };
};

export const fetchRealAPRData = async () => {
  try {
    const [lidoResponse, vanillaResponse] = await Promise.all([
      fetch('https://stake.lido.fi/api/apr'),
      fetch('https://beaconcha.in/api/v1/epoch/latest')
    ]);

    const [lidoData, vanillaData] = await Promise.all([
      lidoResponse.json(),
      vanillaResponse.json()
    ]);

    return {
      lidoApr: lidoData.apr,
      vanillaApr: vanillaData.apr
    };
  } catch (error) {
    console.error('Error fetching APR data:', error);
    return {
      lidoApr: 3,
      vanillaApr: 3
    };
  }
};
const calculateReturn = (reward, stake, bondAmount, days) => {
  if (!stake || stake === 0) return 0;
  const annualReturn = (reward / stake) * (CONSTANTS.DAYS_PER_YEAR / days);
  return annualReturn * 100;
};

const validateInputs = (calculations, rewards, ethPrice) => {
  return {
    totalStaked: calculations?.totalStaked || 0,
    bondAmount: calculations?.bondAmount || 0,
    rewards: {
      cumulative: {
        daily: rewards?.cumulative?.daily || 0,
        weekly: rewards?.cumulative?.weekly || 0,
        monthly: rewards?.cumulative?.monthly || 0,
        yearly: rewards?.cumulative?.yearly || 0
      }
    },
    ethPrice: Number(ethPrice) || 0
  };
};

export const generateEarningsData = (rewards, ethPrice = 0) => {
  const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'];
  const validEthPrice = Number(ethPrice) || 0;

  return months.map((month, index) => ({
    month: `${month} 2025`,
    earnings: (rewards?.monthly || 0) * (index * 2 + 1) * validEthPrice
  }));
};

export const generateStakingData = (calculations, rewards, ethPrice) => {
  const validatedData = validateInputs(calculations, rewards, ethPrice);

  const timeframes = [
    { duration: '24 Hours', days: 1, rewardKey: 'daily' },
    { duration: '7 Days', days: 7, rewardKey: 'weekly' },
    { duration: '28 Days', days: 28, rewardKey: 'monthly' },
    { duration: '365 Days', days: 365, rewardKey: 'yearly' }
  ];

  return timeframes.map(({ duration, days, rewardKey }) => {
    const reward = validatedData.rewards.cumulative[rewardKey];
    return {
      duration,
      ethStake: validatedData.totalStaked,
      ethReward: reward,
      usdReturn: reward * validatedData.ethPrice,
      returnPercentage: calculateReturn(
        reward,
        validatedData.totalStaked,
        validatedData.bondAmount,
        days
      )
    };
  });
};

