import React from 'react';

export const QueueStatusTable = ({ queueData }) => {
    if (!queueData) return <div className="queue-loading">Loading queue data...</div>;

    return (
        <div className="queue-status-table">
            <div className="queue-summary">
                <h4>Queue Summary</h4>
                <div className="summary-grid">
                    <div className="summary-item">
                        <span>Total Batches</span>
                        <strong>{queueData.summary.totalBatches}</strong>
                    </div>
                    <div className="summary-item">
                        <span>Total Keys</span>
                        <strong>{queueData.summary.totalKeys}</strong>
                    </div>
                    {queueData.summary.found && (
                        <div className="summary-item highlight">
                            <span>Keys Before You</span>
                            <strong>{queueData.summary.keysInFront}</strong>
                        </div>
                    )}
                </div>
            </div>

            <div className="queue-entries">
                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>NO ID</th>
                            <th>Keys</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queueData.entries.map((entry, index) => (
                            <tr key={index} className={entry.isTarget ? 'highlight' : ''}>
                                <td>{entry.position}</td>
                                <td>{entry.noId}</td>
                                <td>{entry.keysCount}</td>
                                <td>{entry.isTarget ? '✅ Your Batch' : '⏳ Pending'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
