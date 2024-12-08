import React, { useState, useEffect } from 'react';
import ApiService from '../utils/ApiService';
import { Ttip } from './Tooltip';
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



export const OperatorAllocation = () => {
    const [operators, setOperators] = useState([]);
    const [moduleData, setModuleData] = useState(null);
    const [allocatedData, setAllocatedData] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOperators();
        const interval = setInterval(fetchOperators, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (operators.length > 0) {
            handleAllocation();
        }
    }, [operators]);

    const fetchOperators = async () => {
        try {
            setIsLoading(true);
            const data = await ApiService.fetchOperators();
            setOperators(data.operators);
            setModuleData(data.module);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAllocation = () => {
        const newDepositedData = operators
            .filter(op => op.active)
            .map(operator => ({
                operator: operator.name,
                availableCapacity: operator.stakingLimit - operator.usedSigningKeys,
                totalKeys: operator.totalSigningKeys,
                usedKeys: operator.usedSigningKeys,
                status: operator.active ? 'Active' : 'Inactive'
            }));

        setAllocatedData(newDepositedData);
    };

    if (isLoading) return <div>Loading operators...</div>;

    return (
        <div className="bond-curve-container">
            {error && <div className="error-message" style={{ color: 'red', padding: '10px', backgroundColor: '#ffeeee' }}>
                {error}
            </div>}

            <div className="rewards-grid">
                <div className="reward-card">
                    <div className="reward-header">
                        <h4>Module Type</h4>
                    </div>
                    <div className="reward-value">{moduleData?.type}</div>
                </div>

                <div className="reward-card">
                    <div className="reward-header">
                        <h4>Module Fee</h4>
                        <Ttip content="The percentage of staking rewards allocated to node operators. This fee covers operational costs and is split proportionally among active validators who meet performance thresholds. It includes both consensus rewards and MEV earnings from block proposals." />
                    </div>
                    <div className="reward-value">{moduleData?.moduleFee / 100}%</div>
                </div>

                <div className="reward-card">
                    <div className="reward-header">
                        <h4>Treasury Fee</h4>
                        <Ttip content="Fee allocated to the Lido treasury for protocol maintenance and development. This contributes to the ongoing sustainability of the protocol." />
                    </div>
                    <div className="reward-value">{moduleData?.treasuryFee / 100}%</div>
                </div>

                <div className="reward-card">
                    <div className="reward-header">
                        <h4>Exited Validators</h4>
                        <Ttip content="The protocol cannot exit validators automatically. Operators must monitor for exit requests and process them manually. You can use tools like Ejector or CSM Sentinel to help with this process." />
                    </div>
                    <div className="reward-value">{moduleData?.exitedValidatorsCount}</div>
                </div>
            </div>

            <div className='operator-margin'></div>

            {allocatedData.length > 0 && (
                <div className="earnings-chart">
                    <div className="chart-scroll-wrapper">
                        <ResponsiveContainer width="400%" height={400}>
                            <BarChart data={allocatedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="operator" angle={-45} textAnchor="end" interval={0} height={100} />
                                <YAxis />
                                <Tooltip />
                                <Legend
                                    align="left"
                                    verticalAlign="top"
                                    layout="vertical"
                                    wrapperStyle={{
                                        paddingTop: "20px",
                                        paddingLeft: "10px"
                                    }}
                                />                               <Bar dataKey="usedKeys" stackId="a" fill="#4764ff" name="Used Keys" />
                                <Bar dataKey="availableCapacity" stackId="a" fill="#bbd7f3" name="Available Capacity" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className='operator-margin'></div>

            <div className="table-wrapper">
                <div className="table-header">
                    <h4>Operator Details</h4>
                </div>
                <table className="staking-table">
                    <thead>
                        <tr>
                            <th>Operator</th>
                            <th>Staking Limit</th>
                            <th>Used Keys</th>
                            <th>Available</th>
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
                                <td>{op.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};