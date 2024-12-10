import React, { useState } from "react";
import { Ttip } from "./Tooltip";

export function InputSection({ config, onChange }) {
  const [nodeOperatorId, setNodeOperatorId] = useState('');

  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };
  const getValidatorCount = (ethAmount, isEA) => {
    if (isEA) {
      if (ethAmount < 1.5) return 0;
      if (ethAmount === 2) return 1;
      if (ethAmount === 8) return 6;
      if (ethAmount === 15.8) return 12;
      if (ethAmount === 32) return 24;
      if (ethAmount > 32) {
        const additionalValidators = Math.floor((ethAmount - 31.4) / 1.3);
        return 24 + additionalValidators;
      }
      return Math.floor((ethAmount - 1.5) / 1.3) + 1;
    } else {
      if (ethAmount < 2.4) return 0;
      if (ethAmount === 2.4) return 1;
      if (ethAmount === 8) return 5;
      if (ethAmount === 32) return 23;
      if (ethAmount > 32) {
        const additionalValidators = Math.floor((ethAmount - 31) / 1.3);
        return 23 + additionalValidators;
      }
      return Math.floor((ethAmount - 2.4) / 1.3) + 1;
    }
  };

  const validatorCount = getValidatorCount(config.ethAvailable, config.isEA);

  const durationOptions = [
    { label: '1D', value: 1 },
    { label: '7D', value: 7 },
    { label: '14D', value: 14 },
    { label: '28D', value: 28 },
    { label: '3M', value: 90 },
    { label: '6M', value: 180 },
    { label: '12M', value: 365 }
  ];

  return (
    <div className="input-container">
      <div className="input-grid">
        <div className="input-group">
          <div className="label-with-tooltip">
            <label className="input-label">Node Operator ID</label>
            <Ttip content="Enter your CSM Node Operator ID to view specific reward calculations" />
          </div>
          <input
            type="number"
            min="0"
            max="2000"
            value={config.nodeOperatorId}
            onChange={(e) => handleChange("nodeOperatorId", Number(e.target.value))}
            className="input-field"
          />
        </div>
        <div>
          <h4>
            OR
          </h4>
        </div>
        <div className="input-group">
          <div className="label-with-tooltip">
            <label className="input-label">ETH Amount</label>
            <Ttip content="The amount of ETH you want to stake. Deposits are processed when gas prices are favorable. While waiting in the queue, you'll earn staking rewards from bond rebase." />
          </div>
          <input
            type="number"
            min="0"
            value={config.ethAvailable}
            onChange={(e) => handleChange("ethAvailable", Number(e.target.value))}
            className="input-field"
          />
        </div>

        {/* <div className="input-group">
          <div className="label-with-tooltip">
            <label className="input-label">Standard Yield (%)</label>
            <Ttip content="Base staking rewards from running a vanilla Ethereum validator. This includes both Consensus Layer rewards and MEV opportunities." />
          </div>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={config.standardYield}
            onChange={(e) => handleChange("standardYield", Number(e.target.value))}
            className="input-field"
          />
        </div>
        <span className="data-source">Live: beaconcha.in/api/v1/epoch/latest</span> */}

        {/* <div className="input-group">
          <div className="label-with-tooltip">
            <label className="input-label">Lido APR (%)</label>
            <Ttip content="7-day Simple Moving Average (SMA) of stETH APR." />
          </div>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={config.lidoApr}
            onChange={(e) => handleChange("lidoApr", Number(e.target.value))}
            className="input-field"
          />
        </div>
        <span className="data-source">Live: eth-api.lido.fi/v1/protocol/steth/apr/sma</span> */}
      </div>

      <div className="select-group">
        <div className="label-with-tooltip">
          <label className="input-label">Early Adoption Status</label>
          <Ttip content="Early Adopters get lower bond requirements and priority queue access, but are limited to 12 validators. Regular stakers have higher requirements but no validator limit." />
        </div>
        <select
          value={config.isEA.toString()}
          onChange={(e) => handleChange("isEA", e.target.value === "true")}
          className="select-field"
        >
          <option value="true">Early Adopter</option>
          <option value="false">Regular Staker</option>
        </select>
      </div>

      <div className="validator-info">
        <div className="info-header">
          <h4>Validator Capacity</h4>
        </div>
        <p>With {config.ethAvailable} ETH you can run: <strong>{validatorCount} validator{validatorCount !== 1 ? 's' : ''}</strong></p>
        {config.isEA && validatorCount > 12 && (
          <p className="note">Note: Maximum 12 validators during EA phase</p>
        )}
      </div>

      <div className="duration-selector">
        <div className="duration-header">
          <h4>Calculation Period</h4>
        </div>
        <div className="duration-buttons">
          {durationOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleChange("stakingDuration", option.value)}
              className={`duration-button ${config.stakingDuration === option.value ? 'active' : ''}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

}