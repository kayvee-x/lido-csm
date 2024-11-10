import React from "react";

export function InputSection({ config, onChange }) {
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

  return (
    <div className="input-container">
      <div className="input-grid">
        <div className="input-group">
          <label className="input-label">
            ETH Available
          </label>
          <input
            type="number"
            min="0"
            value={config.ethAvailable}
            onChange={(e) => handleChange("ethAvailable", Number(e.target.value))}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">
            Standard Yield (%)
          </label>
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

        <div className="input-group">
          <label className="input-label">
            Lido APR (%)
          </label>
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
      </div>

      <div className="select-group">
        <label className="input-label">
          Early Adoption Status
        </label>
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
        <h4>Validator Capacity</h4>
        <p>With {config.ethAvailable} ETH you can run: <strong>{validatorCount} validator{validatorCount !== 1 ? 's' : ''}</strong></p>
        {config.isEA && validatorCount > 12 && (
          <p className="note">Note: Maximum 12 validators during EA phase</p>
        )}
      </div>
    </div>
  );
}
