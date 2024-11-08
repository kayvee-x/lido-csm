export function calculateDailyRewards({ validators, bondAmount, lidoApr }) {
    const NODE_OPERATOR_FEE = 0.06;
    const LIDO_FEE = 0.10;
  
    const dailyApr = lidoApr / 365;
    
    const bondRebase = (bondAmount * dailyApr * (1 - LIDO_FEE)) / 100;
    const operatorFee = (validators * 32 * dailyApr * NODE_OPERATOR_FEE) / 100;
  
    return {
      bond: bondRebase,
      operator: operatorFee
    };
  }
  
  export function calculateCumulativeRewards(dailyRewards) {
    const total = dailyRewards.bond + dailyRewards.operator;
    
    return {
      weekly: total * 7,
      monthly: total * 30,
      yearly: total * 365
    };
  }
  
  export function generateChartData(rewards) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
  
    return months.map((month, index) => ({
      name: month,
      standard: rewards.comparison.standard,
      csm: rewards.comparison.csm * (1 + index * 0.01) // Adds slight growth trend
    }));
  }
  