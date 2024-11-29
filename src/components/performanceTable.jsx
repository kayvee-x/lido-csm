// components/FramePerformanceTable.js
import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { formatEth } from '../utils/formatting';
import { frameData } from '../utils/recentData';


export function FramePerformanceTable({ ethPrice }) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };
    const frameOptions = [
        { label: `Frame ${frameData.frame[0]} - ${frameData.frame[1]}`, value: 'current' },
        // more data as they come in
    ];
    const operatorStats = Object.entries(frameData.operators).map(([id, data]) => {
        const validators = Object.values(data.validators);
        const totalAssigned = validators.reduce((sum, val) => sum + val.perf.assigned, 0);
        const totalIncluded = validators.reduce((sum, val) => sum + val.perf.included, 0);
        const effectiveness = (totalIncluded / totalAssigned) * 100;
        const distributed = data.distributed / 1e18;

        return {
            operatorId: id,
            validatorCount: validators.length,
            effectiveness,
            distributed,
            usdValue: distributed * ethPrice
        };
    });

    const sortedData = [...operatorStats].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
    });

    return (
        <div className="frame-performance-container">
            <div className="frame-select">
                <select className="frame-dropdown">
                    {frameOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>            
            <h3>Frame {frameData.frame[0]} - {frameData.frame[1]} Node Operator Performance</h3>
            <div className="table-wrapper">
                <table className="frame-table">
                    <thead>
                        <tr>
                            <th>Operator ID</th>
                            <th onClick={() => handleSort('validatorCount')}>
                                Validators <ArrowUpDown className="sort-icon" />
                            </th>
                            {/* <th onClick={() => handleSort('effectiveness')}>
                                Effectiveness <ArrowUpDown className="sort-icon" />
                            </th> */}
                            <th onClick={() => handleSort('distributed')}>
                                Rewards (ETH) <ArrowUpDown className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('usdValue')}>
                                Value (USD) <ArrowUpDown className="sort-icon" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((op) => (
                            <tr key={op.operatorId}>
                                <td>Operator {op.operatorId}</td>
                                <td>{op.validatorCount}</td>
                                {/* <td>{op.effectiveness.toFixed(2)}%</td> */}
                                <td>{formatEth(op.distributed)} ETH</td>
                                <td>${op.usdValue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}