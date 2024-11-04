import React, { useState, useEffect } from "react";
import "./styles.css";

function App() {
  const [activeTab, setActiveTab] = useState("summary");
  const [ethAmount, setEthAmount] = useState("");
  const [bondAmount, setBondAmount] = useState(0);
  const [potentialRewards, setPotentialRewards] = useState({ bondRebase: 0, nodeOperator: 0 });
  const [ethAvailable, setEthAvailable] = useState(32);
  const [standardStakingYield, setStandardStakingYield] = useState(3);
  const [isEA, setIsEA] = useState(true);
  const [standardStaking, setStandardStaking] = useState(null);
  const [eaCSMStaking, setEaCSMStaking] = useState(null);
  const [permissionlessCSMStaking, setPermissionlessCSMStaking] = useState(null);

  // Constants
  const NODE_OPERATOR_FEE_RATE = 0.06; // 6%
  const LIDO_STETH_FEE_RATE = 0.10; // 10%
  const VALIDATOR_EFFECTIVE_BALANCE = 32;
  const MAX_EA_VALIDATORS = 12;
  const EA_MAX_BOND = 15.8;

  // Helper functions
  const calculateBond = (validators) => {
    if (isEA) {
      if (validators <= 1) return 1.5;
      if (validators <= 6) return 1.5 + (validators - 1) * 1.3;
      if (validators <= MAX_EA_VALIDATORS) return 8 + (validators - 6) * 1.3;
      return EA_MAX_BOND + (validators - MAX_EA_VALIDATORS) * 1.3;
    } else {
      return validators * 1.3;
    }
  };

  const calculateRewards = (validators, bond) => {
    const ethStaked = validators * VALIDATOR_EFFECTIVE_BALANCE;
    const ethEarnedYear = ethStaked * (standardStakingYield / 100);
    const nodeOperatorFeeYear = ethEarnedYear * NODE_OPERATOR_FEE_RATE;
    const bondEarningsYear = bond * (standardStakingYield / 100);
    const lidoFee = bondEarningsYear * LIDO_STETH_FEE_RATE;
    const netBondEarningsYear = bondEarningsYear - lidoFee;
    const totalEarnings = nodeOperatorFeeYear + netBondEarningsYear;
    const rateOfReturn = (totalEarnings / bond) * 100;
    const csmMultiplier = rateOfReturn / standardStakingYield;

    return {
      validators,
      ethStaked,
      ethEarnedYear,
      nodeOperatorFeeYear,
      totalBond: bond,
      bondEarningsYear,
      lidoFee,
      netBondEarningsYear,
      totalEarnings,
      rateOfReturn,
      csmMultiplier
    };
  };

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

  useEffect(() => {
    const standardValidators = Math.floor(ethAvailable / VALIDATOR_EFFECTIVE_BALANCE);
    setStandardStaking({
      validators: standardValidators,
      ethStaked: standardValidators * VALIDATOR_EFFECTIVE_BALANCE,
      ethEarnedYear: (standardValidators * VALIDATOR_EFFECTIVE_BALANCE * standardStakingYield) / 100
    });

    const eaValidators = Math.min(MAX_EA_VALIDATORS, Math.floor(ethAvailable / 1.3));
    const eaBond = calculateBond(eaValidators);
    setEaCSMStaking(calculateRewards(eaValidators, eaBond));

    const permissionlessValidators = Math.floor(ethAvailable / 1.3);
    const permissionlessBond = calculateBond(permissionlessValidators);
    setPermissionlessCSMStaking(calculateRewards(permissionlessValidators, permissionlessBond));
  }, [ethAvailable, standardStakingYield, isEA]);


  return (
    <div className="App">
      {/* <header className="App-header">
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
          {activeTab === "calculator" && ( */}
            <div className="calculator">
              <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">CSM Calculator</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block mb-2">ETH Available for Bond</label>
                    <input
                      type="number"
                      value={ethAvailable}
                      onChange={(e) => setEthAvailable(Number(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Standard Staking Yield (%)</label>
                    <input
                      type="number"
                      value={standardStakingYield}
                      onChange={(e) => setStandardStakingYield(Number(e.target.value))}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block mb-2">Early Adoption (EA) Status</label>
                  <select
                    value={isEA.toString()}
                    onChange={(e) => setIsEA(e.target.value === 'true')}
                    className="w-full p-2 border rounded"
                  >
                    <option value="true">EA List</option>
                    <option value="false">Not in EA List</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Standard Staking</h2>
                    {standardStaking && (
                      <>
                        <p>Number of Validators: {standardStaking.validators}</p>
                        <p>ETH Staked: {standardStaking.ethStaked.toFixed(4)}</p>
                        <p>ETH Earned/Year: {standardStaking.ethEarnedYear.toFixed(4)}</p>
                      </>
                    )}
                  </div>
                  <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">EA CSM Staking</h2>
                    {eaCSMStaking && (
                      <>
                        <p>Bonded Validators: {eaCSMStaking.validators}</p>
                        <p>ETH Staked: {eaCSMStaking.ethStaked.toFixed(4)}</p>
                        <p>ETH Earned/Year: {eaCSMStaking.ethEarnedYear.toFixed(4)}</p>
                        <p>Node Operator Fee/Year (ETH): {eaCSMStaking.nodeOperatorFeeYear.toFixed(4)}</p>
                        <p>Total Bond (ETH): {eaCSMStaking.totalBond.toFixed(4)}</p>
                        <p>Bond Earnings/Year (ETH): {eaCSMStaking.bondEarningsYear.toFixed(4)}</p>
                        <p>Lido Fee (ETH): {eaCSMStaking.lidoFee.toFixed(4)}</p>
                        <p>Net Bond Earnings/Year: {eaCSMStaking.netBondEarningsYear.toFixed(4)}</p>
                        <p>Total Earnings (ETH): {eaCSMStaking.totalEarnings.toFixed(4)}</p>
                        <p>Total Rate of Return: {eaCSMStaking.rateOfReturn.toFixed(2)}%</p>
                        <p>CSM Multiplier: {eaCSMStaking.csmMultiplier.toFixed(2)}</p>
                      </>
                    )}
                  </div>
                  <div className="bg-gray-100 p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Permissionless CSM Staking</h2>
                    {permissionlessCSMStaking && (
                      <>
                        <p>Bonded Validators: {permissionlessCSMStaking.validators}</p>
                        <p>ETH Staked: {permissionlessCSMStaking.ethStaked.toFixed(4)}</p>
                        <p>ETH Earned/Year: {permissionlessCSMStaking.ethEarnedYear.toFixed(4)}</p>
                        <p>Node Operator Fee/Year (ETH): {permissionlessCSMStaking.nodeOperatorFeeYear.toFixed(4)}</p>
                        <p>Total Bond (ETH): {permissionlessCSMStaking.totalBond.toFixed(4)}</p>
                        <p>Bond Earnings/Year (ETH): {permissionlessCSMStaking.bondEarningsYear.toFixed(4)}</p>
                        <p>Lido Fee (ETH): {permissionlessCSMStaking.lidoFee.toFixed(4)}</p>
                        <p>Net Bond Earnings/Year: {permissionlessCSMStaking.netBondEarningsYear.toFixed(4)}</p>
                        <p>Total Earnings (ETH): {permissionlessCSMStaking.totalEarnings.toFixed(4)}</p>
                        <p>Total Rate of Return: {permissionlessCSMStaking.rateOfReturn.toFixed(2)}%</p>
                        <p>CSM Multiplier: {permissionlessCSMStaking.csmMultiplier.toFixed(2)}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8 explanation">
                  <h2 className="text-2xl font-bold mb-4">Explanation</h2>
                  <p>This calculator compares three staking scenarios:</p>
                  <ol className="list-decimal list-inside mb-4">
                    <li>Standard Staking: Traditional ETH staking without CSM.</li>
                    <li>EA CSM Staking: Early Adoption CSM staking with special bonding rules.</li>
                    <li>Permissionless CSM Staking: Regular CSM staking after the EA phase.</li>
                  </ol>
                  <p>Key points:</p>
                  <ul className="list-disc list-inside mb-4">
                    <li>Node Operator Fee Rate: {NODE_OPERATOR_FEE_RATE * 100}%</li>
                    <li>Lido stETH Fee Rate: {LIDO_STETH_FEE_RATE * 100}%</li>
                    <li>Validator Effective Balance: {VALIDATOR_EFFECTIVE_BALANCE} ETH</li>
                    <li>EA max validators: {MAX_EA_VALIDATORS}</li>
                    <li>EA max bond: {EA_MAX_BOND} ETH</li>
                  </ul>
                  <p>
                    The total rewards for CSM staking are calculated as:
                    bond * Lido Protocol APR * (1 - Lido Fee) + No_of_validators * (32 * Lido Protocol APR * Node Operator Fee)
                  </p>
                  <p>
                    The CSM Multiplier shows how much more effective CSM staking is compared to standard staking.
                    A multiplier of 2 means CSM staking yields twice as much as standard staking.
                  </p>
                </div>
              </div>
            </div>
          {/* )}
        </section>
      </main> */}
    </div>
  );
}

export default App;