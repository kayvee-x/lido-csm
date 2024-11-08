// RewardsGraph.js
import React from 'react';
import { Line } from 'react-chartjs-2';

const RewardsGraph = ({ data }) => {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Total Earnings (ETH)',
                data: data.totalEarnings,
                borderColor: 'rgba(75,192,192,1)',
                backgroundColor: 'rgba(75,192,192,0.2)',
                fill: true,
            },
            {
                label: 'Net Bond Earnings (ETH)',
                data: data.netBondEarnings,
                borderColor: 'rgba(255,99,132,1)',
                backgroundColor: 'rgba(255,99,132,0.2)',
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default RewardsGraph;