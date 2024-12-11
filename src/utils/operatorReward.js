import axios from 'axios';
import { ethers } from 'ethers';
import accountingAbi from './abi/CSAccounting.json';
import moduleAbi from './abi/ICSModule.json';
import pooledEthSharesAbi from './abi/pooledEthSharesImp.abi.json';
import distSharesAbi from './abi/distSharesImp.abi.json';

export class CSMRewardsGetter {
    constructor() {
        const providerRPC = {
            dev: {
                name: 'development',
                rpc: process.env.REACT_APP_RPC_URL,
                chainId: 1,
            }
        };

        this.provider = new ethers.JsonRpcProvider(providerRPC.dev.rpc, {
            chainId: providerRPC.dev.chainId,
            name: providerRPC.dev.name,
        });

        this.proofUrl = process.env.REACT_APP_PROOF_URL;
        this.accountingAbi = JSON.parse(JSON.stringify(accountingAbi));
        this.moduleAbi = JSON.parse(JSON.stringify(moduleAbi)).abi;
        this.pooledEthSharesAbi = JSON.parse(JSON.stringify(pooledEthSharesAbi));
        this.distSharesAbi = JSON.parse(JSON.stringify(distSharesAbi));
    }

    async getRewardsProof() {
        const response = await axios.get(this.proofUrl, {
            timeout: 60000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            validateStatus: status => status === 200
        });

        if (!response.data) {
            throw new Error('No data received from proof endpoint');
        }

        return response.data;
    }



    async getCumulativeFeeShares(nodeOperatorID) {
        const data = await this.getRewardsProof();
        const operatorKey = `CSM Operator ${nodeOperatorID}`;

        if (!data || !data[operatorKey]) {
            console.error(`No proof data found for ${operatorKey}`);
            return 0;
        }

        return data[operatorKey].cumulativeFeeShares;
    }

    async getPooledEthByShares(sharesAmount) {
        try {
            const contract = new ethers.Contract(
                process.env.REACT_APP_POOLED_ETH_SHARES_PROXY_CONTRACT,
                this.pooledEthSharesAbi,
                this.provider
            );
            const pooledEthShares = await contract.getPooledEthByShares(BigInt(sharesAmount));
            return Number(ethers.toBigInt(pooledEthShares)) / 1e18;
        } catch (error) {
            console.error('Error fetching pooled ETH:', error);
            return 0;
        }
    }


    async getExcessBondShares(nodeOperatorID) {
        const accountingContract = new ethers.Contract(
            process.env.REACT_APP_CSACCOUNTING_CONTRACT_ADDRESS,
            this.accountingAbi,
            this.provider
        );
        const moduleContract = new ethers.Contract(
            process.env.REACT_APP_CSMODULE_CONTRACT_ADDRESS,
            this.moduleAbi,
            this.provider
        );

        const currentBondShares = await accountingContract.getBondShares(nodeOperatorID);
        const curveID = await accountingContract.getBondCurveId(nodeOperatorID);
        const lockedBond = await accountingContract.getActualLockedBond(nodeOperatorID);
        const nonWithdrawnKeys = await moduleContract.getNodeOperatorNonWithdrawnKeys(nodeOperatorID);
        const bondAmountByKeyCount = await accountingContract["getBondAmountByKeysCount(uint256,uint256)"](nonWithdrawnKeys, curveID);

        const curve = Object.entries(await accountingContract.getBondCurve(nodeOperatorID));
        const requiredBondShares = await this.getSharesByPooledEth(bondAmountByKeyCount + lockedBond, curve);

        return {
            keys: nonWithdrawnKeys,
            requiredBondShares,
            excessBondShares: currentBondShares - BigInt(requiredBondShares)
        };
    }

    async getSharesByPooledEth(sharesAmount, curve) {
        const contract = new ethers.Contract(
            process.env.REACT_APP_POOLED_ETH_SHARES_PROXY_CONTRACT,
            this.pooledEthSharesAbi,
            this.provider
        );

        const pooledEthShares = await contract.getSharesByPooledEth(BigInt(sharesAmount));
        return pooledEthShares;
    }

    async getDistributedShares(nodeOperatorID) {
        const contract = new ethers.Contract(
            process.env.REACT_APP_DIST_SHARES_PROXY_CONTRACT,
            this.distSharesAbi,
            this.provider
        );

        const distributedShares = await contract.distributedShares(nodeOperatorID);
        return Number(ethers.toBigInt(distributedShares)) / 1e18;
    }

    async getNodeOperatorRewards(nodeOperatorID) {
        console.log('Getting rewards for operator:', nodeOperatorID);
        const cumulativeFeeShares = await this.getCumulativeFeeShares(nodeOperatorID);
        const totalRewardsEth = await this.getPooledEthByShares(cumulativeFeeShares);

        const excessBondShares = await this.getExcessBondShares(nodeOperatorID);
        const totalClaimableRewardsEth = await this.getPooledEthByShares(excessBondShares.excessBondShares);
        const totalRequiredBond = await this.getPooledEthByShares(excessBondShares.requiredBondShares);

        const distributedEth = await this.getDistributedShares(nodeOperatorID);
        const result = {
            nodeOperatorID: String(nodeOperatorID),
            nonWithdrawnKeys: String(excessBondShares.keys),
            totalRequiredBond: Number(totalRequiredBond.toFixed(4)),
            totalRewardsEth: Number(totalRewardsEth.toFixed(4)),
            excessBond: Number(totalClaimableRewardsEth.toFixed(4)),
            distributedEth: Number((distributedEth ?? 0).toFixed(4)),
            totalNodeOperatorEth: Number((totalRequiredBond + totalRewardsEth + totalClaimableRewardsEth).toFixed(4))
        };
        console.log('Final rewards calculation:', result);
        return result;

    }
}

export default CSMRewardsGetter;
