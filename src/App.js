import React, { useState, useEffect } from "react";
import "./styles.css";

function App() {
  const [activeTab, setActiveTab] = useState("summary");
  const [ethAmount, setEthAmount] = useState("");
  const [bondAmount, setBondAmount] = useState(0);
  const [potentialRewards, setPotentialRewards] = useState({ bondRebase: 0, nodeOperator: 0 });

  const BOND_CURVE_MIN = 1.5;
  const BOND_CURVE_MAX = 2;
  const MODULE_FEE = 0.06; // 6% for node operators
  const REWARD_PERIOD = 28; // 28 days
  const APR = 0.04; // 4% annual percentage rate
  const SHARE_RATE_INCREASE = 0.01; // 1% increase for this example


  const csmInfo = {
    summary: `Think of the Community Staking Module (CSM) as a special club in the Lido family where anyone can help run the network! It's like a neighborhood watch program, but for Ethereum. To join, you need to put some ETH in a piggy bank (we call it a bond) to show you'll be responsible.`,

    vision: `Lido is trying to make Ethereum more like a big friendly neighborhood where lots of different people can help keep things running smoothly. The more helpers present, the better and safer the network becomes for everyone! It's like having many different crossing guards instead of just a few.`,

    characteristics: [
      "How to Join: Right now, anyone can join! (It's like an open house party 🎉)",
      "Safety Deposit: You need to put 1.5 to 2 test ETH in a special wallet (like a trust fund)",
      "Rewards: You get 7% of the earnings for helping (like getting allowance for doing chores)",
      "Special Features: You can use something called DVT if you want (it's like having a backup helper)",
      "Size Limits: You can only run 10% of all validators (so everyone gets a fair chance to help)",
    ],

    status: [
      { date: "December 15, 2023", event: "Lido community approves building the Community Staking Module" },
      { date: "July 11, 2024", event: "Open participation begins: anyone can join without special permission" },
      { date: "Present", event: "Testing on Holesky testnet continues" },
    ],
    setup: [
      "Prepare VM/Hardware: Create a Google Cloud VM (2 vCPU, 8GB RAM, 350GB SSD, Ubuntu 24.04 LTS)",
      <span key="2">
        Install ETHPillar: SSH into VM, run installation command from{" "}
        <a
          href="https://www.coincashew.com/coins/overview-eth/ethpillar"
          target="_blank"
          rel="noopener noreferrer"
        >
          Coincashew website
        </a>
      </span>, 
      "Configure ETHPillar: Follow TUI prompts to sync clients and generate validator keys",
      "Get Holesky ETH: Use provided faucets",
      "Upload deposit data: Generate with ETHPillar, upload to CSM Widget",
      "Monitor: Use ETHPillar TUI for node management and monitoring",
    ],
  };

  const calculateBond = (amount) => {
    return Math.min(
      BOND_CURVE_MAX,
      Math.max(BOND_CURVE_MIN, BOND_CURVE_MIN + parseFloat(amount) * 0.01)
    );
  };

  const calculateRewards = (amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return { baseReward: 0, bondReward: 0 };

    // Base Reward calculation
    const baseReward = 32 * APR * (REWARD_PERIOD / 365) * MODULE_FEE;

    // Bond Reward calculation
    const bondReward = bondAmount * SHARE_RATE_INCREASE;

    return { baseReward, bondReward };
  };

  useEffect(() => {
    if (ethAmount) {
      const calculatedBond = calculateBond(ethAmount);
      setBondAmount(calculatedBond);
      setPotentialRewards(calculateRewards(ethAmount));
    } else {
      setBondAmount(0);
      setPotentialRewards({ baseReward: 0, bondReward: 0 });
    }
  }, [ethAmount]);


  return (
    <div className="App">
      <header className="App-header">
        <h1>Lido's Community Staking Module Dashboard</h1>
      </header>
      <main>
        <nav>
          <button onClick={() => setActiveTab("summary")}>What?</button>
          <button onClick={() => setActiveTab("vision")}>The Dream</button>
          <button onClick={() => setActiveTab("characteristics")}>
            How it Works
          </button>
          <button onClick={() => setActiveTab("status")}>CSM's Latest</button>
          <button onClick={() => setActiveTab("calculator")}>Calculator</button>
        </nav>
        <section className="content">
          {activeTab === "summary" && <p>{csmInfo.summary}</p>}
          {activeTab === "vision" && <p>{csmInfo.vision}</p>}
          {activeTab === "characteristics" && (
          <>
            <ul>
              {csmInfo.characteristics.map((char, index) => (
                <li key={index}>{char}</li>
              ))}
            </ul>
            <h3>Setup Guide:</h3>
            <ol>
              {csmInfo.setup.map((step, index) => (
                <li key={index}>{typeof step === 'string' ? step : step}</li>
              ))}
            </ol>
          </>
        )}
          {activeTab === "status" && (
            <div className="timeline">
              <h2>CSM's Latest Updates</h2>
              {csmInfo.status.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-item-content">
                    <time>{item.date}</time>
                    <p>{item.event}</p>
                    <span className="circle" />
                  </div>
                </div>
              ))}
            </div>
          )}
      {activeTab === "calculator" && (
        <div className="calculator">
          <h2>CSM Calculator</h2>
          <div className="input-section">
            <label htmlFor="ethInput">
              How much ETH do you want to stake?
            </label>
            <input
              className="calculator-input"
              id="ethInput"
              type="number"
              value={ethAmount}
              onChange={(e) => setEthAmount(e.target.value)}
              placeholder="Type your ETH amount here"
              min={0}
            />
          </div>
          <div className="results">
            <h3>Your Numbers:</h3>
            <p>
              Safety Deposit Needed:{" "}
              <strong>{bondAmount.toFixed(2)} ETH</strong>
            </p>
            <p>
              Estimated Base Reward (28 days):{" "}
              <strong>{potentialRewards.baseReward.toFixed(6)} ETH</strong>
            </p>
            <p>
              Estimated Bond Reward (28 days):{" "}
              <strong>{potentialRewards.bondReward.toFixed(6)} ETH</strong>
            </p>
            <p>
              Total Estimated Rewards (28 days):{" "}
              <strong>{(potentialRewards.baseReward + potentialRewards.bondReward).toFixed(6)} ETH</strong>
            </p>
          </div>
          <div className="calculator-info">
            <h3>How This Works</h3>
            <p>This calculator uses these rules:</p>
            <ul>
              <li>
                Safety Deposit Range: {BOND_CURVE_MIN} - {BOND_CURVE_MAX}{" "}
                ETH
              </li>
              <li>Module Fee (for node operators): {MODULE_FEE * 100}%</li>
              <li>Reward Period: {REWARD_PERIOD} days</li>
              <li>Annual Percentage Rate (APR): {APR * 100}%</li>
              <li>Share Rate Increase (for this example): {SHARE_RATE_INCREASE * 100}%</li>
            </ul>
            <p>
              <em>
                Remember: These are estimates based on Holesky testnet values. 
                Actual results may vary, and mainnet values will be set by DAO vote.
              </em>
            </p>
            <p>
              <strong>Additional Reward Features:</strong>
            </p>
            <ul>
              <li>Rewards smoothing across all Lido modules (e.g., block proposer rewards, sync committee rewards)</li>
              <li>Rewards socialisation among validators whose performance exceeds a certain threshold</li>
              <li>Underperforming validators will receive no node operator rewards for the given frame</li>
            </ul>
            <p>
              <strong>Note:</strong> The actual rewards may be reduced due to poor performance penalties.
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