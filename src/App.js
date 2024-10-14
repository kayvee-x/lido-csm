import React, { useState, useEffect } from "react";
import "./styles.css";

function App() {
  const [activeTab, setActiveTab] = useState("summary");
  const [ethAmount, setEthAmount] = useState("");
  const [bondAmount, setBondAmount] = useState(0);
  const [potentialRewards, setPotentialRewards] = useState({ bondRebase: 0, nodeOperator: 0 });

  const BOND_CURVE_MIN = 1.5;
  const BOND_CURVE_MAX = 2;
  const NODE_OPERATOR_REWARD_SHARE = 0.07; // 7% share of rewards
  const BOND_REBASE_RATE = 0.9; // 90% of staking rewards for bond rebase
  const ETH_POS_STAKING_YIELD = 0.04; // 4% annual ETH PoS staking yield estimate

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
      "We're testing everything on a special practice network called Holesky (like a simulator)",
      "The Lido community said 'Yes!' to building this on December 15th",
      "As of July 11th, 2024, anyone can join without needing special permission (like removing the velvet rope)",
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
    if (isNaN(parsedAmount)) return { bondRebase: 0, nodeOperator: 0 };

    const bondRebaseRewards = bondAmount * ETH_POS_STAKING_YIELD * BOND_REBASE_RATE;
    const nodeOperatorRewards = parsedAmount * ETH_POS_STAKING_YIELD * NODE_OPERATOR_REWARD_SHARE;
    
    return { bondRebase: bondRebaseRewards, nodeOperator: nodeOperatorRewards };
  };

  useEffect(() => {
    if (ethAmount) {
      const calculatedBond = calculateBond(ethAmount);
      setBondAmount(calculatedBond);
      setPotentialRewards(calculateRewards(ethAmount));
    } else {
      setBondAmount(0);
      setPotentialRewards({ bondRebase: 0, nodeOperator: 0 });
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
              <label htmlFor="ethInput">
                How much ETH do you want to stake?
              </label>
              <input
                disabled
                id="ethInput"
                type="number"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="Type your ETH amount here"
              />
            </div>
            <div className="results">
              <h3>Your Numbers:</h3>
              <p>
                Safety Deposit Needed:{" "}
                <strong>{bondAmount.toFixed(2)} ETH</strong>
              </p>
              <p>
                Estimated Yearly Bond Rebase Rewards:{" "}
                <strong>{potentialRewards.bondRebase.toFixed(4)} ETH</strong>
              </p>
              <p>
                Estimated Yearly Node Operator Rewards:{" "}
                <strong>{potentialRewards.nodeOperator.toFixed(4)} ETH</strong>
              </p>
              <p>
                Total Estimated Yearly Rewards:{" "}
                <strong>{(potentialRewards.bondRebase + potentialRewards.nodeOperator).toFixed(4)} ETH</strong>
              </p>
              <p>
                Total Reward Percentage:{" "}
                <strong>
                  {(
                    ((potentialRewards.bondRebase + potentialRewards.nodeOperator) / parseFloat(ethAmount)) * 100 || 0
                  ).toFixed(2)}
                  %
                </strong>
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
                <li>Bond Rebase Rate: {BOND_REBASE_RATE * 100}% of staking rewards</li>
                <li>Node Operator Reward Share: {(NODE_OPERATOR_REWARD_SHARE * 100).toFixed(3)}% of staking rewards</li>
                <li>
                  Estimated ETH PoS Staking Yield:{" "}
                  {ETH_POS_STAKING_YIELD * 100}%
                </li>
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