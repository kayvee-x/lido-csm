import React, { useState, useEffect } from 'react';
import { JsonRpcProvider, Contract, formatEther } from 'ethers';
import { ArrowUpDown } from 'lucide-react';
import { calculateFrameTiming } from '../utils/calculations';
import { fetchLatestFrames } from '../utils/fetchframeHash';

const FRAME_HISTORY = [
    {
        period: "Current Frame (Dec 20 - Jan 17)",
        logCid: "QmePUqG8tMXbv3eHDu3j56Dod4gwmGh1Vapsh7u4gxotT4"
    },
    {
        period: "Frame 2 (Nov 22 - Dec 20)",
        logCid: "Qmb5CZUD9uLXP9LS68jnJp1v2GTF1KjYsNLJuML9fpRufE"
    },
    {
        period: "Frame 1 (Oct 25 - Nov 22)",
        logCid: "QmezkGCHPUJ9XSAJfibmo6Sup35VgbhnodfYsc1xNT3rbo"
    }
];

export const FramePerformanceTable = ({ frameMetrics, ethPrice }) => {
    const [frameHistory, setFrameHistory] = useState([]);
    const [selectedFrame, setSelectedFrame] = useState(FRAME_HISTORY[0]);
    const [frameData, setFrameData] = useState({ operators: [] });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const fetchFrameData = async (logCid) => {
        const response = await fetch(`https://ipfs.io/ipfs/${logCid}`);
        const data = await response.json();
        const operators = Object.entries(data.operators).map(([id, data]) => {
            const distributedBigInt = BigInt(data.distributed);
            const distributedEth = parseFloat(formatEther(distributedBigInt));
            return {
                operatorId: id,
                validatorCount: Object.keys(data.validators).length,
                distributed: distributedBigInt,
                distributedEth: distributedEth,
                usdValue: distributedEth * ethPrice
            };
        });

        setFrameData({ operators });
    };

    useEffect(() => {
        fetchFrameData(selectedFrame.logCid);
    }, [selectedFrame, ethPrice]);

    const sortedData = [...frameData.operators].sort((a, b) => {
        if (!sortConfig.key) return 0;
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        return a[sortConfig.key] > b[sortConfig.key] ? direction : -direction;
    });
    const frameTiming = calculateFrameTiming(FRAME_HISTORY);


    return (
        <div className="frame-performance-container">
            <div className="frame-timing-info">
                <p data-label="Last Frame Ended">{frameTiming.lastFrameEnd}</p>
                <p data-label="Days Remaining">{frameTiming.daysRemaining}</p>
                <p data-label="Current Frame Ends">{frameTiming.frameEndDate}</p>
            </div>

            <div className="frame-select">
                <select
                    className="frame-dropdown"
                    value={selectedFrame.period}
                    onChange={(e) => {
                        const frame = FRAME_HISTORY.find(f => f.period === e.target.value);
                        setSelectedFrame(frame);
                    }}
                >
                    {FRAME_HISTORY.map((frame) => (
                        <option key={frame.period} value={frame.period}>
                            {frame.period}
                        </option>
                    ))}
                </select>
            </div>

            <div className="table-wrapper">
                <table className="frame-table">
                    <thead>
                        <tr>
                            <th>Operator ID</th>
                            <th onClick={() => handleSort('validatorCount')}>
                                Validators <ArrowUpDown className="sort-icon" />
                            </th>
                            <th onClick={() => handleSort('distributedEth')}>
                                Node-Reward (ETH) <ArrowUpDown className="sort-icon" />
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
                                <td>{op.distributedEth.toFixed(4)} ETH</td>
                                <td>${op.usdValue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
