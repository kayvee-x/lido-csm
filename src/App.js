import React, { useState, useEffect } from "react";
import { fetchEthPrice, fetchLidoAPR, fetchVanillaStakingAPR } from './utils/api';
import { calculateRewards } from "./utils/calculations";
import { generateChartData } from "./utils/calculations";
import { RewardsBreakdown } from "./components/RewardsBreakdown";
import { YieldComparison } from "./components/YieldComparison";
import { InputSection } from "./components/InputSection";
import { EarningsAnalysis } from "./components/EarningAnalysis";
import { StakingTable } from "./components/StakingTable";
import { BondCurveTables } from "./components/BondCurveTables";
import { formatEth } from "./utils/formatting";
import { bondCurveData } from "./utils/data";
import { frameData } from "./utils/recentData"
import { InfoSection } from "./components/InfoSection";
import { FramePerformanceTable } from './components/performanceTable';
import "./app.css";

function App() {
  const [ethPrice, setEthPrice] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stakingConfig, setStakingConfig] = useState({
    ethAvailable: 32,
    standardYield: 3,
    lidoApr: 3,
    recentApr: 7.6,
    isEA: true,
    stakingDuration: 28
  });
  const [frameMetrics, setFrameMetrics] = useState({
    currentFrame: [],
    epochRewards: 0,
    operatorPerformance: 0
  });


  const [calculations, setCalculations] = useState({
    validators: 0,
    bondAmount: 0,
    totalStaked: 0
  });

  const [rewards, setRewards] = useState({
    daily: { bond: 0, operator: 0, total: 0 },
    cumulative: { weekly: 0, monthly: 0, yearly: 0 },
    comparison: {
      standard: 0,
      csm: 0,
      efficiency: 237 // Set to 237 to display as 2.37x
    }
  });

  const getTimeframeLabel = (days) => {
    if (days === 1) return '24-Hour';
    if (days === 7) return '7-Day';
    if (days === 14) return '14-Day';
    if (days === 28) return '28-Day';
    if (days === 90) return '3-Month';
    if (days === 180) return '6-Month';
    if (days === 365) return '12-Month';
    return `${days}-Day`;
  };

  useEffect(() => {
    const ethAmount = Number(stakingConfig.ethAvailable) || 0;
    const results = calculateRewards(
      ethAmount,
      stakingConfig.isEA,
      stakingConfig.standardYield,
      stakingConfig.recentApr,
      stakingConfig.stakingDuration
    );

    // Calculate bond amount based on EA status
    const bondAmount = stakingConfig.isEA ?
      Math.min(ethAmount, 1.5 + (Math.floor(ethAmount / 32) - 1) * 1.5) : // EA calculation
      Math.min(ethAmount, Math.floor(ethAmount / 32) * 2.4); // Non-EA calculation

    setCalculations(prev => ({
      ...prev,
      bondAmount: bondAmount,
      validators: Math.floor(ethAmount / 32),
      totalStaked: ethAmount
    }));

    const selectedPeriodRewards = {
      bond: (results?.bondRebase || 0) * stakingConfig.stakingDuration,
      operator: (results?.nodeOperatorRewards || 0) * stakingConfig.stakingDuration,
      total: (results?.totalRewards || 0) * stakingConfig.stakingDuration
    };

    const cumulativeRewards = {
      weekly: selectedPeriodRewards.total / (stakingConfig.stakingDuration / 7),
      monthly: selectedPeriodRewards.total / (stakingConfig.stakingDuration / 30),
      yearly: selectedPeriodRewards.total / (stakingConfig.stakingDuration / 365)
    };

    setRewards({
      daily: selectedPeriodRewards,  // Will rename this prop later for clarity
      cumulative: cumulativeRewards,
      comparison: {
        standard: stakingConfig.standardYield,
        csm: stakingConfig.recentApr,
        efficiency: 237
      }
    });
  }, [stakingConfig]);


  useEffect(() => {
    const fetchLiveMetrics = async () => {
      const [ethPrice, lidoApr, vanillaApr] = await Promise.all([
        fetchEthPrice(),
        fetchLidoAPR(),
        fetchVanillaStakingAPR()
      ]);

      setEthPrice(ethPrice);
      setStakingConfig(prev => ({
        ...prev,
        standardYield: vanillaApr,
        lidoApr: lidoApr
      }));
    };

    // Initial fetch
    fetchLiveMetrics();

    // Set up polling interval - every 5 minutes
    const interval = setInterval(fetchLiveMetrics, 300000);
    return () => clearInterval(interval);
  }, []);

  const FALLBACK_PRICE = 3195;
  const RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000; // 1 second

  const fetchEthPrice = async (attempts = 0) => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();

      if (data.ethereum?.usd) {
        return data.ethereum.usd;
      }
      throw new Error('Invalid price data');
    } catch (error) {
      if (attempts < RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchEthPrice(attempts + 1);
      } else {
        return FALLBACK_PRICE;
      }
    }
  };
  useEffect(() => {
    const processFrameMetrics = () => {
      const frameLength = frameData.frame[1] - frameData.frame[0];
      const totalDistributable = frameData.distributable / 1e18;

      // Calculate average operator performance
      const operatorPerformance = Object.values(frameData.operators).reduce((acc, op) => {
        const validators = Object.values(op.validators);
        const performance = validators.reduce((total, val) => {
          return total + (val.perf.included / val.perf.assigned);
        }, 0) / validators.length;
        return acc + performance;
      }, 0) / Object.keys(frameData.operators).length;

      setFrameMetrics({
        currentFrame: frameData.frame,
        epochRewards: totalDistributable,
        operatorPerformance
      });
    };

    processFrameMetrics();
  }, []);

  return (
    <div className="calculator-container">
      <div className="calculator-wrapper">
        <header className="calculator-header">
          <h1 className="calculator-title">CSM Rewards Calculator</h1>
          <p>Calculate your potential rewards from Lido's Community Staking Module</p>
        </header>

        <main className="calculator-content">
          <section className="primary-section">
            <div className="input-wrapper">
              <InputSection config={stakingConfig} onChange={setStakingConfig} />
              <div className="yield-chart-container">
                <YieldComparison
                  standard={rewards.comparison.standard}
                  csm={rewards.comparison.csm}
                  data={generateChartData(rewards)}
                />
              </div>
              <div className="yield-comparison">
                <div className="yield-card">
                  <h4>{stakingConfig.isEA ? 'EA List Metrics' : 'Non-EA List Metrics'} Rewards ({getTimeframeLabel(stakingConfig.stakingDuration)})</h4>
                  <div className="yield-details">
                    <p>Bond Rebase Rewards: {formatEth(rewards.daily.bond)} ETH</p>
                    <p>Node Operator Rewards: {formatEth(rewards.daily.operator)} ETH</p>
                    <p>Total Rewards: {formatEth(rewards.daily.total)} ETH</p>
                  </div>
                </div>
                <div className="yield-card highlight">
                  <h4>Returns & Efficiency</h4>
                  <div className="yield-details">
                    <p>APY on Bond: {rewards.comparison.csm.toFixed(2)}%</p>
                    <p>Multiplier: {(rewards.comparison.efficiency / 100).toFixed(2)}x</p>
                    <p>Total CSM Bond: {formatEth(calculations.bondAmount)} ETH</p>
                  </div>
                </div>
              </div>

            </div>

            <div className="metrics-grid">
              <RewardsBreakdown
                daily={rewards.daily}
                cumulative={rewards.cumulative}
                calculations={{ ...calculations, stakingDuration: stakingConfig.stakingDuration }}
              />
              <EarningsAnalysis
                ethPrice={ethPrice}
                rewards={rewards.cumulative}
              />
            </div>
          </section>

          <section className="analysis-section">
            <StakingTable
              calculations={calculations}
              rewards={rewards}
              ethPrice={ethPrice}
            />
            <FramePerformanceTable
              frameMetrics={frameMetrics}
              ethPrice={ethPrice}
            />
          </section>
          <section className="analysis-section">
            <InfoSection />
            <BondCurveTables bondCurveData={bondCurveData} />

          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
