import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';

export function BondCurveTables({ bondCurveData }) {
    const [activeTable, setActiveTable] = useState('nonEAMainnet');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const tableHeaders = {
        nonEAMainnet: "Bond Curve Non-EA | Mainnet",
        eaMainnet: "Bond Curve EA | Mainnet",
        nonEATestnet: "Bond Curve Non-EA | Testnet"
    };

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const sortedData = [...bondCurveData[activeTable]].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
    });

    return (
        <div className="bond-curve-container">
            <div className="table-controls">
                <div className="table-tabs">
                    {Object.keys(tableHeaders).map(key => (
                        <button
                            key={key}
                            className={`tab-button ${activeTable === key ? 'active' : ''}`}
                            onClick={() => setActiveTable(key)}
                        >
                            {tableHeaders[key]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="table-wrapper">
                <table className="bond-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('validators')}>
                                # Validators <ArrowUpDown className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('bondForValidator')}>
                                Bond for Validator <ArrowUpDown className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('capital')}>
                                Capital (ETH) <ArrowUpDown className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('multiplier')}>
                                Capital Multiplier <ArrowUpDown className="sort-icon" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.validators}</td>
                                <td>{row.bondForValidator}</td>
                                <td>{row.capital}</td>
                                <td>{row.multiplier}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
