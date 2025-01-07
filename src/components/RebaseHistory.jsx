import React, { useState, useEffect } from 'react';
import { formatEth } from '../utils/formatting';

export function RebaseHistory({ bondAmount }) {
    const [rebaseStats, setRebaseStats] = useState({
        initialBond: bondAmount,
        currentBond: bondAmount,
        totalGains: 0,
        aprHistory: [],
        dailyRebases: []
    });

    useEffect(() => {
        const trackRebases = async () => {
            const [aprResponse, statsResponse, smaResponse] = await Promise.all([
                fetch('https://eth-api.lido.fi/v1/protocol/steth/apr'),
                fetch('https://eth-api.lido.fi/v1/protocol/steth/stats'),
                fetch('https://eth-api.lido.fi/v1/protocol/steth/apr/sma')
            ]);

            const [aprData, statsData, smaData] = await Promise.all([
                aprResponse.json(),
                statsResponse.json(),
                smaResponse.json()
            ]);

            const currentApr = aprData.data?.apr || 0;
            const smoothedApr = smaData.data?.smaApr || 0;
            const dailyRebase = bondAmount * (currentApr / 365 / 100);
            const newTotalGains = rebaseStats.totalGains + dailyRebase;

            setRebaseStats(prev => ({
                ...prev,
                currentBond: bondAmount + newTotalGains,
                totalGains: newTotalGains,
                dailyRebases: [...prev.dailyRebases, {
                    date: new Date(),
                    amount: dailyRebase,
                    apr: currentApr,
                    smoothedApr: smoothedApr
                }]
            }));
        };

        trackRebases();
        const interval = setInterval(trackRebases, 86400000);
        return () => clearInterval(interval);
    }, [bondAmount]);

    return (
        <div className="rebase-history-panel">
            <h3>Bond Rebase Tracker</h3>

            <div className="rebase-summary">
                <div className="summary-item">
                    <label>Initial Bond</label>
                    <span>{formatEth(rebaseStats.initialBond)} ETH</span>
                </div>
                <div className="summary-item highlight">
                    <label>Total Rebase Gains</label>
                    <span>{formatEth(rebaseStats.totalGains)} ETH</span>
                </div>
                <div className="summary-item">
                    <label>Current Bond Value</label>
                    <span>{formatEth(rebaseStats.currentBond)} ETH</span>
                </div>
            </div>

            <div className="rebase-history-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Daily Rebase</th>
                            <th>APR</th>
                            <th>Smoothed APR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rebaseStats.dailyRebases.map((rebase, index) => (
                            <tr key={index}>
                                <td>{rebase.date.toLocaleDateString()}</td>
                                <td>{formatEth(rebase.amount)} ETH</td>
                                <td>{(rebase.apr || 0).toFixed(2)}%</td>
                                <td>{(rebase.smoothedApr || 0).toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}