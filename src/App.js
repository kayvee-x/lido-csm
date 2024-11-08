import React, { useState, useEffect } from "react";
import { Line } from "recharts";
import { calculateDailyRewards, calculateCumulativeRewards, generateChartData } from "./utils/calculations";
import { RewardsBreakdown } from "./components/RewardsBreakdown";
import { YieldComparison } from "./components/YieldComparison";
import { InputSection } from "./components/InputSection";
import { EarningsAnalysis } from "./components/EarningAnalysis";
import { StakingTable } from "./components/StakingTable";
import "./app.css";

function App() {
  // Core state
  const [stakingConfig, setStakingConfig] = useState({
    ethAvailable: 32,
    standardYield: 3,
    isEA: true,
    lidoApr: 4
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

  useEffect(() => {
    if (stakingConfig.ethAvailable > 0) {
      // Calculate validators and bond
      const validators = Math.floor(stakingConfig.ethAvailable / 32);
      const bondAmount = stakingConfig.isEA ? 
        Math.min(15.8, validators * 1.3) : 
        validators * 1.3;

      // Update calculations
      setCalculations({
        validators,
        bondAmount,
        totalStaked: validators * 32
      });

      // Calculate rewards
      const dailyRewards = calculateDailyRewards({
        validators,
        bondAmount,
        lidoApr: stakingConfig.lidoApr
      });

      const cumulativeRewards = calculateCumulativeRewards(dailyRewards);

      // Update rewards state
      setRewards({
        daily: dailyRewards,
        cumulative: cumulativeRewards,
        comparison: {
          standard: stakingConfig.standardYield,
          csm: (cumulativeRewards.yearly / bondAmount) * 100
        }
      });
    }
  }, [stakingConfig]);

  const ETH_PRICE = 2808; // You can make this dynamic with an API call

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
            <InputSection 
              config={stakingConfig}
              onChange={setStakingConfig}
            />

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
              {/* <YieldComparison 
                standard={rewards.comparison.standard}
                csm={rewards.comparison.csm}
                data={generateChartData(rewards)}
              /> */}
            </div>
          </section>

          <section className="analysis-section">
            {/* <EarningsAnalysis 
              ethPrice={ETH_PRICE}
              rewards={rewards.cumulative}
            /> */}
            <StakingTable 
              calculations={calculations}
              rewards={rewards}
              ethPrice={ETH_PRICE}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;