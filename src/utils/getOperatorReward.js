import { CSMRewardsGetter } from './operatorReward';

export const getOperatorRewards = async (nodeOperatorId) => {
    const rewardsGetter = new CSMRewardsGetter();
    return await rewardsGetter.getNodeOperatorRewards(nodeOperatorId);
};
