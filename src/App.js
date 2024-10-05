import React, { useState, useEffect } from "react";
import "./styles.css";

function App() {
  const [activeTab, setActiveTab] = useState("summary");
  const [ethAmount, setEthAmount] = useState("");
  const [bondAmount, setBondAmount] = useState(0);
  const [potentialRewards, setPotentialRewards] = useState(0);

  const BOND_CURVE_MIN = 1.5;
  const BOND_CURVE_MAX = 2;
  const REWARDS_RATE = 0.07; // 7% of total rewards
  const ANNUAL_ETH_REWARDS_ESTIMATE = 0.04; // 4% annual ETH rewards (rough estimate)

  const csmInfo = {
    summary: `Community Staking Module (CSM) is the Lido on Ethereum protocol's first module with permissionless entry, allowing any node operator to operate validators by providing an ETH-based bond.`,
    vision: `The ultimate goal for this module is to allow for permissionless entry to the Lido on Ethereum Node Operator set and enfranchise solo-staker participation in the protocol, increasing the total number of independent Node Operators in the overall Ethereum network.`,
    characteristics: [
      "Operators Onboarding: Permissionless with additional permissioned Early Adoption period",
      "Bond Required: from 2 to 1.5 Holesky ETH based on the Bond Curve for CSM testnet",
      "Rewards Rate: 10% total rewards share (3% to treasury, 7% to the module)",
      "DVT: Optional",
      "Maximum Stake Limit: 10%, subject to further increases by the DAO",
    ],
    status: [
      "CSM is live and fully permissionless on Holesky testnet",
      "On December 15th, the Lido DAO gave the green light for the development of Community Staking Module",
      "Early Adoption mode ended on July 11, 2024, and CSM Testnet is now in fully permissionless state",
    ],
  };

  const calculateBond = (amount) => {
    return Math.min(
      BOND_CURVE_MAX,
      Math.max(BOND_CURVE_MIN, BOND_CURVE_MIN + parseFloat(amount) * 0.01)
    );
  };

  const calculateRewards = (amount) => {
    return parseFloat(amount) * ANNUAL_ETH_REWARDS_ESTIMATE * REWARDS_RATE;
  };

  useEffect(() => {
    if (ethAmount) {
      setBondAmount(calculateBond(ethAmount));
      setPotentialRewards(calculateRewards(ethAmount));
    } else {
      setBondAmount(0);
      setPotentialRewards(0);
    }
  }, [ethAmount]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lido Community Staking Module Dashboard</h1>
      </header>
      <main>
        <nav>
          <button onClick={() => setActiveTab("summary")}>Summary</button>
          <button onClick={() => setActiveTab("vision")}>Vision</button>
          <button onClick={() => setActiveTab("characteristics")}>
            Characteristics
          </button>
          <button onClick={() => setActiveTab("status")}>Status</button>
          <button onClick={() => setActiveTab("calculator")}>Calculator</button>
        </nav>
        <section className="content">
          {activeTab === "summary" && <p>{csmInfo.summary}</p>}
          {activeTab === "vision" && <p>{csmInfo.vision}</p>}
          {activeTab === "characteristics" && (
            <ul>
              {csmInfo.characteristics.map((char, index) => (
                <li key={index}>{char}</li>
              ))}
            </ul>
          )}
          {activeTab === "status" && (
            <ul>
              {csmInfo.status.map((status, index) => (
                <li key={index}>{status}</li>
              ))}
            </ul>
          )}
          {activeTab === "calculator" && (
            <div className="calculator">
              <h2>CSM Calculator</h2>
              <div className="input-section">
                <label htmlFor="ethInput">Enter ETH amount:</label>
                <input
                  disabled
                  id="ethInput"
                  type="number"
                  value={ethAmount}
                  onChange={(e) => setEthAmount(e.target.value)}
                  placeholder="Enter ETH amount"
                />
              </div>
              <div className="results">
                <h3>Estimates:</h3>
                <p>
                  Bond Requirement: <strong>{bondAmount.toFixed(2)} ETH</strong>
                </p>
                <p>
                  Annual Rewards:{" "}
                  <strong>{potentialRewards.toFixed(4)} ETH</strong>
                </p>
                <p>
                  Reward Percentage:{" "}
                  <strong>
                    {(
                      (potentialRewards / parseFloat(ethAmount)) * 100 || 0
                    ).toFixed(2)}
                    %
                  </strong>
                </p>
              </div>
              <div className="calculator-info">
                <h3>About this Calculator</h3>
                <p>This calculator provides simplified estimates based on:</p>
                <ul>
                  <li>
                    Bond Curve: {BOND_CURVE_MIN} - {BOND_CURVE_MAX} ETH
                  </li>
                  <li>Rewards Rate: {REWARDS_RATE * 100}% of total rewards</li>
                  <li>
                    Estimated Annual ETH Rewards:{" "}
                    {ANNUAL_ETH_REWARDS_ESTIMATE * 100}%
                  </li>
                </ul>
                <p>
                  <em>
                    Note: These are simplified estimates and may not reflect
                    actual returns. Always do your own research before making
                    investment decisions.
                  </em>
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
