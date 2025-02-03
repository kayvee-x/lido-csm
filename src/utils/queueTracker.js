import { ethers } from 'ethers';

const CSM_ADDRESS = '0xdA7dE2ECdDfccC6c3AF10108Db212ACBBf9EA83F';
const CSM_ABI = [
    "function depositQueue() view returns (uint128 head, uint128 tail)",
    "function depositQueueItem(uint128 index) view returns (uint256)"
];

function parseQueueItem(item) {
    const hex = item.toString(16).padStart(64, '0');
    return {
        noId: BigInt('0x' + hex.substring(0, 16)),
        keysCount: BigInt('0x' + hex.substring(16, 32)),
        nextItem: BigInt('0x' + hex.substring(32))
    };
}

export async function getQueueData() {
    const provider = new ethers.JsonRpcProvider('https://ethereum-rpc.publicnode.com/', undefined, {
        batchMaxCount: 1, // Limit concurrent requests
        polling: false,
        staticNetwork: true
    });

    const contract = new ethers.Contract(CSM_ADDRESS, CSM_ABI, provider);

    try {
        const [head] = await contract.depositQueue();
        let nextItem = head;
        let position = 1;
        let queueEntries = [];

        // Process queue items in batches
        while (nextItem !== 0n && position <= 50) { // Limit to first 50 entries
            const item = await contract.depositQueueItem(nextItem);
            const { noId, keysCount, nextItem: newNext } = parseQueueItem(item);

            queueEntries.push({
                position,
                noId: noId.toString(),
                keysCount: keysCount.toString()
            });

            position++;
            nextItem = newNext;

            // Add small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return {
            entries: queueEntries,
            summary: {
                totalBatches: position - 1,
                totalKeys: queueEntries.reduce((sum, entry) => sum + BigInt(entry.keysCount), 0n).toString()
            }
        };
    } finally {
        provider.destroy(); // Cleanup provider
    }
}


