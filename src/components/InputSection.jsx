import React, { useState, useEffect } from "react";
import { getOperatorRewards } from "../utils/getOperatorReward";
import { Ttip } from "./Tooltip";
import { performCalculations } from "../utils/calculations";

export function InputSection({ config, onChange }) {
  const [operatorRewards, setOperatorRewards] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validatorCount, setValidatorCount] = useState(0);

  useEffect(() => {
    // Calculate validators and bond required whenever config changes
    const ethAmount = Number(config.ethAvailable);
    const { validators } = performCalculations(config, ethAmount);
    setValidatorCount(validators);
  }, [config]);

  const handleNodeOperatorChange = async (value) => {
    if (value > 10000) {
      value = 10000;
    }

    onChange({
      ...config,
      nodeOperatorId: value,
      operatorRewards: null
    });

    if (value >= 0 && value <= 10000) {
      try {
        const rewards = await getOperatorRewards(value);
        onChange({
          ...config,
          nodeOperatorId: value,
          operatorRewards: rewards
        });
      } catch (error) {
        console.error('Error fetching rewards:', error);
        onChange({
          ...config,
          nodeOperatorId: value,
          operatorRewards: { error: error.message }
        });
      }
    }

    renderOperatorPanel();
  };

  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };

  const renderOperatorPanel = () => {
    // console.log("Operator panel refreshed");
  };

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
            <Ttip content="Enter your CSM Node Operator ID to view reward calculations" />
          </div>
          <input
            type="number"
            min="0"
            max="10000"
            value={config.nodeOperatorId}
            onChange={(e) => handleNodeOperatorChange(Number(e.target.value))}
            className="input-field"
          />
        </div>
        <div>
          <h4>OR</h4>
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
        {validatorCount > 12 && config.isEA && (
          <p className="note">CSM is now permissionless, with no limit to the validators.</p>
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