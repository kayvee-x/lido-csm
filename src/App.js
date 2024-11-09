import React, { useState, useEffect } from "react";
import { Line } from "recharts";
import { calculateDailyRewards, calculateCumulativeRewards, generateChartData, calculateValidatorsAndBond, calculateAPY, calculateCapitalEfficiency } from "./utils/calculations";
import { RewardsBreakdown } from "./components/RewardsBreakdown";
import { YieldComparison } from "./components/YieldComparison";
import { InputSection } from "./components/InputSection";
import { EarningsAnalysis } from "./components/EarningAnalysis";
import { StakingTable } from "./components/StakingTable";
import { BondCurveTables } from "./components/BondCurveTables";
import "./app.css";

function App() {
  // Core state
  const [stakingConfig, setStakingConfig] = useState({
    ethAvailable: 32,
    standardYield: 3,
    isEA: true,
    lidoApr: 4 // Ensure this is the APR in percentage
  });

  // Rewards state
  const [rewards, setRewards] = useState({
    daily: { bond: 0, operator: 0 },
    cumulative: { weekly: 0, monthly: 0, yearly: 0 },
    comparison: { standard: 0, csm: 0 }
  });

  // Calculated values
  const [calculations, setCalculations] = useState({
    validators: 0,
    bondAmount: 0,
    totalStaked: 0
  });

  const bondCurveData = {
    nonEAMainnet: Array.from({ length: 50 }, (_, i) => ({
      validators: i + 1,
      bondForValidator: (2.4 + (i * 0.2)).toFixed(1),
      capital: ((2.4 + (i * 0.2)) * (i + 1)).toFixed(1),
      multiplier: `${(170 + (i * 10)).toFixed(2)}%`
    })),
    
    eaMainnet: Array.from({ length: 50 }, (_, i) => ({
      validators: i + 1,
      bondForValidator: (1.5 + (i * 0.2)).toFixed(1),
      capital: ((1.5 + (i * 0.2)) * (i + 1)).toFixed(1),
      multiplier: `${(218 + (i * 7)).toFixed(2)}%`
    })),
    
    nonEATestnet: Array.from({ length: 50 }, (_, i) => ({
      validators: i + 1,
      bondForValidator: (2.0 + (i * 0.2)).toFixed(1),
      capital: ((2.0 + (i * 0.2)) * (i + 1)).toFixed(1),
      multiplier: `${(202 + (i * 8)).toFixed(2)}%`
    }))
  };
  useEffect(() => {
    if (stakingConfig.ethAvailable > 0) {
      // Calculate validators and bond
      const { validators, bondAmount, totalStaked } = calculateValidatorsAndBond(
        stakingConfig.ethAvailable,
        stakingConfig.isEA
      );

      // Update calculations
      setCalculations({ validators, bondAmount, totalStaked });

      // Calculate rewards
      const dailyRewards = calculateDailyRewards({
        validators,
        bondAmount,
        lidoApr: stakingConfig.lidoApr // Ensure APR is passed correctly
      });

      const cumulativeRewards = calculateCumulativeRewards(dailyRewards);
      const csmAPY = calculateAPY(cumulativeRewards.yearly, bondAmount);

      // Update rewards state
      setRewards({
        daily: dailyRewards,
        cumulative: cumulativeRewards,
        comparison: {
          standard: stakingConfig.standardYield,
          csm: csmAPY,
          efficiency: calculateCapitalEfficiency(csmAPY, stakingConfig.standardYield)
        }
      });
    }
  }, [stakingConfig]);

  const ETH_PRICE = 3050; // You can make this dynamic with an API call

  return (
    <div className="calculator-container">
      <div className="calculator-wrapper">
        <header className="calculator-header">
          <h1 className="calculator-title">
            CSM Rewards Calculator
          </h1>
          <p>
            Calculate your potential rewards from Lido's Community Staking Module
          </p>
        </header>

        <main className="calculator-content">
          <section className="primary-section">
            <div className="input-wrapper">
              <InputSection
                config={stakingConfig}
                onChange={setStakingConfig}
              />

              <YieldComparison
                standard={rewards.comparison.standard}
                csm={rewards.comparison.csm}
                data={generateChartData(rewards)}
              />
              <div className="yield-comparison">
                <div className="yield-card">
                  <h4>Standard Staking Power</h4>
                  <span className="yield-value">Base Network Impact</span>
                  <div className="yield-details">
                    <p>Network Validators: {calculations.validators}</p>
                    <p>Voting Power: {(calculations.totalStaked * 0.01).toFixed(2)}%</p>
                  </div>
                </div>

                <div className="yield-card highlight">
                  <h4>CSM Enhanced Power</h4>
                  <span className="yield-value">Amplified Network Impact</span>
                  <div className="yield-details">
                    <p>Governance Weight: {(calculations.totalStaked * 0.15).toFixed(2)}%</p>
                    <p>Network Multiplier: {(1 + calculations.bondAmount / 100).toFixed(2)}x</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="metrics-grid">
              <RewardsBreakdown
                daily={rewards.daily}
                cumulative={rewards.cumulative}
                calculations={calculations}
              />

              <EarningsAnalysis
                ethPrice={ETH_PRICE}
                rewards={rewards.cumulative}
              />
            </div>
          </section>

          <section className="analysis-section">
            <StakingTable
              calculations={calculations}
              rewards={rewards}
              ethPrice={ETH_PRICE}
            />
            <BondCurveTables bondCurveData={bondCurveData} />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;