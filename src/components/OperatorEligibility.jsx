import React, { useEffect, useState } from 'react';

export const OperatorEligibility = ({ operatorId }) => {
  const [frameData, setFrameData] = useState(null);

  useEffect(() => {
    const fetchOperatorFrameData = async () => {
      const response = await fetch('https://ipfs.io/ipfs/QmezkGCHPUJ9XSAJfibmo6Sup35VgbhnodfYsc1xNT3rbo');
      const data = await response.json();
      const operatorData = data.operators[operatorId];

      if (operatorData) {
        const eligibleValidators = Object.values(operatorData.validators)
          .filter(v => v.perf.included / v.perf.assigned >= 0.95).length;

        setFrameData({
          totalValidators: Object.keys(operatorData.validators).length,
          eligibleValidators,
          frameRewards: data.distributable
        });
      }
    };

    fetchOperatorFrameData();
  }, [operatorId]);

  return (
    <div>
      {frameData && (
        <div>
          <p>Total Validators: {frameData.totalValidators}</p>
          <p>Eligible Validators: {frameData.eligibleValidators}</p>
          <p>Frame Rewards: {frameData.frameRewards}</p>
        </div>
      )}
    </div>
  );
};
