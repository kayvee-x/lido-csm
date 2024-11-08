import React from "react";

export function InputSection({ config, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...config, [field]: value });
  };

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
    </div>
  );
}
