import React, { useState, useEffect } from 'react';
import { fetchCSM } from '../utils/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

// Mock data to use when API fails
const MOCK_OPERATORS = {
    data: {
        operators: [
            {
                name: "Operator 1",
                active: true,
                stakingLimit: 100,
                usedSigningKeys: 30,
                totalSigningKeys: 100,
                performance: 0.95
            },
            {
                name: "Operator 2",
                active: true,
                stakingLimit: 150,
                usedSigningKeys: 50,
                totalSigningKeys: 150,
                performance: 0.92
            },
            {
                name: "Operator 3",
                active: true,
                stakingLimit: 80,
                usedSigningKeys: 20,
                totalSigningKeys: 80,
                performance: 0.88
            },
            {
                name: "Operator 4",
                active: false,
                stakingLimit: 50,
                usedSigningKeys: 40,
                totalSigningKeys: 50,
                performance: 0.85
            }
        ]
    }
};

export const OperatorAllocation = ({ ethAmount = 320 }) => {
    const [operators, setOperators] = useState([]);
    const [allocatedData, setAllocatedData] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOperators();
        const interval = setInterval(fetchOperators, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (operators.length > 0) {
            handleAllocation();
        }
    }, [ethAmount, operators]);

    const fetchOperators = async () => {
        setIsLoading(true);
        try {
            const data = await fetchCSM();
            if (data?.data?.operators) {
                setOperators(data.data.operators);
                setError(null);
            }
        } catch (error) {
            console.error('Error fetching operators:', error);
            setError('Failed to fetch operators data');
            setOperators(MOCK_OPERATORS.data.operators);
        } finally {
            setIsLoading(false);
        }
    };


    const handleAllocation = () => {
        let remainingValidators = Math.floor(ethAmount / 32);
        const newDepositedData = [];

        operators
            .filter(op => op.active)
            .forEach(operator => {
                const availableCapacity = operator.stakingLimit - operator.usedSigningKeys;
                const allocation = Math.min(availableCapacity, remainingValidators);
                remainingValidators -= allocation;

                newDepositedData.push({
                    operator: operator.name,
                    availableCapacity,
                    allocation,
                    totalKeys: operator.totalSigningKeys,
                    usedKeys: operator.usedSigningKeys,
                    performance: operator.performance || 0,
                    status: operator.active ? 'Active' : 'Inactive'
                });
            });

        setAllocatedData(newDepositedData);
    };

    const activeOperators = operators.filter(op => op.active).length;
    const totalStakingLimit = operators.reduce((sum, op) => op.active ? sum + op.stakingLimit : sum, 0);

    if (isLoading) {
        return <div>Loading operators...</div>;
    }

    return (
        <div className="bond-curve-container">
            {error && <div className="error-message" style={{ color: 'red', padding: '10px', backgroundColor: '#ffeeee' }}>
                {error}
            </div>}

            <div className="rewards-grid">
                <div className="reward-card">
                    <h4>Active Operators</h4>
                    <div className="reward-value">{activeOperators}</div>
                </div>
                <div className="reward-card">
                    <h4>Total Staking Capacity</h4>
                    <div className="reward-value">
                        {totalStakingLimit} validators
                    </div>
                </div>
                <div className="reward-card">
                    <h4>Validators Needed</h4>
                    <div className="reward-value">{Math.floor(ethAmount / 32)}</div>
                </div>
            </div>
            <div className='operator-margin'></div>


            {allocatedData.length > 0 && (
                <div className="earnings-chart">
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={allocatedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="operator" angle={-45} textAnchor="end" interval={0} height={100} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="usedKeys" stackId="a" fill="#4764ff" name="Used Keys" />
                            <Bar dataKey="allocation" stackId="a" fill="#00c7ff" name="New Allocation" />
                            <Bar dataKey="availableCapacity" stackId="a" fill="#bbd7f3" name="Available Capacity" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
            <div className='operator-margin'></div>
            <div className="table-wrapper">
                <table className="staking-table">
                    <thead>
                        <tr>
                            <th>Operator</th>
                            <th>Staking Limit</th>
                            <th>Used Keys</th>
                            <th>Available</th>
                            <th>Allocated</th>
                            <th>Performance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocatedData.map((op) => (
                            <tr key={op.operator}>
                                <td>{op.operator}</td>
                                <td>{op.totalKeys}</td>
                                <td>{op.usedKeys}</td>
                                <td>{op.availableCapacity}</td>
                                <td>{op.allocation}</td>
                                <td>{(op.performance * 100).toFixed(2)}%</td>
                                <td>{op.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};