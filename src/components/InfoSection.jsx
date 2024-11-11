import React from "react";

export function InfoSection() {

  return (
    <div className="info-section">
      <h2>Understanding CSM Bonding Curves & Rewards</h2>

      <div className="info-card">
        <h3>Bonding Curves</h3>
        <p>Bonding curves define the relationship between validators and required ETH bonds. They determine capital efficiency and staking rewards multiplication.</p>

        <h4>Early Adoption (EA) Mode</h4>
        <ul>
          <li>Lower initial bond (1.5 ETH for first validator)</li>
          {/* <li>Higher capital multiplier (starts at 218%)</li> */}
          <li>Maximum 12 validators during EA phase</li>
        </ul>

        <h4>Non-EA Mode</h4>
        <ul>
          <li>Standard bond requirement (2.4 ETH for first validator)</li>
          {/* <li>Progressive capital multiplier (starts at 170%)</li> */}
          <li>No validator limit</li>
        </ul>
      </div>

      <div className="info-card">
        <h3>Reward Structure</h3>
        <p>CSM rewards come from two sources:</p>
        <ul>
          <li><strong>Bond Rebase:</strong> Staking rewards from bonded ETH converted to stETH</li>
          <li><strong>Node Operator:</strong> 6% commission for running validators</li>
        </ul>
        <p>Total Rewards = Bond rewards + Node operator commission</p>
      </div>

      <div className="info-links">
        <h3>Learn More</h3>
        <ul>
          <li><a href="https://csm.lido.fi" target="_blank" rel="noopener noreferrer">CSM Portal</a></li>
          <li><a href="https://docs.lido.fi/staking-modules/csm/intro" target="_blank" rel="noopener noreferrer">CSM Documentation</a></li>
          <li><a href="https://youtu.be/f0L5j-yy7VM" target="_blank" rel="noopener noreferrer">Video: How CSM Rewards Work</a></li>
          <li><a href="https://docs.google.com/spreadsheets/d/17mEuaI8ui-pmTTwev1FFIhch1X90HefpDB65kKyXDUU/edit?usp=sharing" target="_blank" rel="noopener noreferrer">Capital Efficiency Analysis</a></li>
          <li><a href="https://research.lido.fi/t/community-staking-module/5917" target="_blank" rel="noopener noreferrer">Community Staking Research</a></li>
          <li><a href="https://blog.lido.fi/csm-early-adoption/" target="_blank" rel="noopener noreferrer">Early Adoption Program</a></li>
          <li><a href="https://vote.lido.fi/180" target="_blank" rel="noopener noreferrer">CSM Governance Proposal</a></li>
        </ul>
      </div>
    </div>
  );
}



