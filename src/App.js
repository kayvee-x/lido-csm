import React, { useState, useEffect } from "react";
import { fetchEthPrice, fetchLidoAPR, fetchVanillaStakingAPR } from './utils/api';
import { ArrowUpDown } from 'lucide-react';
import { calculateRewards, performCalculations } from "./utils/calculations";
import { RewardsBreakdown } from "./components/RewardsBreakdown";
import { YieldComparison } from "./components/YieldComparison";
import { InputSection } from "./components/InputSection";
import { EarningsAnalysis } from "./components/EarningAnalysis";
import { StakingTable } from "./components/StakingTable";
import { BondCurveTables } from "./components/BondCurveTables";
import { formatEth } from "./utils/formatting";
import { bondCurveData } from "./utils/data";
import { frameData } from "./utils/recentData";
import { InfoSection } from "./components/InfoSection";
import { FramePerformanceTable } from './components/performanceTable';
import { OperatorAllocation } from "./components/OperatorAllocation";
import { getQueueData } from './utils/queueTracker';

import "./app.css";

function App() {
  const [ethPrice, setEthPrice] = useState(null);
  const [activeTab, setActiveTab] = useState('staking');
  const [isLoading, setIsLoading] = useState(false);
  const [operatorRewards, setOperatorRewards] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [queueSearchId, setQueueSearchId] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);


  const [stakingConfig, setStakingConfig] = useState({
    ethAvailable: 32,
    standardYield: 3,
    lidoApr: 3,
    recentApr: 7.6,
    isEA: true,
    stakingDuration: 28,
  });

  const [frameMetrics, setFrameMetrics] = useState({
    currentFrame: [],
    epochRewards: 0,
    operatorPerformance: 0,
  });

  const [calculations, setCalculations] = useState({
    validators: 0,
    bondAmount: 0,
    totalStaked: 0,
  });

  const handleConfigChange = async (newConfig) => {
    setStakingConfig(newConfig);
    if (newConfig.operatorRewards) {
      setOperatorRewards(newConfig.operatorRewards);
    }
  };

  const [rewards, setRewards] = useState({
    daily: { bond: 0, operator: 0, total: 0 },
    cumulative: { weekly: 0, monthly: 0, yearly: 0 },
    comparison: {
      standard: 0,
      csm: 0,
      efficiency: 237,
    },
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
    const { validators, bondRequired } = performCalculations(stakingConfig, ethAmount);

    const results = calculateRewards(
      ethAmount,
      stakingConfig.isEA,
      stakingConfig.standardYield,
      stakingConfig.lidoApr
    );

    setCalculations(prev => ({
      ...prev,
      bondAmount: bondRequired,
      validators: validators,
      totalStaked: ethAmount,
    }));

    const selectedPeriodRewards = {
      bond: (results?.bondRebase || 0) * stakingConfig.stakingDuration,
      operator: (results?.nodeOperatorRewards || 0) * stakingConfig.stakingDuration,
      total: (results?.totalRewards || 0) * stakingConfig.stakingDuration,
    };

    const cumulativeRewards = {
      daily: selectedPeriodRewards.total / (stakingConfig.stakingDuration / 1),
      weekly: selectedPeriodRewards.total / (stakingConfig.stakingDuration / 7),
      monthly: selectedPeriodRewards.total / (stakingConfig.stakingDuration / 28),
      yearly: selectedPeriodRewards.total / (stakingConfig.stakingDuration / 365),
    };

    setRewards({
      daily: selectedPeriodRewards,
      cumulative: cumulativeRewards,
      comparison: {
        standard: stakingConfig.standardYield,
        csm: results?.apy || 0,
        efficiency: 237,
      },
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

    const interval = setInterval(fetchLiveMetrics, 300000);
    return () => clearInterval(interval);
  }, []);

  const FALLBACK_PRICE = 3985;
  const RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 1000; // 1 second

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
  useEffect(() => {
    fetchQueueData();
  }, []);

  const fetchQueueData = async () => {
    setIsRefreshing(true);
    try {
      const data = await getQueueData();
      setQueueData(data);
    } catch (error) {
      console.error("Error fetching queue data:", error);
    }
    setIsRefreshing(false);
  };


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
              <InputSection
                config={stakingConfig}
                onChange={handleConfigChange}
                isLoading={isLoading}
              />
              <div className="yield-chart-container">
                <YieldComparison
                  standard={rewards.comparison.standard}
                  csm={rewards.comparison.csm}
                  config={stakingConfig}
                  operatorRewards={operatorRewards}
                />
                {/* <RebaseHistory bondAmount={calculations.bondAmount} /> */}


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
                    <p>Total CSM Bond Required: {formatEth(calculations.bondAmount)} ETH</p>
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
          <div className="upgrade-notification">
            <div className="notification-content">
              <span className="notification-icon">🗳️</span>
              <p>
                CSM transitioned to the Permissionless Phase as of January 31, 2025.
                <a
                  href="https://vote.lido.fi/vote/183"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Voting Results
                </a>
              </p>
            </div>
          </div>
          <section className="analysis-section">
            <div className="table-tabs">
              <button
                className={`tab-button ${activeTab === 'staking' ? 'active' : ''}`}
                onClick={() => setActiveTab('staking')}
              >
                <h3>Reward Estimate</h3>
              </button>
              <button
                className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveTab('performance')}
              >
                <h3>Recent Reward Distribution</h3>
              </button>
              <button
                className={`tab-button ${activeTab === 'queueStatus' ? 'active' : ''}`}
                onClick={() => setActiveTab('queueStatus')}
              >
                <h3>View Queue Status (WIP) </h3>
              </button>
              <button
                className={`tab-button ${activeTab === 'bondCurve' ? 'active' : ''}`}
                onClick={() => setActiveTab('bondCurve')}
              >
                <h3>Bond Curve</h3>
              </button>
              <button
                className={`tab-button ${activeTab === 'operators' ? 'active' : ''}`}
                onClick={() => setActiveTab('operators')}
              >
                <h3>CSM Operators</h3>
              </button>
            </div>

            <div className="table-content">
              {activeTab === 'staking' && (
                <StakingTable
                  calculations={calculations}
                  rewards={rewards}
                  ethPrice={ethPrice}
                />
              )}
              {activeTab === 'performance' && (
                <FramePerformanceTable
                  frameMetrics={frameMetrics}
                  ethPrice={ethPrice}
                />
              )}
              {activeTab === 'bondCurve' && (
                <BondCurveTables bondCurveData={bondCurveData} />
              )}
              {activeTab === 'operators' && (
                <OperatorAllocation />
              )}
              {activeTab === 'queueStatus' && (
                <div className="bond-curve-container">
                  <div className="table-controls">
                    <div className="search-refresh">
                      <input
                        type="text"
                        placeholder="Search Node Operator ID..."
                        value={queueSearchId}
                        onChange={(e) => setQueueSearchId(e.target.value)}
                        className="search-input"
                      />
                      <button
                        onClick={fetchQueueData}
                        className="refresh-button"
                        disabled={isRefreshing}
                      >
                        {isRefreshing ? 'Refreshing...' : '🔄 Refresh'}
                      </button>
                    </div>
                  </div>

                  <div className="table-wrapper">
                    {queueData ? (
                      <>
                        {queueData?.summary && (
                          <div className="summary-section">
                            <div className="summary-item">
                              <span>Total Batches:</span>
                              <span>{queueData.summary.totalBatches}</span>
                            </div>
                            <div className="summary-item">
                              <span>Total Keys:</span>
                              <span>{queueData.summary.totalKeys}</span>
                            </div>
                            {queueData.summary.found && (
                              <div className="summary-item">
                                <span>Keys Before Your Batch:</span>
                                <span>{queueData.summary.keysInFront}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <table className="bond-table">
                          <thead>
                            <tr>
                              <th>Position</th>
                              <th>Node Operator ID</th>
                              <th>Keys</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {queueData.entries
                              .filter(entry =>
                                !queueSearchId ||
                                entry.noId.startsWith(queueSearchId.trim())
                              )


                              .map(entry => (
                                <tr key={entry.position}
                                  className={entry.noId === queueSearchId ? 'highlight' : ''}>
                                  <td>{entry.position}</td>
                                  <td>{entry.noId}</td>
                                  <td>{entry.keysCount}</td>
                                  <td>{entry.noId === queueSearchId ? '⏳ pending' : '⏳ pending'}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <div className="queue-message">Loading queue data...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
          <section className="analysis-section">
            <div className="upgrade-notification">
              <div className="notification-content">
                <span className="notification-icon">🔔</span>
                <p>
                  Proposed CSM upgrade coming soon! Check out the
                  <a
                    href="https://research.lido.fi/t/community-staking-module/5917/75"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    proposal details
                  </a>
                </p>
              </div>
            </div>
            <InfoSection />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
